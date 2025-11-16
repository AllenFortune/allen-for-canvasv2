import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

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
    const { supabase, user } = await authenticateUser(req);

    const { courseId, assignmentId, updatedContent, preserveFormatting = false } = await req.json();
    
    if (!courseId || !assignmentId || !updatedContent) {
      return new Response(
        JSON.stringify({ error: 'Course ID, Assignment ID, and updated content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;
    
    console.log(`Updating assignment ${assignmentId} in course ${courseId}`);

    // Convert text content to HTML if needed
    let htmlContent = updatedContent;
    if (!preserveFormatting) {
      // Convert plain text to basic HTML
      htmlContent = updatedContent
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
    }

    // Prepare the update payload
    const updatePayload = {
      assignment: {
        description: htmlContent
      }
    };

    // Update assignment in Canvas API
    const response = await fetch(`${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Assignment not found. Please check the assignment exists.';
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to update this assignment.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const updatedAssignment = await response.json();
    
    console.log(`Successfully updated assignment: ${updatedAssignment.name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Assignment updated successfully in Canvas',
        assignment: {
          id: updatedAssignment.id,
          name: updatedAssignment.name,
          updated_at: updatedAssignment.updated_at
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in update-canvas-assignment function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to update assignment in Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});