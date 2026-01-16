
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

    // Get user profile to retrieve Canvas credentials (select raw columns)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(JSON.stringify({ error: 'Canvas credentials not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt token via RPC if it appears encrypted (not in Canvas format: NNNN~XXXXX)
    let canvas_access_token = profile.canvas_access_token;
    const canvas_instance_url = profile.canvas_instance_url;

    if (!canvas_access_token.match(/^\d+~[A-Za-z0-9]+$/)) {
      console.log('Token appears encrypted, decrypting via RPC...');
      const { data: decryptedToken, error: decryptError } = await supabaseClient.rpc('decrypt_canvas_token', {
        encrypted_token: canvas_access_token
      });
      
      if (decryptError || !decryptedToken) {
        console.error('Token decryption failed:', decryptError);
        return new Response(JSON.stringify({ error: 'Failed to decrypt Canvas token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      canvas_access_token = decryptedToken;
    }

    const { courseId, assignmentId, submissionId, grade, comment } = await req.json();

    console.log(`Grading submission ${submissionId} for assignment ${assignmentId} in course ${courseId}`);

    // Grade the submission
    const gradeResponse = await fetch(
      `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
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
        `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/comments`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${canvas_access_token}`,
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
