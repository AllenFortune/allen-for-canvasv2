
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

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

    // Get user's Canvas credentials from profile (select raw columns)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt token via RPC if it appears encrypted (not in Canvas format: NNNN~XXXXX)
    let canvas_access_token = profile.canvas_access_token;
    const canvas_instance_url = profile.canvas_instance_url;

    if (!canvas_access_token.match(/^\d+~[A-Za-z0-9]+$/)) {
      console.log('Token appears encrypted, decrypting via RPC...');
      const { data: decryptedToken, error: decryptError } = await supabase.rpc('decrypt_canvas_token', {
        encrypted_token: canvas_access_token
      });
      
      if (decryptError || !decryptedToken) {
        console.error('Token decryption failed:', decryptError);
        return new Response(
          JSON.stringify({ error: 'Failed to decrypt Canvas token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      canvas_access_token = decryptedToken;
    }
    
    // First, get the discussion details to find the assignment_id
    const discussionUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}`;
    console.log(`Fetching discussion details from: ${discussionUrl}`);
    
    const discussionResponse = await fetch(discussionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!discussionResponse.ok) {
      const errorText = await discussionResponse.text();
      console.error(`Canvas API error fetching discussion: ${discussionResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Canvas API error: ${discussionResponse.status}` }),
        { status: discussionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const discussionData = await discussionResponse.json();
    console.log('Discussion data:', JSON.stringify(discussionData, null, 2));
    
    const assignmentId = discussionData.assignment_id;
    
    if (!assignmentId) {
      console.log('No assignment_id found for this discussion, returning empty grades');
      return new Response(
        JSON.stringify({ success: true, grades: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now fetch the submissions (grades) for this assignment with comments included
    const submissionsUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions?include[]=user&include[]=submission_comments&per_page=100`;
    console.log(`Fetching submissions from: ${submissionsUrl}`);
    
    const submissionsResponse = await fetch(submissionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      console.error(`Canvas API error fetching submissions: ${submissionsResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Canvas API error: ${submissionsResponse.status}` }),
        { status: submissionsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const submissionsData = await submissionsResponse.json();
    console.log(`Found ${submissionsData.length} submissions`);
    
    // Transform submissions into our grade format including comments
    const grades = submissionsData
      .filter(submission => submission.grade !== null || submission.score !== null)
      .map(submission => {
        console.log(`Processing submission for user ${submission.user_id}:`, {
          grade: submission.grade,
          score: submission.score,
          graded_at: submission.graded_at,
          comments_count: submission.submission_comments?.length || 0
        });
        
        return {
          user_id: submission.user_id,
          grade: submission.grade,
          score: submission.score,
          feedback: null, // Canvas submissions don't include feedback in this endpoint
          ai_grade_review: null,
          submission_comments: submission.submission_comments || []
        };
      });

    console.log(`Returning ${grades.length} existing grades with comments`);
    
    return new Response(
      JSON.stringify({ success: true, grades }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-canvas-discussion-grades function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
