import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetEligibilityRequest {
  email: string;
  redirectUrl: string;
}

const RATE_LIMIT_HOURS = 1;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: ResetEligibilityRequest = await req.json();

    console.log(`Checking reset eligibility for: ${email}`);

    if (!email || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Email and redirectUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin client to access auth.users
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Check if email exists in auth.users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error("Failed to check user existence");
    }

    const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log(`No account found for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "NO_ACCOUNT",
          message: "No account found with this email address. Please create an account first."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user only has OAuth providers (no email/password)
    const providers = user.app_metadata?.providers || [];
    const hasEmailProvider = providers.includes('email');
    
    // If user has no 'email' provider, they registered via OAuth only
    if (!hasEmailProvider && providers.length > 0) {
      const oauthProvider = providers[0]; // e.g., 'google'
      console.log(`OAuth-only account for email: ${email}, provider: ${oauthProvider}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OAUTH_ONLY",
          provider: oauthProvider,
          message: `This account uses ${oauthProvider === 'google' ? 'Google' : oauthProvider} Sign-In. Please sign in with ${oauthProvider === 'google' ? 'Google' : oauthProvider} instead.`
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Step 2: Check rate limit from user_credits table
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from("user_credits")
      .select("last_password_reset_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      console.error("Error fetching user credits:", creditsError);
    }

    if (credits?.last_password_reset_at) {
      const lastReset = new Date(credits.last_password_reset_at);
      const rateLimitMs = RATE_LIMIT_HOURS * 60 * 60 * 1000;
      const timeSinceReset = Date.now() - lastReset.getTime();

      if (timeSinceReset < rateLimitMs) {
        const waitMinutes = Math.ceil((rateLimitMs - timeSinceReset) / 60000);
        console.log(`Rate limited for ${email}. Wait ${waitMinutes} minutes.`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "RATE_LIMITED",
            waitMinutes,
            message: `Please wait ${waitMinutes} minutes before requesting another reset link.`
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Step 3: Generate password reset link
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw new Error("Failed to generate reset link");
    }

    const resetLink = resetData.properties?.action_link;

    if (!resetLink) {
      throw new Error("No reset link generated");
    }

    // Step 4: Update last_password_reset_at timestamp
    const { data: existingCredits } = await supabaseAdmin
      .from("user_credits")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCredits) {
      await supabaseAdmin
        .from("user_credits")
        .update({ last_password_reset_at: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await supabaseAdmin
        .from("user_credits")
        .insert({
          user_id: user.id,
          last_password_reset_at: new Date().toISOString(),
        });
    }

    // Step 5: Send reset email via Resend
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const html = `
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
              <a href="${resetLink}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
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
              <a href="${resetLink}" style="color: #10b981; word-break: break-all;">${resetLink}</a>
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
        subject: "Reset your Synvertas password",
        html,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log(`Reset email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Password reset email sent successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in check-reset-eligibility function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);