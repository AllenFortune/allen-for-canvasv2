
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, adminEmail } = await req.json()

    if (!userEmail || !userName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const emailData = {
      from: 'A.L.L.E.N. Support <support@allengradeassist.com>',
      to: [userEmail],
      subject: 'Complete Your Canvas Integration with A.L.L.E.N.',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Canvas Integration</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">A.L.L.E.N.</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">AI Learning Led Evaluation & Navigation</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
            
            <p>We noticed you haven't connected your Canvas instance to A.L.L.E.N. yet. You're missing out on powerful AI-assisted grading that can save you hours each week!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4a5568;">Why Connect Canvas?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Instant Assignment Access:</strong> Import all your Canvas assignments with one click</li>
                <li><strong>AI-Powered Grading:</strong> Get intelligent feedback suggestions for student submissions</li>
                <li><strong>Time Savings:</strong> Grade 50% faster with AI assistance</li>
                <li><strong>Consistent Feedback:</strong> Maintain grading standards across all submissions</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://allengradeassist.com/canvas-setup" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                🚀 Connect Canvas Now
              </a>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #2563eb;">
                <strong>Need Help?</strong> Our step-by-step guide walks you through the entire setup process. It takes less than 5 minutes!
              </p>
            </div>
            
            <p>If you have any questions or need assistance, simply reply to this email or contact us at <a href="mailto:support@allengradeassist.com">support@allengradeassist.com</a>.</p>
            
            <p style="margin-bottom: 0;">Best regards,<br>The A.L.L.E.N. Team</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>A.L.L.E.N. - AI Learning Led Evaluation & Navigation</p>
            <p>Making education more efficient, one grade at a time.</p>
          </div>
        </body>
        </html>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resend API error:', errorData)
      throw new Error(`Failed to send email: ${response.status}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-canvas-setup-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
