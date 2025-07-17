import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(JSON.stringify({
        error: 'User not authenticated'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }

    // Get request body
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return new Response(JSON.stringify({
        error: 'Missing fileUrl parameter'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Get user's Canvas credentials
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.canvas_access_token) {
      console.error('Canvas credentials error:', profileError);
      return new Response(JSON.stringify({
        error: 'Canvas credentials not found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }

    console.log(`Fetching Canvas file: ${fileUrl}`);

    // Fetch the file from Canvas with proper authorization
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${profile.canvas_access_token}`,
        'User-Agent': 'Allen-AI-Grading-Assistant'
      }
    });

    if (!fileResponse.ok) {
      console.error(`Canvas file fetch error: ${fileResponse.status} ${fileResponse.statusText}`);
      return new Response(JSON.stringify({
        error: `Failed to fetch file from Canvas: ${fileResponse.status} ${fileResponse.statusText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: fileResponse.status
      });
    }

    // Get the file content
    const fileBuffer = await fileResponse.arrayBuffer();
    
    // Get original content type from Canvas response
    const contentType = fileResponse.headers.get('Content-Type') || 'application/octet-stream';
    
    // Create response headers, forcing inline display
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': 'inline', // Force inline display instead of download
      'Cache-Control': 'private, max-age=3600' // Cache for 1 hour
    };

    console.log(`Successfully proxied Canvas file, Content-Type: ${contentType}`);

    return new Response(fileBuffer, {
      headers: responseHeaders,
      status: 200
    });

  } catch (error) {
    console.error(`Error in Canvas file proxy:`, error);
    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});