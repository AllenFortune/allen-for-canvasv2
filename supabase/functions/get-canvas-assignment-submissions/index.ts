
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile to retrieve Canvas credentials
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(JSON.stringify({ error: 'Canvas credentials not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseId, assignmentId } = await req.json();

    console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId} from Canvas: ${profile.canvas_instance_url}`);

    // First, try to get all enrolled students for this course
    const studentsResponse = await fetch(
      `${profile.canvas_instance_url}/api/v1/courses/${courseId}/enrollments?type[]=StudentEnrollment&state[]=active&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${profile.canvas_access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!studentsResponse.ok) {
      console.log('Failed to fetch students, falling back to submissions API');
    }

    // Fetch submissions - Canvas should return records for ALL enrolled students
    const submissionsResponse = await fetch(
      `${profile.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions?include[]=user&include[]=submission_comments&include[]=submission_history&include[]=attachments&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${profile.canvas_access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      console.error(`Canvas API error: ${submissionsResponse.status} ${submissionsResponse.statusText} - ${errorText}`);
      throw new Error(`Canvas API error: ${submissionsResponse.status} ${submissionsResponse.statusText}`);
    }

    const submissions = await submissionsResponse.json();
    
    console.log(`Canvas API returned ${submissions.length} submission records`);
    
    // Log a sample submission to understand the data structure
    if (submissions.length > 0) {
      console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
    }

    // Canvas returns submissions for ALL enrolled students, including those who haven't submitted
    // Each enrolled student gets a submission record, even if they haven't submitted anything
    const processedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      user_id: submission.user_id,
      assignment_id: submission.assignment_id,
      submitted_at: submission.submitted_at,
      graded_at: submission.graded_at,
      grade: submission.grade,
      score: submission.score,
      submission_comments: submission.submission_comments || [],
      body: submission.body,
      url: submission.url,
      attachments: submission.attachments || [],
      workflow_state: submission.workflow_state,
      late: submission.late || false,
      missing: submission.missing || false,
      submission_type: submission.submission_type,
      user: {
        id: submission.user?.id,
        name: submission.user?.name || 'Unknown User',
        email: submission.user?.email || '',
        avatar_url: submission.user?.avatar_url,
        sortable_name: submission.user?.sortable_name || submission.user?.name || 'Unknown User'
      }
    }));

    console.log(`Successfully processed ${processedSubmissions.length} submission records from Canvas`);

    return new Response(JSON.stringify({ submissions: processedSubmissions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
