
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { rubricId } = await req.json();

    // Get the rubric from database
    const { data: rubric, error: rubricError } = await supabase
      .from('rubrics')
      .select('*')
      .eq('id', rubricId)
      .eq('user_id', user.id)
      .single();

    if (rubricError || !rubric) {
      throw new Error('Rubric not found');
    }

    // Check if assignment ID and course ID are available
    if (!rubric.source_assignment_id || !rubric.course_id) {
      const missingFields = [];
      if (!rubric.source_assignment_id) missingFields.push('assignment ID');
      if (!rubric.course_id) missingFields.push('course ID');
      
      throw new Error(`Missing ${missingFields.join(' and ')}. Canvas rubrics require both assignment and course context.`);
    }

    // Get user's Canvas credentials
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      throw new Error('Canvas credentials not configured');
    }

    // Convert rubric to Canvas format
    const canvasRubric = convertToCanvasFormat(rubric);

    // Use the course ID from the rubric record
    const courseId = rubric.course_id;
    console.log('Using course ID:', courseId, 'for assignment:', rubric.source_assignment_id);

    // Create rubric in Canvas using the correct course-based endpoint
    const canvasUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}/rubrics`;
    
    console.log('Creating rubric at URL:', canvasUrl);
    
    const canvasResponse = await fetch(canvasUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rubric: canvasRubric }),
    });

    if (!canvasResponse.ok) {
      const errorText = await canvasResponse.text();
      console.error('Canvas API error response:', errorText);
      throw new Error(`Canvas API error: ${canvasResponse.status} - ${errorText}`);
    }

    const canvasRubricData = await canvasResponse.json();
    console.log('Successfully created Canvas rubric:', canvasRubricData.id);

    // Associate rubric with assignment
    if (rubric.source_assignment_id && canvasRubricData.id && courseId) {
      const associateUrl = `${profile.canvas_instance_url}/api/v1/courses/${courseId}/rubric_associations`;
      
      const associateResponse = await fetch(associateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.canvas_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rubric_association: {
            rubric_id: canvasRubricData.id,
            association_type: 'Assignment',
            association_id: rubric.source_assignment_id,
            use_for_grading: true,
            purpose: 'grading'
          }
        }),
      });

      if (!associateResponse.ok) {
        const associateError = await associateResponse.text();
        console.warn('Failed to associate rubric with assignment:', associateError);
        // Don't throw here since the rubric was created successfully
      } else {
        console.log('Successfully associated rubric with assignment');
      }
    }

    // Update the rubric in our database and increment usage count
    const { error: updateError } = await supabase
      .from('rubrics')
      .update({
        canvas_rubric_id: canvasRubricData.id,
        exported_to_canvas: true,
        usage_count: (rubric.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
        export_log: {
          exported_at: new Date().toISOString(),
          canvas_response: canvasRubricData,
          success: true
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', rubricId);

    if (updateError) {
      console.error('Failed to update rubric export status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        canvasRubricId: canvasRubricData.id,
        message: 'Rubric successfully exported to Canvas'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in export-rubric-to-canvas function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
