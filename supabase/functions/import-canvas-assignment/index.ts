import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request body
    const { courseId, assignmentId } = await req.json();
    
    if (!courseId || !assignmentId) {
      return new Response(
        JSON.stringify({ error: 'Course ID and Assignment ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
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
    
    console.log(`Importing assignment ${assignmentId} from course ${courseId}`);

    // Fetch assignment details from Canvas API with comprehensive includes
    const response = await fetch(`${canvas_instance_url}/api/v1/courses/${courseId}/assignments/${assignmentId}?include[]=description&include[]=rubric_criteria&include[]=submission`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
      } else if (response.status === 404) {
        errorMessage = 'Assignment not found. Please check your Canvas settings.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const assignmentData = await response.json();
    
    // Clean up HTML content if present
    let cleanDescription = '';
    if (assignmentData.description) {
      // Basic HTML to text conversion - remove common HTML tags
      cleanDescription = assignmentData.description
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
    
    console.log(`Successfully imported assignment: ${assignmentData.name}`);
    console.log(`Description length: ${cleanDescription.length} characters`);

    return new Response(
      JSON.stringify({ 
        success: true,
        assignment: {
          id: assignmentData.id,
          name: assignmentData.name,
          description: cleanDescription,
          points_possible: assignmentData.points_possible,
          due_at: assignmentData.due_at,
          submission_types: assignmentData.submission_types,
          course_id: assignmentData.course_id,
          html_description: assignmentData.description // Keep original for potential Canvas updates
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in import-canvas-assignment function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to import assignment from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});