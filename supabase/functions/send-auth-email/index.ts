import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: "confirmation" | "reset";
  confirmationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, confirmationUrl }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    let subject: string;
    let html: string;

    if (type === "confirmation") {
      subject = "Confirm your Synvertas account";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #10b981; font-size: 28px; margin: 0;">Synvertas</h1>
              </div>
              
              <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px;">Welcome to Synvertas!</h2>
              
              <p style="color: #52525b; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                Thank you for signing up. Please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Confirm Email
                </a>
              </div>
              
              <p style="color: #71717a; font-size: 14px; line-height: 20px; margin: 24px 0 0;">
                If you didn't create an account with Synvertas, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
              
              <p style="color: #a1a1aa; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                This email was sent by Synvertas. If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #10b981; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "reset") {
      subject = "Reset your Synvertas password";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #10b981; font-size: 28px; margin: 0;">Synvertas</h1>
              </div>
              
              <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px;">Reset Your Password</h2>
              
              <p style="color: #52525b; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #71717a; font-size: 14px; line-height: 20px; margin: 24px 0 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
              <p style="color: #71717a; font-size: 14px; line-height: 20px; margin: 16px 0 0;">
                This link will expire in 1 hour.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
              
              <p style="color: #a1a1aa; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                This email was sent by Synvertas. If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #10b981; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Synvertas <noreply@wealthconomy.com>",
        to: [email],
        subject,
        html,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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