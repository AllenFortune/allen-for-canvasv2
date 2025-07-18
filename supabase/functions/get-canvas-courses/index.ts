
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
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Get user's Canvas credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_instance_url || !profile?.canvas_access_token) {
      return new Response(
        JSON.stringify({ error: 'Canvas credentials not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { canvas_instance_url, canvas_access_token } = profile;
    
    console.log(`Fetching all courses from Canvas: ${canvas_instance_url}`);

    // Fetch all courses from Canvas API with pagination
    let allCourses = [];
    let page = 1;
    const perPage = 100;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`Fetching page ${page} of courses...`);
      
      const response = await fetch(`${canvas_instance_url}/api/v1/courses?enrollment_type=teacher&include[]=total_students&include[]=term&include[]=enrollment_term_id&include[]=sis_term_id&per_page=${perPage}&page=${page}&locale=en`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${canvas_access_token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
        
        let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = 'Invalid Canvas API token. Please check your Canvas settings.';
        } else if (response.status === 404) {
          errorMessage = 'Canvas URL not found. Please check your Canvas settings.';
        }

        return new Response(
          JSON.stringify({ error: errorMessage }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const coursesPage = await response.json();
      allCourses.push(...coursesPage);
      
      // Check if we have more pages
      // Canvas returns fewer than per_page items when we've reached the last page
      if (coursesPage.length < perPage) {
        hasMorePages = false;
      } else {
        page++;
      }
      
      // Safety check to prevent infinite loops (max 50 pages = 5000 courses)
      if (page > 50) {
        console.warn('Reached maximum page limit (50), stopping pagination');
        hasMorePages = false;
      }
    }

    const coursesData = allCourses;
    
    // Log term information for debugging
    console.log(`Successfully fetched ${coursesData.length} courses from Canvas`);
    if (coursesData.length > 0) {
      console.log('Sample course term data:', JSON.stringify(coursesData[0].term, null, 2));
      console.log('Sample course code:', coursesData[0].course_code);
      console.log('Sample course sis_term_id:', coursesData[0].sis_term_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        courses: coursesData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-canvas-courses function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch courses from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
