import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

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
    console.log('📡 Canvas file proxy request received');
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
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
      console.error('❌ User authentication error:', userError);
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

    console.log('✅ User authenticated:', user.email);

    // Get request body
    const { fileUrl } = await req.json();
    console.log('🔗 File URL:', fileUrl);
    
    if (!fileUrl) {
      console.error('❌ Missing fileUrl parameter');
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
    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url: profile_canvas_instance_url, canvas_access_token: profile_canvas_access_token } = credentials;

    console.log('✅ Canvas credentials found for instance:', profile_canvas_instance_url);
    console.log('📡 Fetching Canvas file:', fileUrl);

    // Fetch the file from Canvas with proper authorization
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${profile_canvas_access_token}`,
        'User-Agent': 'Allen-AI-Grading-Assistant'
      }
    });

    console.log('📡 Canvas response status:', fileResponse.status);
    console.log('📡 Canvas response headers:', Object.fromEntries(fileResponse.headers.entries()));

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text().catch(() => 'Unknown error');
      console.error(`❌ Canvas file fetch error: ${fileResponse.status} ${fileResponse.statusText}`, errorText);
      return new Response(JSON.stringify({
        error: `Failed to fetch file from Canvas: ${fileResponse.status} ${fileResponse.statusText}`,
        details: errorText
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
    const contentType = fileResponse.headers.get('Content-Type') || 'application/pdf';
    const contentLength = fileBuffer.byteLength;
    
    console.log('✅ File fetched successfully:', {
      contentType,
      contentLength: `${contentLength} bytes`,
      size: `${(contentLength / 1024 / 1024).toFixed(2)} MB`
    });
    
    // Create response headers, forcing inline display
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': 'inline', // Force inline display instead of download
      'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      'Content-Length': contentLength.toString()
    };

    return new Response(fileBuffer, {
      headers: responseHeaders,
      status: 200
    });

  } catch (error) {
    console.error('❌ Canvas file proxy error:', error);
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