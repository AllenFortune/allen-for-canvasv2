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
    // Authenticate user and get Canvas credentials
    const { supabase, user } = await authenticateUser(req);

    const body = await req.json();
    const { courseId, discussionId } = body;
    
    if (!courseId || !discussionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID and Discussion ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;
    
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}?include[]=assignment`;
    
    console.log(`Fetching discussion from: ${canvasUrl}`);
    
    const response = await fetch(canvasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Canvas API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const discussionData = await response.json();
    
    console.log('Raw Canvas discussion data received:', JSON.stringify(discussionData, null, 2));
    
    // Calculate the correct points_possible value from Canvas data
    let finalPointsPossible = null;
    
    // Priority 1: Check if assignment has a rubric with points
    if (discussionData.assignment?.rubric_settings?.points_possible) {
      finalPointsPossible = discussionData.assignment.rubric_settings.points_possible;
      console.log('Using rubric points_possible:', finalPointsPossible);
    }
    // Priority 2: Check assignment points_possible (but only if > 0 or explicitly set)
    else if (discussionData.assignment?.points_possible !== null && discussionData.assignment?.points_possible !== undefined) {
      finalPointsPossible = discussionData.assignment.points_possible;
      console.log('Using assignment points_possible:', finalPointsPossible);
    }
    // Priority 3: Check discussion points_possible (legacy)
    else if (discussionData.points_possible !== null && discussionData.points_possible !== undefined) {
      finalPointsPossible = discussionData.points_possible;
      console.log('Using discussion points_possible:', finalPointsPossible);
    }
    
    // Update the discussion object with the correct points_possible
    const processedDiscussion = {
      ...discussionData,
      points_possible: finalPointsPossible
    };
    
    console.log('Final processed discussion points_possible:', processedDiscussion.points_possible);
    
    return new Response(
      JSON.stringify({ success: true, discussion: processedDiscussion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-discussion-details function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
