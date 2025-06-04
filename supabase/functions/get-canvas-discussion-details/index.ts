
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
    const { courseId, discussionId } = body;
    
    if (!courseId || !discussionId) {
      return new Response(
        JSON.stringify({ error: 'Course ID and Discussion ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.log('Discussion points_possible:', discussionData.points_possible);
    console.log('Assignment data:', discussionData.assignment ? JSON.stringify(discussionData.assignment, null, 2) : 'No assignment data');
    console.log('Assignment points_possible:', discussionData.assignment?.points_possible);
    
    // Ensure we properly extract points_possible
    let finalPointsPossible = null;
    
    // First try discussion.points_possible
    if (discussionData.points_possible !== null && discussionData.points_possible !== undefined) {
      finalPointsPossible = discussionData.points_possible;
      console.log('Using discussion.points_possible:', finalPointsPossible);
    }
    // Then try assignment.points_possible  
    else if (discussionData.assignment?.points_possible !== null && discussionData.assignment?.points_possible !== undefined) {
      finalPointsPossible = discussionData.assignment.points_possible;
      console.log('Using assignment.points_possible:', finalPointsPossible);
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
