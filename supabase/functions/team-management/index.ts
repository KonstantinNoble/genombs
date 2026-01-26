import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SITE_URL = "https://wealthconomy.lovable.app";

// Generate URL-safe slug from team name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);
  const randomSuffix = crypto.randomUUID().substring(0, 8);
  return `${baseSlug}-${randomSuffix}`;
}

// Send team invitation email via Resend
async function sendInviteEmail(
  email: string,
  teamName: string,
  inviterEmail: string,
  token: string
): Promise<void> {
  const inviteUrl = `${SITE_URL}/team/invite/${token}`;
  
  console.log(`Sending team invite email to ${email} for team ${teamName}`);
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Synoptas <noreply@wealthconomy.com>",
      to: [email],
      subject: `You've been invited to join ${teamName} on Synoptas`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5; color: #1a1a1a; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px -4px rgba(0,0,0,0.08);">
    <div style="background: #ffffff; padding: 32px; text-align: center; border-bottom: 1px solid #e4e4e7;">
      <h1 style="color: #22c55e; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Synoptas</h1>
      <p style="color: #71717a; font-size: 14px; margin: 8px 0 0;">Team Invitation</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        You've been invited to join <strong>${teamName}</strong> by ${inviterEmail}.
      </p>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
        As a team member, you'll be able to collaborate on strategic decision validations.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" style="display: inline-block; background-color: #22c55e; color: white; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #71717a; font-size: 12px; text-align: center; margin: 24px 0 0;">
        Or copy this link:<br>
        <a href="${inviteUrl}" style="color: #22c55e; word-break: break-all;">${inviteUrl}</a>
      </p>
      <div style="background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="color: #52525b; font-size: 13px; margin: 0; text-align: center;">
          This invitation expires in 7 days
        </p>
      </div>
    </div>
    <div style="border-top: 1px solid #e4e4e7; padding: 24px; text-align: center;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Synoptas. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send invite email:", errorText);
    throw new Error("Failed to send invitation email");
  }
  
  console.log("Invite email sent successfully");
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body to get action and data
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // No body or invalid JSON
    }
    
    const action = body.action || "list";
    
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader && action !== "accept-invite") {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create authenticated client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from JWT
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = user.id;
      userEmail = user.email || null;
    }

    console.log(`Team management action: ${action}, user: ${userId}`);

    // Route handlers based on action
    // Team limits
    const LIMITS = {
      MAX_TEAMS_PER_USER: 5,
      MAX_MEMBERS_PER_TEAM: 5,
    };

    switch (action) {
      case "create": {
        const name = body.name;
        
        if (!name || name.trim().length < 2) {
          return new Response(JSON.stringify({ error: "Team name must be at least 2 characters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user is premium
        const { data: credits } = await supabase
          .from("user_credits")
          .select("is_premium")
          .eq("user_id", userId)
          .single();

        if (!credits?.is_premium) {
          return new Response(JSON.stringify({ error: "PREMIUM_REQUIRED" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check team limit (max 5 teams as owner)
        const { count: ownedTeamsCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", userId);

        if (ownedTeamsCount !== null && ownedTeamsCount >= LIMITS.MAX_TEAMS_PER_USER) {
          console.log(`User ${userId} reached team limit: ${ownedTeamsCount}/${LIMITS.MAX_TEAMS_PER_USER}`);
          return new Response(JSON.stringify({ error: "TEAM_LIMIT_REACHED" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const slug = generateSlug(name.trim());

        // Create team
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: name.trim(),
            slug,
            owner_id: userId,
          })
          .select()
          .single();

        if (teamError) {
          console.error("Failed to create team:", teamError);
          return new Response(JSON.stringify({ error: "Failed to create team" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Add creator as owner member
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: team.id,
            user_id: userId,
            role: "owner",
          });

        if (memberError) {
          console.error("Failed to add owner as member:", memberError);
          await supabase.from("teams").delete().eq("id", team.id);
          return new Response(JSON.stringify({ error: "Failed to setup team" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Team created: ${team.id} by user ${userId}`);

        return new Response(JSON.stringify({ team }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "invite": {
        const { teamId, email, role } = body;

        if (!teamId || !email || !role) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: "Invalid email format" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate role - only member and viewer can be assigned
        const ASSIGNABLE_ROLES = ['member', 'viewer'];
        if (!ASSIGNABLE_ROLES.includes(role)) {
          return new Response(JSON.stringify({ 
            error: "INVALID_ROLE",
            message: "Only 'member' and 'viewer' roles can be assigned" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user is admin/owner of the team
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
          return new Response(JSON.stringify({ error: "Not authorized to invite members" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if team owner is still premium and get team info
        const { data: teamData } = await supabase
          .from("teams")
          .select("owner_id, name")
          .eq("id", teamId)
          .single();

        if (!teamData) {
          return new Response(JSON.stringify({ error: "Team not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: ownerCredits } = await supabase
          .from("user_credits")
          .select("is_premium")
          .eq("user_id", teamData.owner_id)
          .single();

        if (!ownerCredits?.is_premium) {
          console.log(`Team ${teamId} owner is no longer premium, blocking invite`);
          return new Response(JSON.stringify({ 
            error: "OWNER_NOT_PREMIUM",
            message: "Team invitations require the team owner to have an active Premium subscription"
          }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Rate limit: Max 10 invitations per team per 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recentInvites } = await supabase
          .from("team_invitations")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId)
          .gte("created_at", oneDayAgo);

        if (recentInvites && recentInvites >= 10) {
          return new Response(JSON.stringify({ error: "INVITE_RATE_LIMIT_EXCEEDED" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Rate limit: Max 3 pending invitations per email globally
        const { count: pendingForEmail } = await supabase
          .from("team_invitations")
          .select("*", { count: "exact", head: true })
          .eq("email", email.toLowerCase())
          .gt("expires_at", new Date().toISOString());

        if (pendingForEmail && pendingForEmail >= 3) {
          return new Response(JSON.stringify({ error: "EMAIL_INVITE_LIMIT_EXCEEDED" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check member limit (max 5 members including pending invites)
        const { count: currentMemberCount } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId);

        const { count: pendingInviteCount } = await supabase
          .from("team_invitations")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId)
          .gt("expires_at", new Date().toISOString());

        const totalCount = (currentMemberCount || 0) + (pendingInviteCount || 0);

        if (totalCount >= LIMITS.MAX_MEMBERS_PER_TEAM) {
          console.log(`Team ${teamId} reached member limit: ${totalCount}/${LIMITS.MAX_MEMBERS_PER_TEAM}`);
          return new Response(JSON.stringify({ error: "MEMBER_LIMIT_REACHED" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate secure token
        const token = crypto.randomUUID();

        // Create or update invitation
        const { data: invitation, error: inviteError } = await supabase
          .from("team_invitations")
          .upsert({
            team_id: teamId,
            email: email.toLowerCase(),
            role,
            invited_by: userId,
            token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, {
            onConflict: "team_id,email",
          })
          .select()
          .single();

        if (inviteError) {
          console.error("Failed to create invitation:", inviteError);
          return new Response(JSON.stringify({ error: "Failed to create invitation" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Send invitation email
        try {
          await sendInviteEmail(email.toLowerCase(), teamData.name, userEmail || "A team admin", invitation.token);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          await supabase.from("team_invitations").delete().eq("id", invitation.id);
          return new Response(JSON.stringify({ error: "Failed to send invitation email" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Invitation sent to ${email} for team ${teamId}`);

        return new Response(JSON.stringify({ success: true, invitation }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "accept-invite": {
        const { token } = body;

        if (!token) {
          return new Response(JSON.stringify({ error: "Missing token" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Find invitation
        const { data: invitation, error: inviteError } = await supabase
          .from("team_invitations")
          .select("*, teams(name)")
          .eq("token", token)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (inviteError || !invitation) {
          return new Response(JSON.stringify({ error: "Invalid or expired invitation" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // If user is not authenticated, return info for frontend
        if (!userId) {
          return new Response(JSON.stringify({ 
            requiresAuth: true,
            email: invitation.email,
            teamName: invitation.teams?.name,
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get user's email
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        
        // Verify email matches invitation
        if (user?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
          return new Response(JSON.stringify({ 
            error: "EMAIL_MISMATCH",
            invitedEmail: invitation.email,
          }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if already a member
        const { data: existingMember } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", invitation.team_id)
          .eq("user_id", userId)
          .single();

        if (existingMember) {
          await supabase.from("team_invitations").delete().eq("id", invitation.id);
          return new Response(JSON.stringify({ success: true, alreadyMember: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Double-check member limit before accepting
        const { count: memberCount } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", invitation.team_id);

        if (memberCount !== null && memberCount >= LIMITS.MAX_MEMBERS_PER_TEAM) {
          // Delete invitation and inform user
          await supabase.from("team_invitations").delete().eq("id", invitation.id);
          console.log(`Team ${invitation.team_id} is full, cannot accept invite`);
          return new Response(JSON.stringify({ error: "TEAM_FULL" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Add user as team member
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: invitation.team_id,
            user_id: userId,
            role: invitation.role,
          });

        if (memberError) {
          console.error("Failed to add team member:", memberError);
          return new Response(JSON.stringify({ error: "Failed to join team" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete the invitation
        await supabase.from("team_invitations").delete().eq("id", invitation.id);

        console.log(`User ${userId} joined team ${invitation.team_id}`);

        return new Response(JSON.stringify({ 
          success: true, 
          teamId: invitation.team_id,
          teamName: invitation.teams?.name,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove-member": {
        const { teamId, userId: targetUserId } = body;

        // Check permissions
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        const isAdmin = membership && ["owner", "admin"].includes(membership.role);
        const isSelf = userId === targetUserId;

        if (!isAdmin && !isSelf) {
          return new Response(JSON.stringify({ error: "Not authorized" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Can't remove the owner
        const { data: targetMember } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", targetUserId)
          .single();

        if (targetMember?.role === "owner") {
          return new Response(JSON.stringify({ error: "Cannot remove team owner. Transfer ownership first." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Remove member
        const { error: removeError } = await supabase
          .from("team_members")
          .delete()
          .eq("team_id", teamId)
          .eq("user_id", targetUserId);

        if (removeError) {
          console.error("Failed to remove member:", removeError);
          return new Response(JSON.stringify({ error: "Failed to remove member" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Member ${targetUserId} removed from team ${teamId}`);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update-role": {
        const { teamId, userId: targetUserId, role: newRole } = body;

        // Only owner can change roles
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        if (membership?.role !== "owner") {
          return new Response(JSON.stringify({ error: "Only team owner can change roles" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate new role - only member and viewer can be assigned
        const ASSIGNABLE_ROLES = ['member', 'viewer'];
        if (!ASSIGNABLE_ROLES.includes(newRole)) {
          return new Response(JSON.stringify({ 
            error: "Only 'member' and 'viewer' roles can be assigned" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Can't change owner's role this way
        const { data: targetMember } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", targetUserId)
          .single();

        // Owner role cannot be changed via update-role
        if (targetMember?.role === "owner") {
          return new Response(JSON.stringify({ error: "Cannot change owner's role" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update role
        const { error: updateError } = await supabase
          .from("team_members")
          .update({ role: newRole })
          .eq("team_id", teamId)
          .eq("user_id", targetUserId);

        if (updateError) {
          console.error("Failed to update role:", updateError);
          return new Response(JSON.stringify({ error: "Failed to update role" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Role updated for ${targetUserId} in team ${teamId} to ${newRole}`);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "members": {
        const teamId = body.teamId;

        if (!teamId) {
          return new Response(JSON.stringify({ error: "Missing teamId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user is a member
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        if (!membership) {
          return new Response(JSON.stringify({ error: "Not a team member" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get all members
        const { data: members, error: membersError } = await supabase
          .from("team_members")
          .select("id, user_id, role, joined_at")
          .eq("team_id", teamId);

        if (membersError) {
          console.error("Failed to get members:", membersError);
          return new Response(JSON.stringify({ error: "Failed to get members" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get user emails
        const { data: { users } } = await supabase.auth.admin.listUsers();
        
        const membersWithEmail = members.map(m => {
          const user = users.find(u => u.id === m.user_id);
          return {
            ...m,
            email: user?.email || "Unknown",
          };
        });

        // Get pending invitations if admin
        let invitations: any[] = [];
        if (["owner", "admin"].includes(membership.role)) {
          const { data: invites } = await supabase
            .from("team_invitations")
            .select("id, email, role, expires_at, created_at")
            .eq("team_id", teamId)
            .gt("expires_at", new Date().toISOString());
          
          invitations = invites || [];
        }

        // Get owner's premium status for frontend UI
        const { data: teamInfo } = await supabase
          .from("teams")
          .select("owner_id")
          .eq("id", teamId)
          .single();

        let ownerIsPremium = true;
        if (teamInfo) {
          const { data: ownerCredits } = await supabase
            .from("user_credits")
            .select("is_premium")
            .eq("user_id", teamInfo.owner_id)
            .single();
          ownerIsPremium = ownerCredits?.is_premium ?? false;
        }

        return new Response(JSON.stringify({ 
          members: membersWithEmail, 
          invitations, 
          userRole: membership.role,
          ownerIsPremium
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        // Get all teams the user is a member of
        const { data: memberships, error } = await supabase
          .from("team_members")
          .select("team_id, role, joined_at, teams(id, name, slug, created_at)")
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to get teams:", error);
          return new Response(JSON.stringify({ error: "Failed to get teams" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const teams = memberships.map(m => ({
          ...m.teams,
          role: m.role,
          joinedAt: m.joined_at,
        }));

        return new Response(JSON.stringify({ teams }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { teamId } = body;

        // Only owner can delete team
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        if (membership?.role !== "owner") {
          return new Response(JSON.stringify({ error: "Only owner can delete team" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete team (cascade handles members and invitations)
        const { error: deleteError } = await supabase
          .from("teams")
          .delete()
          .eq("id", teamId);

        if (deleteError) {
          console.error("Failed to delete team:", deleteError);
          return new Response(JSON.stringify({ error: "Failed to delete team" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Team ${teamId} deleted by owner ${userId}`);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "cancel-invite": {
        const { invitationId } = body;

        // Get invitation to check team
        const { data: invitation } = await supabase
          .from("team_invitations")
          .select("team_id")
          .eq("id", invitationId)
          .single();

        if (!invitation) {
          return new Response(JSON.stringify({ error: "Invitation not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user is admin
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", invitation.team_id)
          .eq("user_id", userId)
          .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
          return new Response(JSON.stringify({ error: "Not authorized" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete invitation
        await supabase.from("team_invitations").delete().eq("id", invitationId);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "rename": {
        const { teamId, name } = body;

        if (!teamId || !name || name.trim().length < 2) {
          return new Response(JSON.stringify({ error: "Team name must be at least 2 characters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Only admin or owner can rename
        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", userId)
          .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
          return new Response(JSON.stringify({ error: "Only owner or admin can rename team" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update team name
        const { error: updateError } = await supabase
          .from("teams")
          .update({ name: name.trim() })
          .eq("id", teamId);

        if (updateError) {
          console.error("Failed to rename team:", updateError);
          return new Response(JSON.stringify({ error: "Failed to rename team" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Team ${teamId} renamed to "${name.trim()}" by ${userId}`);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Team management error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});