import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Building2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type InviteState = "loading" | "requiresAuth" | "emailMismatch" | "success" | "error" | "alreadyMember";

export default function TeamInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { switchTeam, refreshTeams } = useTeam();

  const [state, setState] = useState<InviteState>("loading");
  const [teamName, setTeamName] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Wait for auth provider to finish initializing (prevents race conditions)
    if (authLoading) return;

    if (!token) {
      setState("error");
      setErrorMessage("Invalid invitation link");
      return;
    }

    acceptInvitation();
  }, [token, authLoading, user?.id]);

  const acceptInvitation = async () => {
    if (!token) return;

    setState("loading");

    try {
      // Get current session to explicitly pass auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Build headers - explicitly include auth token if available
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      console.log("[TeamInvite] Calling accept-invite, authenticated:", !!accessToken);

      const response = await supabase.functions.invoke("team-management", {
        body: { action: "accept-invite", token },
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      const data = response.data;

      console.log("[TeamInvite] Response:", { data, error: response.error?.message });

      // Handle HTTP errors (4xx/5xx) - parse the error body for structured errors
      if (response.error) {
        // Try to extract structured error from the response
        let errorBody: any = null;
        
        // Supabase FunctionsHttpError includes the response body in context
        if (response.error.context && typeof response.error.context === "object") {
          try {
            // The context might be the Response object or already parsed
            const ctx = response.error.context as any;
            if (ctx.json) {
              errorBody = await ctx.json();
            } else if (ctx.error) {
              errorBody = ctx;
            }
          } catch {
            // Failed to parse context
          }
        }

        // Also check if the error message itself contains JSON
        if (!errorBody && response.error.message) {
          try {
            errorBody = JSON.parse(response.error.message);
          } catch {
            // Not JSON
          }
        }

        console.log("[TeamInvite] Parsed error body:", errorBody);

        // Handle structured errors
        if (errorBody) {
          if (errorBody.requiresAuth) {
            setState("requiresAuth");
            setTeamName(errorBody.teamName || "the team");
            setInvitedEmail(errorBody.email || "");
            return;
          }

          if (errorBody.error === "EMAIL_MISMATCH") {
            setState("emailMismatch");
            setInvitedEmail(errorBody.invitedEmail || "");
            return;
          }

          if (errorBody.error === "TEAM_FULL") {
            setState("error");
            setErrorMessage("This team has reached its member limit of 5. Contact the team admin for more information.");
            return;
          }

          if (errorBody.error === "INVITE_INVALID" || errorBody.error === "Invalid or expired invitation") {
            setState("error");
            setErrorMessage("This invitation has expired or is invalid. Please ask the team admin to send a new invitation.");
            return;
          }

          if (errorBody.error === "Missing authorization" || errorBody.error === "Invalid token") {
            // User needs to log in
            setState("requiresAuth");
            setTeamName(errorBody.teamName || "the team");
            setInvitedEmail(errorBody.email || "");
            return;
          }
        }

        // Fallback: Check error message for auth-related keywords
        const errorMsg = response.error.message?.toLowerCase() || "";
        if (!user && (errorMsg.includes("authorization") || errorMsg.includes("token") || errorMsg.includes("401") || errorMsg.includes("unauthorized"))) {
          setState("requiresAuth");
          setTeamName("the team");
          setInvitedEmail("");
          return;
        }
        
        setState("error");
        setErrorMessage(errorBody?.message || response.error.message || "Failed to process invitation");
        return;
      }

      // Handle success responses with ok: false (structured business errors)
      if (data && data.ok === false) {
        if (data.requiresAuth) {
          setState("requiresAuth");
          setTeamName(data.teamName || "the team");
          setInvitedEmail(data.email || "");
          return;
        }

        if (data.error === "EMAIL_MISMATCH") {
          setState("emailMismatch");
          setInvitedEmail(data.invitedEmail || "");
          return;
        }

        if (data.error === "TEAM_FULL") {
          setState("error");
          setErrorMessage("This team has reached its member limit of 5. Contact the team admin for more information.");
          return;
        }

        if (data.error === "INVITE_INVALID") {
          setState("error");
          setErrorMessage("This invitation has expired or is invalid. Please ask the team admin to send a new invitation.");
          return;
        }

        setState("error");
        setErrorMessage(data.message || data.error || "Failed to process invitation");
        return;
      }

      // Handle legacy error format (for backward compatibility during transition)
      if (data?.error === "EMAIL_MISMATCH") {
        setState("emailMismatch");
        setInvitedEmail(data.invitedEmail);
        return;
      }

      if (data?.error === "TEAM_FULL") {
        setState("error");
        setErrorMessage("This team has reached its member limit of 5. Contact the team admin for more information.");
        return;
      }

      if (data?.error === "Invalid or expired invitation") {
        setState("error");
        setErrorMessage("This invitation has expired or is invalid. Please ask the team admin to send a new invitation.");
        return;
      }

      if (data?.error) {
        setState("error");
        setErrorMessage(data.message || data.error);
        return;
      }

      if (data?.requiresAuth) {
        setState("requiresAuth");
        setTeamName(data.teamName || "the team");
        setInvitedEmail(data.email || "");
        return;
      }

      if (data?.alreadyMember) {
        setState("alreadyMember");
        setTeamId(data.teamId || "");
        setTeamName(data.teamName || "this team");
        return;
      }

      if (data?.success) {
        setState("success");
        setTeamId(data.teamId);
        setTeamName(data.teamName);
        await refreshTeams();
      }
    } catch (error) {
      console.error("[TeamInvite] Error accepting invitation:", error);
      setState("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoToTeam = () => {
    if (teamId) {
      switchTeam(teamId);
    }
    navigate("/validate");
  };

  const handleLogin = () => {
    // Navigate to auth with returnTo parameter so user comes back after login
    const returnTo = `/team/invite/${token}`;
    const params = new URLSearchParams();
    if (invitedEmail) {
      params.set("email", invitedEmail);
    }
    params.set("returnTo", returnTo);
    navigate(`/auth?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {state === "loading" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <CardTitle>Processing Invitation</CardTitle>
                <CardDescription>Please wait...</CardDescription>
              </CardHeader>
            </>
          )}

          {state === "requiresAuth" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Join {teamName}</CardTitle>
                <CardDescription>
                  {invitedEmail ? (
                    <>You've been invited to join this team. Sign in or create an account with <strong>{invitedEmail}</strong> to accept.</>
                  ) : (
                    <>You've been invited to join this team. Sign in or create an account to accept.</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button onClick={handleLogin} className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In to Accept
                </Button>
                {invitedEmail && (
                  <p className="text-xs text-center text-muted-foreground">
                    Make sure to use the email address: {invitedEmail}
                  </p>
                )}
              </CardContent>
            </>
          )}

          {state === "emailMismatch" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Wrong Account</CardTitle>
                <CardDescription>
                  This invitation was sent to <strong>{invitedEmail}</strong>, but you're signed in with a different email. Please sign out and sign in with the correct account.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button 
                  onClick={async () => {
                    // Sign out current user and redirect to auth with correct email
                    await supabase.auth.signOut();
                    const returnTo = `/team/invite/${token}`;
                    const params = new URLSearchParams();
                    params.set("email", invitedEmail);
                    params.set("returnTo", returnTo);
                    navigate(`/auth?${params.toString()}`);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Sign Out & Sign In with {invitedEmail}
                </Button>
                <Button onClick={() => navigate("/validate")} variant="ghost" className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </>
          )}

          {state === "success" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle>Welcome to {teamName}!</CardTitle>
                <CardDescription>
                  You're now a member of this team. Start collaborating on strategic decisions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGoToTeam} className="w-full">
                  Go to Team Workspace
                </Button>
              </CardContent>
            </>
          )}

          {state === "alreadyMember" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Already a Member</CardTitle>
                <CardDescription>
                  You're already a member of {teamName}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGoToTeam} className="w-full">
                  Go to Team Workspace
                </Button>
              </CardContent>
            </>
          )}

          {state === "error" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Invitation Error</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Go to Home
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
