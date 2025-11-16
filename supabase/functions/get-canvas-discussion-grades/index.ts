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
