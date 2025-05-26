
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from './auth.ts';
import { fetchDiscussionView, fetchDiscussionEntries } from './canvas-api.ts';
import { createParticipantMap, extractEntriesFromView, flattenDiscussionEntries } from './data-processors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase, user } = await authenticateUser(req);
    const body = await req.json();
    const { courseId, discussionId } = body;

    console.log(`Fetching discussion entries for course ${courseId}, discussion ${discussionId}`);

    const { canvas_instance_url, canvas_access_token } = await getCanvasCredentials(supabase, user.id);
    
    // Try the /view endpoint first
    const viewData = await fetchDiscussionView(canvas_instance_url, canvas_access_token, courseId, discussionId);
    
    if (!viewData) {
      // Fallback to entries endpoint
      const entriesData = await fetchDiscussionEntries(canvas_instance_url, canvas_access_token, courseId, discussionId);
      const allEntries = flattenDiscussionEntries(entriesData);
      
      return new Response(
        JSON.stringify({ success: true, entries: allEntries }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Raw Canvas API response for discussion view received`);
    
    let allEntries = [];
    let participantMap = {};
    
    if (viewData.participants) {
      participantMap = createParticipantMap(viewData.participants);
    }
    
    if (viewData.view) {
      console.log(`Processing discussion view structure`);
      allEntries = extractEntriesFromView(viewData.view, participantMap);
    } else if (viewData.entries) {
      console.log(`Processing entries from view response`);
      allEntries = flattenDiscussionEntries(viewData.entries, participantMap);
    } else {
      console.log(`No recognized structure in view response`);
      allEntries = [];
    }
    
    console.log(`Total entries processed: ${allEntries.length}`);
    
    if (allEntries.length > 0) {
      const uniqueUsers = [...new Set(allEntries.map(entry => entry.user_id))];
      console.log(`Unique participating users: ${uniqueUsers.length}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, entries: allEntries }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-discussion-entries function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
