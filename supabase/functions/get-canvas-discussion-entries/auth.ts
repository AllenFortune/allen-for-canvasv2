
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
  // Get user's Canvas credentials from profile (select raw columns)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('canvas_instance_url, canvas_access_token')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
    throw new Error('Canvas credentials not configured');
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
      throw new Error('Failed to decrypt Canvas token');
    }
    canvas_access_token = decryptedToken;
  }

  return {
    canvas_instance_url: canvas_instance_url,
    canvas_access_token: canvas_access_token
  };
}
