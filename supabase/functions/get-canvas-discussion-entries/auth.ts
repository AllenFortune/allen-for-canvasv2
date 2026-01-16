
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export async function authenticateUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token!);

  if (authError || !user) {
    throw new Error('Invalid authentication');
  }

  return { supabase, user };
}

export async function getCanvasCredentials(supabase: any, userId: string) {
  // Decrypt token at database level
  const { data: profile } = await supabase
    .from('profiles')
    .select('canvas_instance_url, decrypt_canvas_token(canvas_access_token) as canvas_access_token')
    .eq('id', userId)
    .single();

  if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
    throw new Error('Canvas credentials not configured');
  }

  return {
    canvas_instance_url: profile.canvas_instance_url,
    canvas_access_token: profile.canvas_access_token
  };
}
