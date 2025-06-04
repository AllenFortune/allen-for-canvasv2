
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request body
    const body = await req.json();
    const { courseId } = body;
    
    if (!courseId) {
      console.error('Course ID is missing from request');
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing request for course ID: ${courseId}, user: ${user.email}`);

    // Get user's Canvas credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error('Canvas credentials not configured for user:', user.email);
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    console.log(`Fetching discussions for course ${courseId} from Canvas: ${canvas_instance_url}`);

    // Fetch discussions from Canvas API with proper parameters
    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics?per_page=100&include[]=unread_count&include[]=assignment`;
    
    console.log(`Making request to Canvas API: ${canvasUrl}`);

    const response = await fetch(canvasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`Canvas API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Course not found or Canvas URL not found. Please check your Canvas settings.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You may not have permission to view discussions for this course.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const discussionsData = await response.json();
    
    console.log(`Successfully fetched ${discussionsData.length} discussions from Canvas`);
    console.log('Sample discussion data:', discussionsData[0] ? JSON.stringify(discussionsData[0], null, 2) : 'No discussions found');

    // For graded discussions, fetch grading data
    const enhancedDiscussions = await Promise.all(
      discussionsData.map(async (discussion: any) => {
        const transformedDiscussion = {
          id: discussion.id,
          title: discussion.title,
          posted_at: discussion.posted_at,
          discussion_type: discussion.discussion_type || 'discussion',
          unread_count: discussion.unread_count || 0,
          todo_date: discussion.todo_date,
          assignment_id: discussion.assignment_id,
          is_assignment: !!discussion.assignment_id
        };

        // If this is a graded discussion, fetch grading information
        if (discussion.assignment_id) {
          try {
            const gradingUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${discussion.assignment_id}/submissions?include[]=user&per_page=100`;
            
            const gradingResponse = await fetch(gradingUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${canvas_access_token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });

            if (gradingResponse.ok) {
              const submissions = await gradingResponse.json();
              
              // Count submissions that need grading vs are graded
              let needsGrading = 0;
              let graded = 0;
              let totalSubmissions = 0;

              submissions.forEach((submission: any) => {
                // Only count submissions that have been submitted (not just enrolled students)
                if (submission.submitted_at) {
                  totalSubmissions++;
                  if (submission.workflow_state === 'graded' && submission.score !== null) {
                    graded++;
                  } else {
                    needsGrading++;
                  }
                }
              });

              return {
                ...transformedDiscussion,
                needs_grading_count: needsGrading,
                graded_count: graded,
                total_submissions: totalSubmissions
              };
            }
          } catch (error) {
            console.error(`Error fetching grading data for discussion ${discussion.id}:`, error);
          }
        }

        return transformedDiscussion;
      })
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        discussions: enhancedDiscussions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-canvas-discussions function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch discussions from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
