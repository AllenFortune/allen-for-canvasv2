
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const body = await req.json();
    const canvasUrl = body.canvasUrl;
    // Sanitize token - remove any whitespace/newlines that may have been introduced
    const canvasToken = body.canvasToken?.replace(/[\r\n\s]+/g, '');

    if (!canvasUrl || !canvasToken) {
      return new Response(
        JSON.stringify({ error: 'Canvas URL and API token are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean URL - remove trailing slash and ensure proper format
    const cleanUrl = canvasUrl.replace(/\/$/, '');
    
    console.log(`Testing Canvas connection to: ${cleanUrl}`);

    // Test Canvas API by fetching user profile
    const response = await fetch(`${cleanUrl}/api/v1/users/self`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvasToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      
      let errorMessage = `Canvas API returned ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Canvas API token. Please check your token and try again.';
      } else if (response.status === 404) {
        errorMessage = 'Canvas URL not found. Please check your Canvas URL and try again.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userData = await response.json();
    
    console.log(`Successfully connected to Canvas as: ${userData.name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email || userData.login_id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in test-canvas-connection function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unable to connect to Canvas. Please check your URL and API token.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
