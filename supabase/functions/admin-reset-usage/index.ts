import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetUsageRequest {
  userEmail: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!,
          },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Admin verification failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin's email
    const { data: adminProfile } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const { userEmail, reason } = await req.json() as ResetUsageRequest;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${adminProfile?.email} resetting usage for ${userEmail}`);

    // Call the reset_user_submissions RPC function
    const { error: resetError } = await supabaseAdmin.rpc('reset_user_submissions', {
      user_email: userEmail
    });

    if (resetError) {
      console.error('Error resetting user submissions:', resetError);
      return new Response(
        JSON.stringify({ error: `Failed to reset usage: ${resetError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the admin action
    const { error: logError } = await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_email: adminProfile?.email || user.email,
        admin_user_id: user.id,
        action_type: 'reset_usage',
        target_user_email: userEmail,
        reason: reason || null,
        details: {
          timestamp: new Date().toISOString(),
          reset_type: 'manual'
        }
      });

    if (logError) {
      console.error('Error logging admin action:', logError);
    }

    console.log(`Successfully reset usage for ${userEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Usage reset successfully for ${userEmail}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-reset-usage function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
