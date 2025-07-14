import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  email: string;
  featureName: string;
  featureDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, featureName, featureDescription }: NotificationRequest = await req.json();

    // Validate input
    if (!email || !featureName) {
      return new Response(JSON.stringify({ error: 'Email and feature name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Try to insert the notification request
    const { error: dbError } = await supabase
      .from('feature_notifications')
      .insert({
        email,
        feature_name: featureName,
        user_id: userId
      });

    // If there's a unique constraint violation, it means they're already signed up
    if (dbError && dbError.code === '23505') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'You are already signed up for notifications about this feature!' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save notification request' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send confirmation email
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    try {
      await resend.emails.send({
        from: 'Allen Grade Assist <noreply@allengradeassist.com>',
        to: [email],
        subject: `You're on the list for ${featureName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; margin-bottom: 24px;">Thanks for your interest!</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Hi there! We've successfully added your email address to our notification list for <strong>${featureName}</strong>.
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">What's ${featureName}?</h2>
              <p style="margin-bottom: 0;">${featureDescription}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              We'll send you an email as soon as this feature is available. In the meantime, feel free to explore our other AI-powered grading and teaching tools.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
              Best regards,<br>
              The Allen Grade Assist Team
            </p>
          </div>
        `,
      });

      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails - the signup was still successful
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Great! We'll notify you at ${email} when ${featureName} launches.` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in feature-notification-signup function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);