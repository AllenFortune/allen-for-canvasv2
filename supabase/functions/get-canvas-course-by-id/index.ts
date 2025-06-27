
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the session from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing request for user: ${user.email}`)

    // Get Canvas credentials from the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the course ID from the request body
    const { courseId } = await req.json()
    
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching course ${courseId} from Canvas: ${profile.canvas_instance_url}`)

    // Fetch the specific course from Canvas
    const canvasUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}?include[]=term&include[]=total_students`
    
    const canvasResponse = await fetch(canvasUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Canvas API response status: ${canvasResponse.status}`)

    if (!canvasResponse.ok) {
      const errorText = await canvasResponse.text()
      console.error(`Canvas API error: ${canvasResponse.status} - ${errorText}`)
      
      if (canvasResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Course not found or you do not have access to it' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch course from Canvas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const course = await canvasResponse.json()
    
    console.log(`Successfully fetched course: ${course.name}`)

    return new Response(
      JSON.stringify({ course }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-canvas-course-by-id function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
