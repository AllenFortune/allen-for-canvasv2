
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
    
    // Try the /view endpoint first to get threaded discussion structure
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
      console.log(`Raw Canvas API response for discussion entries:`, JSON.stringify(entriesData, null, 2));
      
      // Process entries and extract nested replies
      const allEntries = flattenDiscussionEntries(entriesData);
      
      return new Response(
        JSON.stringify({ success: true, entries: allEntries }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const viewData = await response.json();
    console.log(`Raw Canvas API response for discussion view:`, JSON.stringify(viewData, null, 2));
    
    // Extract all entries from the view structure
    let allEntries = [];
    
    if (viewData.participants) {
      console.log(`Found ${viewData.participants.length} participants`);
    }
    
    if (viewData.view) {
      console.log(`Processing discussion view structure`);
      allEntries = extractEntriesFromView(viewData.view);
    } else if (viewData.entries) {
      console.log(`Processing entries from view response`);
      allEntries = flattenDiscussionEntries(viewData.entries);
    } else {
      console.log(`No recognized structure in view response, checking for direct entries array`);
      allEntries = Array.isArray(viewData) ? flattenDiscussionEntries(viewData) : [];
    }
    
    console.log(`Total entries processed: ${allEntries.length}`);
    
    if (allEntries.length > 0) {
      console.log(`Sample processed entry:`, JSON.stringify(allEntries[0], null, 2));
      
      // Log participation stats
      const uniqueUsers = [...new Set(allEntries.map(entry => entry.user_id))];
      console.log(`Unique participating users: ${uniqueUsers.length}`);
      
      uniqueUsers.forEach(userId => {
        const userEntries = allEntries.filter(entry => entry.user_id === userId);
        const userReplies = userEntries.filter(entry => entry.parent_id);
        const userName = userEntries[0]?.user?.display_name || userEntries[0]?.user_name || `User ${userId}`;
        console.log(`User "${userName}" (ID: ${userId}): ${userEntries.length} total posts, ${userReplies.length} replies`);
      });
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
function extractEntriesFromView(viewStructure: any[]): any[] {
  const allEntries: any[] = [];
  
  function processViewItem(item: any, parentId: number | null = null) {
    if (item.id && item.user_id) {
      // This is an entry
      const entry = {
        id: item.id,
        user_id: item.user_id,
        parent_id: parentId,
        created_at: item.created_at,
        updated_at: item.updated_at,
        rating_count: item.rating_count,
        rating_sum: item.rating_sum,
        user_name: item.user_name,
        message: item.message,
        user: item.user || {
          id: item.user_id,
          display_name: item.user_name,
          name: item.user_name
        },
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
    
    // If this item has children, process them
    if (item.replies && Array.isArray(item.replies)) {
      item.replies.forEach((child: any) => {
        processViewItem(child, item.id);
      });
    }
  }
  
  viewStructure.forEach(item => {
    processViewItem(item);
  });
  
  return allEntries;
}

// Function to flatten discussion entries and extract nested replies
function flattenDiscussionEntries(entries: any[]): any[] {
  const allEntries: any[] = [];
  
  function processEntry(entry: any, parentId: number | null = null) {
    // Normalize user data
    const normalizedEntry = {
      ...entry,
      parent_id: parentId,
      user: {
        id: entry.user_id,
        name: entry.user?.display_name || entry.user_name || `User ${entry.user_id}`,
        display_name: entry.user?.display_name || entry.user_name,
        email: entry.user?.email,
        avatar_url: entry.user?.avatar_image_url || entry.user?.avatar_url,
        avatar_image_url: entry.user?.avatar_image_url,
        sortable_name: entry.user?.sortable_name,
        html_url: entry.user?.html_url,
        pronouns: entry.user?.pronouns
      }
    };
    
    allEntries.push(normalizedEntry);
    
    // Process nested replies from recent_replies array
    if (entry.recent_replies && Array.isArray(entry.recent_replies)) {
      console.log(`Processing ${entry.recent_replies.length} recent replies for entry ${entry.id}`);
      entry.recent_replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
    
    // Process nested replies from replies array (alternative structure)
    if (entry.replies && Array.isArray(entry.replies)) {
      console.log(`Processing ${entry.replies.length} replies for entry ${entry.id}`);
      entry.replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
  }
  
  entries.forEach(entry => {
    processEntry(entry);
  });
  
  console.log(`Flattened ${entries.length} original entries into ${allEntries.length} total entries`);
  
  return allEntries;
}
