
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

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
    // Authenticate user and get Canvas credentials
    const { supabase, user } = await authenticateUser(req);

    // Get request body
    const { courseId } = await req.json();
    
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;
    
    console.log(`Fetching assignments for course ${courseId} from Canvas: ${canvas_instance_url}`);

    // Fetch assignments from Canvas API
    const response = await fetch(`${canvas_instance_url}/api/v1/courses/${courseId}/assignments?include[]=needs_grading_count&per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Course not found or Canvas URL not found. Please check your Canvas settings.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const assignmentsData = await response.json();
    
    // Filter out discussions and quizzes to only show true assignments
    const filteredAssignments = assignmentsData.filter((assignment: any) => {
      // Exclude assignments that are discussions or quizzes
      const submissionTypes = assignment.submission_types || [];
      
      // Filter out discussion topics and online quizzes
      const isDiscussion = submissionTypes.includes('discussion_topic');
      const isQuiz = submissionTypes.includes('online_quiz');
      
      // Only include assignments that are not discussions or quizzes
      return !isDiscussion && !isQuiz;
    });
    
    console.log(`Fetched ${assignmentsData.length} total assignments, filtered to ${filteredAssignments.length} true assignments`);

    return new Response(
      JSON.stringify({ 
        success: true,
        assignments: filteredAssignments
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-canvas-assignments function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch assignments from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
