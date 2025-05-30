
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', email);

    const emailResponse = await resend.emails.send({
      from: "A.L.L.E.N. Team <support@allengradeassist.com>",
      to: [email],
      subject: "Welcome to A.L.L.E.N. - Your AI Grading Assistant!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to A.L.L.E.N.</title>
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to A.L.L.E.N.!</h1>
              <p style="color: #f0f4ff; margin: 10px 0 0 0; font-size: 16px;">AI Learning Led Evaluation & Navigation</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${fullName}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for joining A.L.L.E.N.! We're excited to help you transform your grading experience with the power of AI.
              </p>

              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px;">🚀 Get Started in 3 Easy Steps:</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>Connect your Canvas LMS</strong> - Integrate with your existing Canvas instance</li>
                  <li style="margin-bottom: 10px;"><strong>Import your courses</strong> - Access all your assignments and discussions</li>
                  <li style="margin-bottom: 10px;"><strong>Start grading with AI</strong> - Get intelligent feedback suggestions instantly</li>
                </ol>
              </div>

              <h3 style="color: #333; margin: 30px 0 15px 0; font-size: 20px;">What Makes A.L.L.E.N. Special?</h3>
              <ul style="padding-left: 20px; margin-bottom: 25px;">
                <li style="margin-bottom: 8px;"><strong>AI-Powered Assistance:</strong> Get intelligent grading suggestions, not automatic grades</li>
                <li style="margin-bottom: 8px;"><strong>Teacher Control:</strong> You remain in complete control of all final grades and feedback</li>
                <li style="margin-bottom: 8px;"><strong>Bias Reduction:</strong> Consistent evaluation criteria help reduce unconscious bias</li>
                <li style="margin-bottom: 8px;"><strong>Time Savings:</strong> Focus on meaningful feedback while AI handles initial review</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://allen-for-canvas.lovable.app/canvas-setup" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 6px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;">
                  Connect Your Canvas LMS →
                </a>
              </div>

              <h3 style="color: #333; margin: 30px 0 15px 0; font-size: 20px;">Helpful Resources:</h3>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0;"><strong><a href="https://allen-for-canvas.lovable.app/ai-pedagogy" style="color: #667eea; text-decoration: none;">📚 AI Pedagogy Hub</a></strong> - Learn best practices for AI in education</p>
                <p style="margin: 0 0 10px 0;"><strong><a href="https://allen-for-canvas.lovable.app/ai-literacy" style="color: #667eea; text-decoration: none;">🎓 AI Literacy Resources</a></strong> - Understand AI's role in modern education</p>
                <p style="margin: 0;"><strong><a href="https://allen-for-canvas.lovable.app/contact" style="color: #667eea; text-decoration: none;">💬 Contact Support</a></strong> - We're here to help with any questions</p>
              </div>

              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0; color: #856404;"><strong>Important:</strong> A.L.L.E.N. is an independent third-party application that integrates with Canvas through public APIs. We are not affiliated with Instructure, Inc.</p>
              </div>

              <p style="font-size: 16px; margin-bottom: 20px;">
                If you have any questions or need assistance getting started, don't hesitate to reach out to our support team. We're committed to making your grading experience more efficient and effective.
              </p>

              <p style="font-size: 16px; margin-bottom: 5px;">
                Welcome aboard!
              </p>
              <p style="font-size: 16px; color: #667eea; font-weight: bold; margin: 0;">
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
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
