
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { courseId, quizId } = body;
    
    if (!courseId || !quizId) {
      return new Response(
        JSON.stringify({ error: 'Course ID and Quiz ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quiz questions for course ${courseId}, quiz ${quizId}, user: ${user.email}`);

    // Decrypt token at database level
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, decrypt_canvas_token(canvas_access_token) as canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    // Fetch quiz questions from Canvas API
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/questions?per_page=100`;
    
    console.log(`Making request to Canvas API: ${canvasUrl}`);

    const response = await fetch(canvasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Quiz questions not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const questionsData = await response.json();
    
    console.log(`Successfully fetched ${questionsData.length} quiz questions from Canvas`);

    // Filter questions that require manual grading (essay and fill-in-the-blank)
    const manualGradingQuestions = questionsData.filter((question: any) => 
      question.question_type === 'essay_question' || 
      question.question_type === 'fill_in_multiple_blanks_question' ||
      question.question_type === 'file_upload_question'
    );

    console.log(`Found ${manualGradingQuestions.length} questions requiring manual grading`);

    return new Response(
      JSON.stringify({ 
        success: true,
        questions: questionsData,
        manualGradingQuestions: manualGradingQuestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-quiz-questions function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz questions from Canvas' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
