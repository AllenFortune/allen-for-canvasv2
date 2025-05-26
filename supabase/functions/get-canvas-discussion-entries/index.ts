
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
    
    // Fetch discussion entries with detailed logging
    const entriesUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/entries?include[]=user&per_page=100`;
    
    console.log(`Making Canvas API request to: ${entriesUrl}`);

    const response = await fetch(entriesUrl, {
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

    const entriesData = await response.json();
    
    console.log(`Raw Canvas API response for discussion entries:`, JSON.stringify(entriesData, null, 2));
    console.log(`Total entries received: ${entriesData?.length || 0}`);
    
    // Log detailed structure of first few entries
    if (entriesData && entriesData.length > 0) {
      console.log(`First entry structure:`, JSON.stringify(entriesData[0], null, 2));
      
      if (entriesData.length > 1) {
        console.log(`Second entry structure:`, JSON.stringify(entriesData[1], null, 2));
      }
      
      // Analyze parent_id relationships
      const entriesWithParentId = entriesData.filter(entry => entry.parent_id);
      console.log(`Entries with parent_id: ${entriesWithParentId.length}`);
      
      if (entriesWithParentId.length > 0) {
        console.log(`Sample entry with parent_id:`, JSON.stringify(entriesWithParentId[0], null, 2));
      }
      
      // Check for alternative reply indicators
      const entriesWithReplies = entriesData.filter(entry => entry.replies && entry.replies.length > 0);
      console.log(`Entries with replies array: ${entriesWithReplies.length}`);
      
      if (entriesWithReplies.length > 0) {
        console.log(`Entry with replies:`, JSON.stringify(entriesWithReplies[0], null, 2));
      }
      
      // Log user participation stats
      const uniqueUsers = [...new Set(entriesData.map(entry => entry.user_id))];
      console.log(`Unique participating users: ${uniqueUsers.length}`);
      
      uniqueUsers.forEach(userId => {
        const userEntries = entriesData.filter(entry => entry.user_id === userId);
        const userReplies = userEntries.filter(entry => entry.parent_id);
        const userName = userEntries[0]?.user?.display_name || userEntries[0]?.user_name || `User ${userId}`;
        console.log(`User "${userName}" (ID: ${userId}): ${userEntries.length} total posts, ${userReplies.length} replies`);
      });
    }
    
    return new Response(
      JSON.stringify({ success: true, entries: entriesData }),
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
