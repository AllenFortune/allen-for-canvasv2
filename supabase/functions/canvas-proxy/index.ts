
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Canvas tokens are stored encrypted at rest. The client passes whatever it
// read from profiles, so resolve it to plaintext here. A freshly-typed
// plaintext token passes through unchanged (decrypt_canvas_token handles both).
async function resolveCanvasToken(token: string): Promise<string> {
  if (/^\d+~[A-Za-z0-9]+$/.test(token)) return token; // plaintext Canvas token
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data, error } = await admin.rpc("decrypt_canvas_token", { encrypted_token: token });
    if (error || !data) return token;
    return data as string;
  } catch (_e) {
    return token;
  }
}

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
    const { canvasUrl, canvasToken, endpoint, queryParams, method = 'GET', requestBody } = await req.json();

    // Validate required inputs
    if (!canvasUrl || !canvasToken || !endpoint) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: canvasUrl, canvasToken, endpoint'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const resolvedToken = await resolveCanvasToken(canvasToken);

    // Build the full URL with query parameters
    let apiUrl = `${canvasUrl}/api/v1/${endpoint}`;

    // Add query parameters if provided (only for GET requests)
    if (method === 'GET' && queryParams && Object.keys(queryParams).length > 0) {
      const urlParams = new URLSearchParams();
      
      // Process queryParams, handling arrays specially
      for (const [key, value] of Object.entries(queryParams)) {
        if (Array.isArray(value)) {
          // Handle array parameters (like include[])
          value.forEach((item) => {
            // Adjust key name if needed for Canvas API format
            const paramKey = key.endsWith('[]') ? key : `${key}[]`;
            urlParams.append(paramKey, item.toString());
          });
        } else {
          urlParams.append(key, value);
        }
      }
      apiUrl += `?${urlParams.toString()}`;
    }

    console.log(`Canvas API request: ${method} ${apiUrl}`);

    // Prepare request options
    const requestOptions: RequestInit = {
      method: method,
      headers: {
        'Authorization': `Bearer ${resolvedToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // Add body for non-GET requests
    if (method !== 'GET' && requestBody) {
      requestOptions.body = JSON.stringify(requestBody);
    }

    // Make the request to Canvas
    const response = await fetch(apiUrl, requestOptions);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} ${response.statusText}, ${errorText}`);
      
      return new Response(JSON.stringify({
        error: `Canvas API returned ${response.status}: ${response.statusText}`,
        details: errorText
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: response.status
      });
    }

    // Parse and return the response data
    const data = await response.json();

    // Log abbreviated response info
    if (Array.isArray(data)) {
      console.log(`Canvas API response: Array with ${data.length} items`);
    } else {
      console.log(`Canvas API response: Object with keys [${Object.keys(data).join(', ')}]`);
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error(`Error in Canvas proxy:`, error);
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
