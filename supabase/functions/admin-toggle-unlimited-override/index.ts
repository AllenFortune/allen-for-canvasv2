import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Invalid token:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Unauthorized - not admin:', roleError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const { userEmail, enabled } = await req.json();

    if (!userEmail || typeof enabled !== 'boolean') {
      console.error('Invalid request body:', { userEmail, enabled });
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${user.email} toggling unlimited_override to ${enabled} for ${userEmail}`);

    // Update unlimited_override for the user
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ unlimited_override: enabled })
      .eq('email', userEmail);

    if (updateError) {
      console.error('Error updating unlimited_override:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update unlimited override' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the action
    await supabase.from('admin_actions').insert({
      admin_email: user.email,
      admin_user_id: user.id,
      action_type: 'toggle_unlimited_override',
      target_user_email: userEmail,
      reason: `Unlimited override ${enabled ? 'enabled' : 'disabled'} by admin`,
      details: { enabled, admin_email: user.email }
    });

    console.log(`Successfully toggled unlimited_override for ${userEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Unlimited override ${enabled ? 'enabled' : 'disabled'} for ${userEmail}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-toggle-unlimited-override:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
