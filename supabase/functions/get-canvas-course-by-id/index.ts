
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user and get Canvas credentials
    const { supabase, user } = await authenticateUser(req);
    console.log(`Processing request for user: ${user.email}`);

    // Get the course ID from the request body
    const { courseId } = await req.json()
    
    if (!courseId) {
      console.error('Course ID not provided in request body');
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Attempting to fetch course ${courseId} for user ${user.email}`);

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;

    console.log(`Fetching course ${courseId} from Canvas: ${canvas_instance_url}`);

    // Fetch the specific course from Canvas
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}?include[]=term&include[]=total_students`
    
    const canvasResponse = await fetch(canvasUrl, {
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Canvas API response status: ${canvasResponse.status}`);

    if (!canvasResponse.ok) {
      const errorText = await canvasResponse.text()
      console.error(`Canvas API error: ${canvasResponse.status} - ${errorText}`)
      
      if (canvasResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid Canvas API token. Please check your Canvas settings.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (canvasResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Course not found or you do not have access to it' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (canvasResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this course' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: `Canvas API error: ${canvasResponse.status} ${canvasResponse.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const course = await canvasResponse.json()
    
    console.log(`Successfully fetched course: ${course.name} (ID: ${course.id})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        course 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-canvas-course-by-id function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
