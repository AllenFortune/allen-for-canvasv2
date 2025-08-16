
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

interface RubricData {
  id: string;
  title: string;
  description: string;
  rubric_type: string;
  points_possible: number;
  criteria: RubricCriterion[];
  performance_levels: string[];
  source_assignment_id?: number;
  course_id?: number;
  user_id: string;
}

function convertToCanvasFormat(rubric: RubricData) {
  const canvasRubric = {
    title: rubric.title,
    points_possible: rubric.points_possible,
    criteria: {} as Record<string, any>
  };

  // Convert criteria to Canvas format
  rubric.criteria.forEach((criterion, index) => {
    const criterionId = `criterion_${index}`;
    canvasRubric.criteria[criterionId] = {
      description: criterion.name,
      long_description: criterion.description,
      points: criterion.points,
      ratings: {} as Record<string, any>
    };

    // Convert levels to Canvas ratings
    criterion.levels.forEach((level, levelIndex) => {
      const ratingId = `rating_${levelIndex}`;
      canvasRubric.criteria[criterionId].ratings[ratingId] = {
        description: level.name,
        long_description: level.description,
        points: level.points
      };
    });
  });

  return canvasRubric;
}

serve(async (req) => {
  // Generate request ID for debugging
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();
  
  // Handle CORS preflight requests with explicit 200 status
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`);
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log(`[${requestId}] Starting rubric export request`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    console.log(`[${requestId}] Verifying user authentication`);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    console.log(`[${requestId}] User authenticated: ${user.id}`);

    const requestBody = await req.json();
    const { rubricId, assignmentId, discussionId, courseId, associationType = 'assignment' } = requestBody;
    
    console.log(`[${requestId}] Request parameters:`, {
      rubricId,
      assignmentId,
      discussionId,
      courseId,
      associationType
    });

    // Get the rubric from database
    console.log(`[${requestId}] Fetching rubric from database`);
    const { data: rubric, error: rubricError } = await supabase
      .from('rubrics')
      .select('*')
      .eq('id', rubricId)
      .eq('user_id', user.id)
      .single();

    if (rubricError || !rubric) {
      console.error(`[${requestId}] Rubric not found:`, rubricError);
      throw new Error('Rubric not found');
    }

    console.log(`[${requestId}] Found rubric: ${rubric.title}`);

    // Use provided IDs or fall back to database values
    const finalAssignmentId = assignmentId || rubric.source_assignment_id;
    const finalDiscussionId = discussionId;
    const finalCourseId = courseId || rubric.course_id;

    console.log(`[${requestId}] Final IDs after resolution:`, {
      finalAssignmentId,
      finalDiscussionId,
      finalCourseId,
      associationType
    });

    // Improved validation logic with better error messages
    if (!finalCourseId) {
      throw new Error('Missing course ID. Please select a course for the rubric export.');
    }

    if (associationType === 'assignment' && !finalAssignmentId) {
      throw new Error('Missing assignment ID. Please select an assignment for the rubric export.');
    }

    if (associationType === 'discussion' && !finalDiscussionId) {
      throw new Error('Missing discussion ID. Please select a discussion for the rubric export.');
    }

    console.log(`[${requestId}] Validation passed for ${associationType} export`);

    // Get user's Canvas credentials
    console.log(`[${requestId}] Fetching Canvas credentials`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      console.error(`[${requestId}] Canvas credentials not found:`, profileError);
      throw new Error('Canvas credentials not configured. Please connect your Canvas account in Settings.');
    }

    console.log(`[${requestId}] Canvas credentials found for instance: ${profile.canvas_instance_url}`);

    // Convert rubric to Canvas format
    console.log(`[${requestId}] Converting rubric to Canvas format`);
    const canvasRubric = convertToCanvasFormat(rubric);

    // Determine the content ID based on association type
    const contentId = associationType === 'assignment' ? finalAssignmentId : finalDiscussionId;
    console.log(`[${requestId}] Using course ID: ${finalCourseId} for ${associationType}: ${contentId}`);

    // Create rubric in Canvas using the correct course-based endpoint
    const canvasUrl = `${profile.canvas_instance_url}/api/v1/courses/${finalCourseId}/rubrics`;
    
    console.log(`[${requestId}] Creating rubric at URL: ${canvasUrl}`);
    console.log(`[${requestId}] Sending rubric data:`, JSON.stringify(canvasRubric, null, 2));
    
    const canvasRequestStart = Date.now();
    const canvasResponse = await fetch(canvasUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rubric: canvasRubric }),
    });
    const canvasRequestTime = Date.now() - canvasRequestStart;

    console.log(`[${requestId}] Canvas API Response Status: ${canvasResponse.status} (took ${canvasRequestTime}ms)`);
    console.log(`[${requestId}] Canvas API Response Headers:`, Object.fromEntries(canvasResponse.headers.entries()));

    if (!canvasResponse.ok) {
      const errorText = await canvasResponse.text();
      console.error(`[${requestId}] Canvas API error response:`, errorText);
      throw new Error(`Canvas API error: ${canvasResponse.status} - ${errorText}`);
    }

    const canvasRubricData = await canvasResponse.json();
    console.log(`[${requestId}] Full Canvas API Response:`, JSON.stringify(canvasRubricData, null, 2));

    // Extract rubric ID with multiple fallback strategies
    let canvasRubricId: number | null = null;
    
    if (canvasRubricData?.id) {
      canvasRubricId = canvasRubricData.id;
      console.log(`[${requestId}] Found rubric ID directly: ${canvasRubricId}`);
    } else if (canvasRubricData?.rubric?.id) {
      canvasRubricId = canvasRubricData.rubric.id;
      console.log(`[${requestId}] Found rubric ID in nested rubric object: ${canvasRubricId}`);
    } else if (Array.isArray(canvasRubricData) && canvasRubricData[0]?.id) {
      canvasRubricId = canvasRubricData[0].id;
      console.log(`[${requestId}] Found rubric ID in array response: ${canvasRubricId}`);
    } else {
      console.error(`[${requestId}] Could not extract rubric ID from Canvas response. Full response:`, canvasRubricData);
      throw new Error('Canvas API did not return a valid rubric ID. Please check the Canvas response structure.');
    }

    if (!canvasRubricId) {
      throw new Error('Failed to extract rubric ID from Canvas response');
    }

    console.log(`[${requestId}] Successfully created Canvas rubric with ID: ${canvasRubricId}`);

    // Associate rubric with assignment or discussion
    const canvasAssociationType = associationType === 'assignment' ? 'Assignment' : 'DiscussionTopic';
    
    if (contentId && canvasRubricId && finalCourseId) {
      const associateUrl = `${profile.canvas_instance_url}/api/v1/courses/${finalCourseId}/rubric_associations`;
      
      console.log(`[${requestId}] Associating rubric with ${associationType} at URL: ${associateUrl}`);
      console.log(`[${requestId}] Association data:`, {
        rubric_id: canvasRubricId,
        association_type: canvasAssociationType,
        association_id: contentId,
        use_for_grading: true,
        purpose: 'grading'
      });
      
      const associateRequestStart = Date.now();
      const associateResponse = await fetch(associateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.canvas_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rubric_association: {
            rubric_id: canvasRubricId,
            association_type: canvasAssociationType,
            association_id: contentId,
            use_for_grading: true,
            purpose: 'grading'
          }
        }),
      });
      const associateRequestTime = Date.now() - associateRequestStart;

      console.log(`[${requestId}] Association Response Status: ${associateResponse.status} (took ${associateRequestTime}ms)`);

      if (!associateResponse.ok) {
        const associateError = await associateResponse.text();
        console.error(`[${requestId}] Failed to associate rubric with ${associationType}:`, associateError);
        // Don't throw here since the rubric was created successfully
        console.warn(`[${requestId}] Rubric created but association failed. The rubric exists in Canvas but may not be attached to the ${associationType}.`);
      } else {
        const associateData = await associateResponse.json();
        console.log(`[${requestId}] Successfully associated rubric with ${associationType}:`, associateData);
      }
    }

    // Update the rubric in our database and increment usage count
    console.log(`[${requestId}] Updating rubric in database`);
    const { error: updateError } = await supabase
      .from('rubrics')
      .update({
        canvas_rubric_id: canvasRubricId,
        exported_to_canvas: true,
        usage_count: (rubric.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
        export_log: {
          exported_at: new Date().toISOString(),
          canvas_response: canvasRubricData,
          success: true,
          rubric_id: canvasRubricId,
          request_id: requestId
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', rubricId);

    if (updateError) {
      console.error(`[${requestId}] Failed to update rubric export status:`, updateError);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] Export completed successfully in ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        canvasRubricId: canvasRubricId,
        message: 'Rubric successfully exported to Canvas',
        debugInfo: {
          canvasResponse: canvasRubricData,
          extractedRubricId: canvasRubricId,
          requestId,
          totalTime: `${totalTime}ms`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] Error in export-rubric-to-canvas function (after ${totalTime}ms):`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        debugInfo: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name,
          requestId,
          totalTime: `${totalTime}ms`
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
