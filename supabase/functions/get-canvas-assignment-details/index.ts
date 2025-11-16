
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

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
    
    // Authenticate user and get Canvas credentials
    const { supabase, user } = await authenticateUser(req);
    console.log('User authenticated:', user.id, user.email);

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url: profile_canvas_instance_url, canvas_access_token: profile_canvas_access_token } = credentials;

    const { courseId, assignmentId } = await req.json();

    console.log(`Fetching assignment details for assignment ${assignmentId} in course ${courseId}`);
    console.log('Canvas URL:', profile_canvas_instance_url);

    // Fetch assignment details from Canvas with include parameters to get full description
    const assignmentUrl = `${profile_canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}?include[]=description&include[]=rubric_criteria`;
    console.log('Making Canvas API request to:', assignmentUrl);

    const assignmentResponse = await fetch(assignmentUrl, {
      headers: {
        'Authorization': `Bearer ${profile_canvas_access_token}`,
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
