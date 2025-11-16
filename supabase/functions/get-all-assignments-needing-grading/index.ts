
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
    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;
    
    console.log(`Fetching all courses and assignments from Canvas: ${canvas_instance_url}`);

    // First, fetch all courses
    const coursesResponse = await fetch(`${canvas_instance_url}/api/v1/courses?enrollment_state=active&per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!coursesResponse.ok) {
      const errorText = await coursesResponse.text();
      console.error(`Canvas courses API error: ${coursesResponse.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${coursesResponse.status}: ${coursesResponse.statusText}`;
      
      if (coursesResponse.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (coursesResponse.status === 404) {
        errorMessage = 'Canvas URL not found. Please check your Canvas settings.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: coursesResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const coursesData = await coursesResponse.json();
    console.log(`Found ${coursesData.length} courses`);

    // Fetch assignments for each course
    const allAssignments = [];
    
    for (const course of coursesData) {
      try {
        const assignmentsResponse = await fetch(`${canvas_instance_url}/api/v1/courses/${course.id}/assignments?include[]=needs_grading_count&per_page=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          
          // Filter assignments that need grading and add course info
          const needsGradingAssignments = assignmentsData
            .filter(assignment => assignment.needs_grading_count > 0)
            .map(assignment => ({
              ...assignment,
              course_id: course.id,
              course_name: course.name,
              course_code: course.course_code
            }));
          
          allAssignments.push(...needsGradingAssignments);
          console.log(`Course "${course.name}": ${needsGradingAssignments.length} assignments need grading`);
        } else {
          console.warn(`Failed to fetch assignments for course ${course.id}: ${assignmentsResponse.status}`);
        }
      } catch (error) {
        console.warn(`Error fetching assignments for course ${course.id}:`, error);
      }
    }

    console.log(`Total assignments needing grading: ${allAssignments.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        assignments: allAssignments,
        total_count: allAssignments.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-all-assignments-needing-grading function:', error);
    
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
