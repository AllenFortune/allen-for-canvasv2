
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request body
    const body = await req.json();
    const { courseId } = body;
    
    if (!courseId) {
      console.error('Course ID is missing from request');
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing request for course ID: ${courseId}, user: ${user.email}`);

    // Get user's Canvas credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials not configured for user:', user.email);
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    console.log(`Fetching quizzes for course ${courseId} from Canvas: ${canvas_instance_url}`);

    // Fetch quizzes from Canvas API with proper parameters
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/quizzes?per_page=100&include[]=assignment&include[]=all_dates`;
    
    console.log(`Making request to Canvas API: ${canvasUrl}`);

    const response = await fetch(canvasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`Canvas API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Course not found or Canvas URL not found. Please check your Canvas settings.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You may not have permission to view quizzes for this course.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const quizzesData = await response.json();
    
    console.log(`Successfully fetched ${quizzesData.length} quizzes from Canvas`);
    console.log('Sample quiz data:', quizzesData[0] ? JSON.stringify(quizzesData[0], null, 2) : 'No quizzes found');

    // Transform the data to match our expected format
    const transformedQuizzes = quizzesData.map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title,
      due_at: quiz.due_at,
      points_possible: quiz.points_possible,
      quiz_type: quiz.quiz_type || 'practice_quiz',
      time_limit: quiz.time_limit,
      allowed_attempts: quiz.allowed_attempts,
      published: quiz.published,
      assignment_id: quiz.assignment_id,
      is_assignment: !!quiz.assignment_id,
      needs_grading_count: 0 // Quizzes don't typically have a needs_grading_count like assignments
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        quizzes: transformedQuizzes
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-canvas-quizzes function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quizzes from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
