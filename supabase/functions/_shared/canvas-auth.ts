import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface CanvasCredentials {
  canvas_instance_url: string;
  canvas_access_token: string;
}

export async function authenticateUser(req: Request): Promise<{
  supabase: SupabaseClient;
  user: { id: string; email?: string };
}> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Invalid authentication');
  }

  return { supabase, user };
}

export async function getCanvasCredentials(
  supabase: SupabaseClient,
  userId: string
): Promise<CanvasCredentials> {
  // Use the secure RPC function to get decrypted credentials
  const { data, error } = await supabase.rpc('get_canvas_credentials', {
    user_id_param: userId
  });

  if (error) {
    console.error('Error fetching Canvas credentials:', error);
    throw new Error(`Failed to fetch Canvas credentials: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Canvas credentials not configured');
  }

  const credentials = data[0];
  
  if (!credentials.canvas_instance_url || !credentials.canvas_access_token) {
    throw new Error('Canvas credentials not configured');
  }

  return {
    canvas_instance_url: credentials.canvas_instance_url,
    canvas_access_token: credentials.canvas_access_token
  };
}
