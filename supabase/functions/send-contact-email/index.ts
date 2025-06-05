
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  type: 'contact' | 'support' | 'institutional';
  // Institutional inquiry fields
  organizationName?: string;
  contactPerson?: string;
  phone?: string;
  educationLevel?: string;
  numberOfTeachers?: string;
  lmsSystem?: string;
  currentChallenges?: string;
  implementationTimeline?: string;
  budgetRange?: string;
  additionalRequirements?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ContactEmailRequest = await req.json();
    const { type } = requestData;

    let emailResponse;

    if (type === 'institutional') {
      // Handle institutional inquiry
      const {
        organizationName,
        contactPerson,
        email,
        phone,
        educationLevel,
        numberOfTeachers,
        lmsSystem,
        currentChallenges,
        implementationTimeline,
        budgetRange,
        additionalRequirements
      } = requestData;

      // Send email to support team
      emailResponse = await resend.emails.send({
        from: "A.L.L.E.N. Institutional Inquiry <noreply@allengradeassist.com>",
        to: ["support@allengradeassist.com"],
        subject: `[INSTITUTIONAL INQUIRY] ${organizationName}`,
        html: `
          <h2>New Institutional Pricing Inquiry</h2>
          
          <h3>Contact Information</h3>
          <p><strong>Organization:</strong> ${organizationName}</p>
          <p><strong>Contact Person:</strong> ${contactPerson}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          
          <h3>Institution Details</h3>
          <p><strong>Education Level:</strong> ${educationLevel}</p>
          <p><strong>Number of Teachers:</strong> ${numberOfTeachers}</p>
          <p><strong>Learning Management System:</strong> ${lmsSystem}</p>
          <p><strong>Implementation Timeline:</strong> ${implementationTimeline}</p>
          ${budgetRange ? `<p><strong>Budget Range:</strong> ${budgetRange}</p>` : ''}
          
          <h3>Current Challenges</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${currentChallenges?.replace(/\n/g, '<br>')}</p>
          
          ${additionalRequirements ? `
          <h3>Additional Requirements</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${additionalRequirements.replace(/\n/g, '<br>')}</p>
          ` : ''}
          
          <hr>
          <p style="color: #666; font-size: 12px;">Submitted via A.L.L.E.N. Institutional Inquiry Form</p>
        `,
      });

      // Send confirmation email to inquirer
      await resend.emails.send({
        from: "A.L.L.E.N. Sales Team <support@allengradeassist.com>",
        to: [email],
        subject: `Thank you for your institutional inquiry, ${contactPerson}!`,
        html: `
          <h1>Thank you for your interest in A.L.L.E.N., ${contactPerson}!</h1>
          
          <p>We have received your institutional pricing inquiry for <strong>${organizationName}</strong> and our sales team will review your requirements.</p>
          
          <h3>What happens next?</h3>
          <ul>
            <li>Our sales team will review your specific needs</li>
            <li>We'll prepare a customized quote based on your requirements</li>
            <li>You'll receive a detailed proposal within 24 hours</li>
            <li>We'll schedule a demo call to show you A.L.L.E.N. in action</li>
          </ul>
          
          <h3>Your Inquiry Summary</h3>
          <p><strong>Organization:</strong> ${organizationName}</p>
          <p><strong>Education Level:</strong> ${educationLevel}</p>
          <p><strong>Number of Teachers:</strong> ${numberOfTeachers}</p>
          <p><strong>LMS:</strong> ${lmsSystem}</p>
          <p><strong>Timeline:</strong> ${implementationTimeline}</p>
          
          <p>If you have any immediate questions, feel free to reply to this email or call us directly.</p>
          
          <p>Best regards,<br>The A.L.L.E.N. Sales Team<br>support@allengradeassist.com</p>
        `,
      });

    } else {
      // Handle regular contact/support emails (existing functionality)
      const { name, email, subject, message } = requestData;

      // Send email to support
      emailResponse = await resend.emails.send({
        from: "A.L.L.E.N. Contact Form <noreply@allengradeassist.com>",
        to: ["support@allengradeassist.com"],
        subject: `[${type.toUpperCase()}] ${subject}`,
        html: `
          <h2>New ${type} form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message?.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent via A.L.L.E.N. ${type} form</p>
        `,
      });

      // Send confirmation email to user
      await resend.emails.send({
        from: "A.L.L.E.N. Support <support@allengradeassist.com>",
        to: [email],
        subject: `We received your ${type} message`,
        html: `
          <h1>Thank you for contacting us, ${name}!</h1>
          <p>We have received your ${type} message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message?.replace(/\n/g, '<br>')}</p>
          <p>Best regards,<br>The A.L.L.E.N. Team</p>
        `,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
