
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
    console.log('Starting get-canvas-assignment-submissions function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user with better error handling
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('Supabase auth error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id, user.email);

    // Get user profile to retrieve Canvas credentials (decrypt token at database level)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('canvas_instance_url, decrypt_canvas_token(canvas_access_token) as canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile', details: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials missing:', { hasUrl: !!profile?.canvas_instance_url, hasToken: !!profile?.canvas_access_token });
      return new Response(JSON.stringify({ error: 'Canvas credentials not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseId, assignmentId } = await req.json();

    console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId}`);
    console.log('Canvas URL:', profile.canvas_instance_url);

    // First, fetch all enrolled students in the course
    const enrollmentsUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}/enrollments?type[]=StudentEnrollment&state[]=active&per_page=100`;
    console.log('Fetching enrollments from:', enrollmentsUrl);

    const enrollmentsResponse = await fetch(enrollmentsUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    let enrolledStudents = [];
    if (enrollmentsResponse.ok) {
      enrolledStudents = await enrollmentsResponse.json();
      console.log(`Found ${enrolledStudents.length} enrolled students`);
    } else {
      console.warn('Failed to fetch enrollments:', enrollmentsResponse.status, enrollmentsResponse.statusText);
    }

    // Fetch submissions with student information
    const submissionsUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions?include[]=user&include[]=submission_comments&include[]=submission_history&include[]=attachments&per_page=100`;
    console.log('Fetching submissions from:', submissionsUrl);

    const submissionsResponse = await fetch(submissionsUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      console.error(`Canvas API error: ${submissionsResponse.status} ${submissionsResponse.statusText} - ${errorText}`);
      throw new Error(`Canvas API error: ${submissionsResponse.status} ${submissionsResponse.statusText}`);
    }

    const submissions = await submissionsResponse.json();
    console.log(`Canvas returned ${submissions.length} submission records`);

    // If we didn't get submissions for all enrolled students, we need to create placeholder submissions
    const submissionsByUserId = new Map();
    submissions.forEach((sub: any) => {
      submissionsByUserId.set(sub.user_id, sub);
    });

    // Create a complete list that includes all enrolled students
    const allSubmissions = [];

    // Add existing submissions
    submissions.forEach((submission: any) => {
      allSubmissions.push({
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
      });
    });

    // Add enrolled students who don't have submission records
    enrolledStudents.forEach((enrollment: any) => {
      if (!submissionsByUserId.has(enrollment.user_id)) {
        console.log(`Creating placeholder submission for student: ${enrollment.user?.name || 'Unknown'}`);
        allSubmissions.push({
          id: `placeholder_${enrollment.user_id}`,
          user_id: enrollment.user_id,
          assignment_id: parseInt(assignmentId),
          submitted_at: null,
          graded_at: null,
          grade: null,
          score: null,
          submission_comments: [],
          body: null,
          url: null,
          attachments: [],
          workflow_state: 'unsubmitted',
          late: false,
          missing: true,
          submission_type: null,
          user: {
            id: enrollment.user?.id,
            name: enrollment.user?.name || 'Unknown User',
            email: enrollment.user?.email || '',
            avatar_url: enrollment.user?.avatar_url,
            sortable_name: enrollment.user?.sortable_name || enrollment.user?.name || 'Unknown User'
          }
        });
      }
    });

    console.log(`Successfully processed ${allSubmissions.length} total submission records (including enrolled students)`);

    return new Response(JSON.stringify({ submissions: allSubmissions }), {
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
