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
    // Authenticate user and get Canvas credentials
    const { supabase, user } = await authenticateUser(req);
    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;
    
    console.log(`Fetching favorite courses from Canvas: ${canvas_instance_url}`);

    // Fetch favorite courses from Canvas API
    const response = await fetch(`${canvas_instance_url}/api/v1/users/self/favorites/courses?include[]=total_students&per_page=100`, {
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

    const favoritesData = await response.json();
    
    console.log(`Successfully fetched ${favoritesData.length} favorite courses from Canvas`);

    return new Response(
      JSON.stringify({ 
        success: true,
        courses: favoritesData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-canvas-favorite-courses function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch favorite courses from Canvas' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
