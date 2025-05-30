
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
    const { courseId, quizId, submissionId, questionId, score, comment } = body;
    
    if (!courseId || !quizId || !submissionId || !questionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, Submission ID, and Question ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Grading quiz question for course ${courseId}, quiz ${quizId}, submission ${submissionId}, question ${questionId}, user: ${user.email}`);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    // Grade quiz question via Canvas API
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/questions/${questionId}`;
    
    console.log(`Making request to Canvas API: ${canvasUrl}`);

    const gradeData: any = {};
    if (score !== undefined && score !== null) {
      gradeData.question_score = parseFloat(score);
    }
    if (comment) {
      gradeData.comment = comment;
    }

    const response = await fetch(canvasUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(gradeData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Quiz submission not found or access denied.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid grading data provided.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    
    console.log(`Successfully graded quiz question ${questionId} for submission ${submissionId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Quiz question graded successfully',
        result: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grade-canvas-quiz-question function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to grade quiz question' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
