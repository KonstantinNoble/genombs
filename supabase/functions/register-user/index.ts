import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegisterRequest {
  email: string;
  password: string;
  redirectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, redirectUrl }: RegisterRequest = await req.json();

    console.log(`Registering user with email: ${email}`);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user without email confirmation
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error(createError.message);
    }

    console.log("User created successfully:", userData.user?.id);

    // Generate confirmation link - signup type requires password
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      throw new Error(linkError.message);
    }

    const confirmationUrl = linkData.properties?.action_link;
    
    if (!confirmationUrl) {
      throw new Error("Failed to generate confirmation URL");
    }

    console.log("Confirmation link generated, sending email...");

    // Send confirmation email via Resend
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0A0A0A;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px; padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://synvertas.com/synvertas-logo.png" alt="Synvertas" style="max-height: 40px; width: auto;">
            </div>
            
            <h2 style="color: #FAFAFA; font-size: 20px; margin: 0 0 16px;">Welcome to Synvertas!</h2>
            
            <p style="color: #D4D4D8; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
              Thank you for signing up. Please confirm your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmationUrl}" style="display: inline-block; background-color: #F97316; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Confirm Email
              </a>
            </div>
            
            <p style="color: #71717a; font-size: 14px; line-height: 20px; margin: 24px 0 0;">
              If you didn't create an account with Synvertas, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 32px 0;">
            
            <p style="color: #a1a1aa; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
              This email was sent by Synvertas. If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #F97316; word-break: break-all;">${confirmationUrl}</a>
            </p>
            
            <p style="color: #71717a; font-size: 11px; margin: 16px 0 0; text-align: center;">
              &copy; ${new Date().getFullYear()} Synvertas. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Synvertas <noreply@wealthconomy.com>",
        to: [email],
        subject: "Confirm your Synvertas account",
        html,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: userData.user?.id,
          emailSent: false,
          emailError: emailData.message 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Confirmation email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userData.user?.id,
        emailSent: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in register-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);