
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
    console.log('Starting get-canvas-assignment-details function');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header received:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user with better error handling
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('Supabase auth error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id, user.email);

    // Get user profile to retrieve Canvas credentials
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile', details: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials missing:', { hasUrl: !!profile?.canvas_instance_url, hasToken: !!profile?.canvas_access_token });
      return new Response(JSON.stringify({ error: 'Canvas credentials not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseId, assignmentId } = await req.json();

    console.log(`Fetching assignment details for assignment ${assignmentId} in course ${courseId}`);
    console.log('Canvas URL:', profile.canvas_instance_url);

    // Fetch assignment details from Canvas with include parameters to get full description
    const assignmentUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}?include[]=description&include[]=rubric_criteria`;
    console.log('Making Canvas API request to:', assignmentUrl);

    const assignmentResponse = await fetch(assignmentUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!assignmentResponse.ok) {
      const errorText = await assignmentResponse.text();
      console.error(`Canvas API error: ${assignmentResponse.status} ${assignmentResponse.statusText} - ${errorText}`);
      
      if (assignmentResponse.status === 401) {
        return new Response(JSON.stringify({ error: 'Canvas API authentication failed. Please check your Canvas access token.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Canvas API error: ${assignmentResponse.status} ${assignmentResponse.statusText}`);
    }

    const assignment = await assignmentResponse.json();
    console.log('Successfully fetched assignment details:', assignment.name);
    console.log('Assignment description length:', assignment.description?.length || 0);
    console.log('Assignment description preview:', assignment.description?.substring(0, 100) || 'No description');

    return new Response(JSON.stringify({ assignment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching assignment details:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
