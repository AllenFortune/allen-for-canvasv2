
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
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token!);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { courseId, discussionId } = body;

    console.log(`Fetching discussion entries for course ${courseId}, discussion ${discussionId}`);

    const { data: profile } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    // Use the /view endpoint to get threaded discussion structure with participants
    const viewUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/view`;
    
    console.log(`Making Canvas API request to: ${viewUrl}`);

    const response = await fetch(viewUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Canvas API error: ${response.status} - ${await response.text()}`);
      
      // Fallback to entries endpoint if view doesn't work
      const entriesUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/entries?include[]=user&per_page=100`;
      console.log(`Falling back to entries endpoint: ${entriesUrl}`);
      
      const entriesResponse = await fetch(entriesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!entriesResponse.ok) {
        const errorText = await entriesResponse.text();
        console.error(`Canvas API entries error: ${entriesResponse.status} - ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Canvas API error: ${entriesResponse.status}` }),
          { status: entriesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const entriesData = await entriesResponse.json();
      const allEntries = flattenDiscussionEntries(entriesData);
      
      return new Response(
        JSON.stringify({ success: true, entries: allEntries }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const viewData = await response.json();
    console.log(`Raw Canvas API response for discussion view received`);
    
    // Extract all entries from the view structure with participant data
    let allEntries = [];
    let participantMap = {};
    
    // Create participant lookup map for better user names
    if (viewData.participants) {
      console.log(`Found ${viewData.participants.length} participants`);
      viewData.participants.forEach(participant => {
        participantMap[participant.id] = {
          id: participant.id,
          name: participant.display_name || participant.name || `User ${participant.id}`,
          display_name: participant.display_name,
          email: participant.email,
          avatar_url: participant.avatar_image_url,
          avatar_image_url: participant.avatar_image_url,
          sortable_name: participant.sortable_name,
          html_url: participant.html_url,
          pronouns: participant.pronouns
        };
      });
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
      // Log participation stats
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

// Function to extract entries from Canvas discussion view structure
function extractEntriesFromView(viewStructure: any[], participantMap: any = {}): any[] {
  const allEntries: any[] = [];
  
  function processViewItem(item: any, parentId: number | null = null) {
    if (item.id && item.user_id) {
      // Get user info from participant map or fallback
      const userInfo = participantMap[item.user_id] || {
        id: item.user_id,
        name: item.user_name || `User ${item.user_id}`,
        display_name: item.user_name
      };
      
      const entry = {
        id: item.id,
        user_id: item.user_id,
        parent_id: parentId,
        created_at: item.created_at,
        updated_at: item.updated_at,
        rating_count: item.rating_count,
        rating_sum: item.rating_sum,
        user_name: userInfo.name,
        message: item.message,
        user: userInfo,
        read_state: item.read_state,
        forced_read_state: item.forced_read_state
      };
      
      allEntries.push(entry);
      
      // Process replies if they exist
      if (item.replies && Array.isArray(item.replies)) {
        item.replies.forEach((reply: any) => {
          processViewItem(reply, item.id);
        });
      }
    }
  }
  
  viewStructure.forEach(item => {
    processViewItem(item);
  });
  
  return allEntries;
}

// Function to flatten discussion entries and extract nested replies
function flattenDiscussionEntries(entries: any[], participantMap: any = {}): any[] {
  const allEntries: any[] = [];
  
  function processEntry(entry: any, parentId: number | null = null) {
    // Get user info from participant map or fallback
    const userInfo = participantMap[entry.user_id] || {
      id: entry.user_id,
      name: entry.user?.display_name || entry.user_name || `User ${entry.user_id}`,
      display_name: entry.user?.display_name || entry.user_name,
      email: entry.user?.email,
      avatar_url: entry.user?.avatar_image_url || entry.user?.avatar_url,
      avatar_image_url: entry.user?.avatar_image_url,
      sortable_name: entry.user?.sortable_name,
      html_url: entry.user?.html_url,
      pronouns: entry.user?.pronouns
    };
    
    // Normalize user data
    const normalizedEntry = {
      ...entry,
      parent_id: parentId,
      user_name: userInfo.name,
      user: userInfo
    };
    
    allEntries.push(normalizedEntry);
    
    // Process nested replies from recent_replies array
    if (entry.recent_replies && Array.isArray(entry.recent_replies)) {
      entry.recent_replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
    
    // Process nested replies from replies array (alternative structure)
    if (entry.replies && Array.isArray(entry.replies)) {
      entry.replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
  }
  
  entries.forEach(entry => {
    processEntry(entry);
  });
  
  return allEntries;
}
