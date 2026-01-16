
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

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile to retrieve Canvas credentials (decrypt token at database level)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('canvas_instance_url, decrypt_canvas_token(canvas_access_token) as canvas_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(JSON.stringify({ error: 'Canvas credentials not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseId, assignmentId, submissionId, grade, comment } = await req.json();

    console.log(`Grading submission ${submissionId} for assignment ${assignmentId} in course ${courseId}`);

    // Grade the submission
    const gradeResponse = await fetch(
      `${profile.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${profile.canvas_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission: {
            posted_grade: grade
          }
        })
      }
    );

    if (!gradeResponse.ok) {
      throw new Error(`Canvas API error while grading: ${gradeResponse.status} ${gradeResponse.statusText}`);
    }

    // Add comment if provided
    if (comment) {
      const commentResponse = await fetch(
        `${profile.canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/comments`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${profile.canvas_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: {
              text_comment: comment
            }
          })
        }
      );

      if (!commentResponse.ok) {
        console.warn(`Could not add comment: ${commentResponse.status} ${commentResponse.statusText}`);
      }
    }

    console.log(`Successfully graded submission`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
