
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

    console.log(`Fetching quiz submissions for course ${courseId}, quiz ${quizId}, user: ${user.email}`);

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
    
    // First, fetch the quiz details
    const quizUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}`;
    console.log(`Fetching quiz details from: ${quizUrl}`);

    const quizResponse = await fetch(quizUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!quizResponse.ok) {
      const errorText = await quizResponse.text();
      console.error(`Canvas API error fetching quiz: ${quizResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${quizResponse.status}: ${quizResponse.statusText}`;
      if (quizResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (quizResponse.status === 404) {
        errorMessage = 'Quiz not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: quizResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData = await quizResponse.json();
    console.log(`Successfully fetched quiz details: ${quizData.title}`);
    
    // Then, fetch quiz submissions from Canvas API
    const submissionsUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes/${quizId}/submissions?per_page=100&include[]=submission&include[]=quiz&include[]=user`;
    
    console.log(`Making request to Canvas API: ${submissionsUrl}`);

    const submissionsResponse = await fetch(submissionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      console.error(`Canvas API error fetching submissions: ${submissionsResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${submissionsResponse.status}: ${submissionsResponse.statusText}`;
      if (submissionsResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (submissionsResponse.status === 404) {
        errorMessage = 'Quiz submissions not found or access denied.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: submissionsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const submissionsData = await submissionsResponse.json();
    
    console.log(`Successfully fetched ${submissionsData.quiz_submissions?.length || 0} quiz submissions from Canvas`);

    // Transform the data to match our expected format
    const transformedSubmissions = (submissionsData.quiz_submissions || []).map((submission: any) => ({
      id: submission.id,
      user_id: submission.user_id,
      quiz_id: submission.quiz_id,
      started_at: submission.started_at,
      finished_at: submission.finished_at,
      end_at: submission.end_at,
      attempt: submission.attempt,
      score: submission.score,
      kept_score: submission.kept_score,
      quiz_points_possible: submission.quiz_points_possible,
      workflow_state: submission.workflow_state,
      user: submissionsData.users?.find((u: any) => u.id === submission.user_id) || {
        id: submission.user_id,
        name: 'Unknown User',
        email: '',
        sortable_name: 'Unknown User'
      }
    }));

    // Return both quiz details and submissions
    return new Response(
      JSON.stringify({ 
        success: true,
        submissions: transformedSubmissions,
        quiz: {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          points_possible: quizData.points_possible,
          time_limit: quizData.time_limit,
          allowed_attempts: quizData.allowed_attempts,
          quiz_type: quizData.quiz_type
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-quiz-submissions function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz submissions from Canvas' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
