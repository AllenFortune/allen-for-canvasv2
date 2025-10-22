import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const getPasswordResetEmailHtml = (resetLink: string, email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - A.L.L.E.N.</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
          <span style="color: #667eea; font-weight: bold; font-size: 18px;">AI</span>
        </div>
        <span style="color: #ffffff; font-size: 24px; font-weight: bold;">A.L.L.E.N.</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
      <p style="color: #f0f4ff; margin: 10px 0 0 0; font-size: 16px;">AI Learning Led Evaluation & Navigation</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        We received a request to reset the password for your A.L.L.E.N. account associated with <strong>${email}</strong>.
      </p>

      <p style="font-size: 16px; margin-bottom: 30px;">
        Click the button below to reset your password. This link will expire in 1 hour for security purposes.
      </p>

      <!-- Reset Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff; 
                  text-decoration: none; 
                  padding: 16px 40px; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          Reset My Password
        </a>
      </div>

      <!-- Alternative Link Section -->
      <div style="background-color: #f8f9ff; border: 1px solid #e0e7ff; padding: 20px; border-radius: 6px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all; font-size: 14px; color: #667eea;">
          ${resetLink}
        </p>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 25px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged, and no action is needed. Consider changing your password if you're concerned about account security.
        </p>
      </div>

      <p style="font-size: 16px; margin-top: 30px; margin-bottom: 5px;">
        Need help?
      </p>
      <p style="font-size: 16px; margin: 0;">
        <a href="https://www.allengradeassist.com/contact" style="color: #667eea; text-decoration: none;">Contact our support team</a> - we're here to help!
      </p>

      <p style="font-size: 16px; color: #667eea; font-weight: bold; margin: 30px 0 0 0;">
        The A.L.L.E.N. Team
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        A.L.L.E.N. - AI Learning Led Evaluation & Navigation
      </p>
      <p style="margin: 0; color: #888; font-size: 12px;">
        © 2025 A.L.L.E.N. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getConfirmationEmailHtml = (confirmLink: string, email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - A.L.L.E.N.</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
          <span style="color: #667eea; font-weight: bold; font-size: 18px;">AI</span>
        </div>
        <span style="color: #ffffff; font-size: 24px; font-weight: bold;">A.L.L.E.N.</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Confirm Your Email</h1>
      <p style="color: #f0f4ff; margin: 10px 0 0 0; font-size: 16px;">AI Learning Led Evaluation & Navigation</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome to A.L.L.E.N.!</h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Thanks for signing up! Please confirm your email address <strong>${email}</strong> to complete your registration and start using A.L.L.E.N.
      </p>

      <!-- Confirm Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${confirmLink}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff; 
                  text-decoration: none; 
                  padding: 16px 40px; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          Confirm Email Address
        </a>
      </div>

      <!-- Alternative Link Section -->
      <div style="background-color: #f8f9ff; border: 1px solid #e0e7ff; padding: 20px; border-radius: 6px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all; font-size: 14px; color: #667eea;">
          ${confirmLink}
        </p>
      </div>

      <p style="font-size: 16px; color: #667eea; font-weight: bold; margin: 30px 0 0 0;">
        The A.L.L.E.N. Team
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        A.L.L.E.N. - AI Learning Led Evaluation & Navigation
      </p>
      <p style="margin: 0; color: #888; font-size: 12px;">
        © 2025 A.L.L.E.N. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getMagicLinkEmailHtml = (magicLink: string, email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to A.L.L.E.N.</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
          <span style="color: #667eea; font-weight: bold; font-size: 18px;">AI</span>
        </div>
        <span style="color: #ffffff; font-size: 24px; font-weight: bold;">A.L.L.E.N.</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Sign In to Your Account</h1>
      <p style="color: #f0f4ff; margin: 10px 0 0 0; font-size: 16px;">AI Learning Led Evaluation & Navigation</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Your Magic Sign-In Link</h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Click the button below to sign in to your A.L.L.E.N. account (<strong>${email}</strong>). This link will expire in 1 hour.
      </p>

      <!-- Sign In Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${magicLink}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff; 
                  text-decoration: none; 
                  padding: 16px 40px; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          Sign In to A.L.L.E.N.
        </a>
      </div>

      <!-- Alternative Link Section -->
      <div style="background-color: #f8f9ff; border: 1px solid #e0e7ff; padding: 20px; border-radius: 6px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all; font-size: 14px; color: #667eea;">
          ${magicLink}
        </p>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 25px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Security Notice:</strong> If you didn't try to sign in, please ignore this email and consider changing your password.
        </p>
      </div>

      <p style="font-size: 16px; color: #667eea; font-weight: bold; margin: 30px 0 0 0;">
        The A.L.L.E.N. Team
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        A.L.L.E.N. - AI Learning Led Evaluation & Navigation
      </p>
      <p style="margin: 0; color: #888; font-size: 12px;">
        © 2025 A.L.L.E.N. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Verify webhook signature
async function verifyWebhookSignature(
  req: Request,
  body: string,
  secret: string
): Promise<boolean> {
  const signature = req.headers.get("webhook-signature");
  
  if (!signature) {
    console.error("Missing webhook-signature header");
    return false;
  }

  try {
    // Extract the signature (format: "v1,whsec_...")
    const parts = signature.split(",");
    if (parts.length !== 2 || parts[0] !== "v1") {
      console.error("Invalid signature format");
      return false;
    }

    const receivedSignature = parts[1];
    
    // Compute HMAC-SHA256 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = "whsec_" + signatureArray
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = computedSignature === receivedSignature;
    
    if (!isValid) {
      console.error("Signature mismatch:", {
        received: receivedSignature.substring(0, 20) + "...",
        computed: computedSignature.substring(0, 20) + "..."
      });
    }
    
    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read body as text for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (webhookSecret) {
      const isValid = await verifyWebhookSignature(req, body, webhookSecret);
      if (!isValid) {
        console.error("Webhook signature verification failed");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      console.log("Webhook signature verified successfully");
    } else {
      console.warn("SEND_EMAIL_HOOK_SECRET not set - skipping signature verification");
    }

    // Parse the payload
    const payload: AuthEmailPayload = JSON.parse(body);
    
    console.log('Auth email webhook received:', {
      email: payload.user.email,
      type: payload.email_data.email_action_type,
      redirect_to: payload.email_data.redirect_to
    });

    const { user, email_data } = payload;
    let { token, redirect_to, email_action_type } = email_data;

    // Ensure password recovery redirects to /update-password
    if (email_action_type === 'recovery') {
      try {
        const redirectUrl = new URL(redirect_to);
        // If the redirect_to is just the origin (no path or just "/"), append /update-password
        if (!redirectUrl.pathname || redirectUrl.pathname === '/') {
          redirect_to = `${redirectUrl.origin}/update-password`;
          console.log('Enhanced redirect_to for password recovery:', redirect_to);
        }
      } catch (error) {
        // If URL parsing fails, assume it's a relative path and ensure it has /update-password
        if (!redirect_to.includes('/update-password')) {
          redirect_to = redirect_to.endsWith('/') 
            ? `${redirect_to}update-password` 
            : `${redirect_to}/update-password`;
          console.log('Fixed relative redirect_to:', redirect_to);
        }
      }
    }

    // Construct the appropriate link based on the email type
    const baseUrl = Deno.env.get("SUPABASE_URL") || "https://fnxbysvezshnikqboplh.supabase.co";
    const authLink = `${baseUrl}/auth/v1/verify?token=${token}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
    
    console.log('Auth link constructed:', {
      type: email_action_type,
      hasToken: !!token,
      redirectTo: redirect_to,
      token: token ? `${token.substring(0, 8)}...` : 'none'
    });

    let emailHtml: string;
    let emailSubject: string;

    // Generate appropriate email content based on the action type
    switch (email_action_type) {
      case 'recovery':
        emailHtml = getPasswordResetEmailHtml(authLink, user.email);
        emailSubject = 'Reset Your A.L.L.E.N. Password';
        break;
      case 'signup':
      case 'email_change':
        emailHtml = getConfirmationEmailHtml(authLink, user.email);
        emailSubject = 'Confirm Your A.L.L.E.N. Email';
        break;
      case 'magiclink':
        emailHtml = getMagicLinkEmailHtml(authLink, user.email);
        emailSubject = 'Sign In to A.L.L.E.N.';
        break;
      default:
        console.error('Unknown email action type:', email_action_type);
        emailHtml = getPasswordResetEmailHtml(authLink, user.email);
        emailSubject = 'A.L.L.E.N. Account Action Required';
    }

    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "A.L.L.E.N. Team <support@allengradeassist.com>",
      to: [user.email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log('Auth email sent successfully:', {
      email: user.email,
      type: email_action_type,
      messageId: emailResponse.id
    });

    // Return response in format expected by Supabase
    return new Response(
      JSON.stringify({
        user: {
          email: user.email,
          confirmation_sent_at: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
