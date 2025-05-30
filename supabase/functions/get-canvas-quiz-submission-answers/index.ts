
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
    const { courseId, quizId, submissionId } = body;
    
    if (!courseId || !quizId || !submissionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Quiz ID, and Submission ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quiz submission answers for course ${courseId}, quiz ${quizId}, submission ${submissionId}, user: ${user.email}`);

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
    
    // Fetch detailed answers for the specific submission
    const answersUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/questions`;
    console.log(`Fetching submission answers from: ${answersUrl}`);

    const answersResponse = await fetch(answersUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!answersResponse.ok) {
      const errorText = await answersResponse.text();
      console.error(`Canvas API error fetching submission answers: ${answersResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${answersResponse.status}: ${answersResponse.statusText}`;
      if (answersResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (answersResponse.status === 404) {
        errorMessage = 'Submission answers not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: answersResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const answersData = await answersResponse.json();
    console.log(`Successfully fetched ${answersData.quiz_submission_questions?.length || 0} submission answers from Canvas`);

    return new Response(
      JSON.stringify({ 
        success: true,
        submission_id: submissionId,
        answers: answersData.quiz_submission_questions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-quiz-submission-answers function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz submission answers from Canvas' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
