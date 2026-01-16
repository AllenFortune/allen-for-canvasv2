
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
    // Initialize Supabase client with service role key (same as get-canvas-courses)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // Get the user from the request (same authentication method as get-canvas-courses)
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
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    // Get Canvas credentials from the user's profile (decrypt token at database level)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, decrypt_canvas_token(canvas_access_token) as canvas_access_token')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile query error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials not configured for user:', user.email);
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching course ${courseId} from Canvas: ${profile.canvas_instance_url}`);

    // Fetch the specific course from Canvas
    const canvasUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}?include[]=term&include[]=total_students`
    
    const canvasResponse = await fetch(canvasUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
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
