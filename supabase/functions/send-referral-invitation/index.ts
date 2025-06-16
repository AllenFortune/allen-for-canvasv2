
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
      throw new Error('Missing required configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { emails, message, referralCode } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email list is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get sender's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const senderName = profile?.full_name || profile?.email || 'A colleague';
    const referralUrl = `https://fnxbysvezshnikqboplh.supabase.co/auth?ref=${referralCode}`;

    const emailPromises = emails.map(async (email: string) => {
      const emailContent = {
        from: 'Allen Grading Assistant <noreply@allengrading.com>',
        to: [email],
        subject: `${senderName} invited you to try Allen - Canvas Grading Assistant`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to try Allen!</h2>
            <p>Hi there,</p>
            <p><strong>${senderName}</strong> has invited you to try Allen, the AI-powered Canvas grading assistant that helps teachers grade faster and more consistently.</p>
            
            ${message ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0; font-style: italic;">"${message}"</p></div>` : ''}
            
            <h3>🎁 Special Bonus for You!</h3>
            <p>When you sign up and connect your Canvas account, you'll get:</p>
            <ul>
              <li><strong>10 extra free submissions</strong> for your first month</li>
              <li>AI-powered grading assistance</li>
              <li>Consistent feedback generation</li>
              <li>Time-saving automation</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${referralUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started with Allen</a>
            </div>
            
            <p>Allen helps teachers like you grade assignments, discussions, and quizzes more efficiently while maintaining high-quality feedback for students.</p>
            
            <p>Best regards,<br>The Allen Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              This invitation was sent by ${senderName} (${profile?.email}). If you don't want to receive these invitations, you can safely ignore this email.
            </p>
          </div>
        `
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent),
      });

      return { email, success: response.ok, status: response.status };
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true,
        totalSent: successCount,
        totalEmails: emails.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-referral-invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
