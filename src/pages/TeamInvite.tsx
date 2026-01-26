import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
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
      // IMPORTANT: don't pass an empty `headers` object.
      // Passing custom headers can override the default headers that are required
      // to call backend functions (apikey + automatically attached auth when logged in).
      const response = await supabase.functions.invoke("team-management", {
        body: { action: "accept-invite", token },
      });

      const data = response.data;

      // Handle HTTP errors (4xx/5xx) - these come as response.error
      if (response.error) {
        // Check if this is an auth-related error for unauthenticated users
        const errorMsg = response.error.message?.toLowerCase() || "";
        if (!user && (errorMsg.includes("authorization") || errorMsg.includes("token") || errorMsg.includes("401") || errorMsg.includes("unauthorized"))) {
          // Likely the user needs to log in - show requiresAuth state
          setState("requiresAuth");
          setTeamName("the team");
          setInvitedEmail("");
          // Store token for after login
          localStorage.setItem("pending_team_invite", token);
          return;
        }
        
        setState("error");
        setErrorMessage(response.error.message || "Failed to process invitation");
        return;
      }

      if (data.error === "EMAIL_MISMATCH") {
        setState("emailMismatch");
        setInvitedEmail(data.invitedEmail);
        return;
      }

      if (data.error === "TEAM_FULL") {
        setState("error");
        setErrorMessage("This team has reached its member limit of 5. Contact the team admin for more information.");
        return;
      }

      if (data.error === "Invalid or expired invitation") {
        setState("error");
        setErrorMessage("This invitation has expired or is invalid. Please ask the team admin to send a new invitation.");
        return;
      }

      if (data.error) {
        setState("error");
        setErrorMessage(data.message || data.error);
        return;
      }

      if (data.requiresAuth) {
        setState("requiresAuth");
        setTeamName(data.teamName || "the team");
        setInvitedEmail(data.email || "");
        // Store token for after login
        localStorage.setItem("pending_team_invite", token);
        return;
      }

      if (data.alreadyMember) {
        setState("alreadyMember");
        setTeamId(data.teamId);
        setTeamName(data.teamName);
        return;
      }

      if (data.success) {
        setState("success");
        setTeamId(data.teamId);
        setTeamName(data.teamName);
        // Clear pending invite on success
        localStorage.removeItem("pending_team_invite");
        await refreshTeams();
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setState("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoToTeam = () => {
    switchTeam(teamId);
    navigate("/validate");
  };

  const handleLogin = () => {
    // Store the invite token to process after login
    localStorage.setItem("pending_team_invite", token || "");
    navigate(`/auth?email=${encodeURIComponent(invitedEmail)}`);
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
                  You've been invited to join this team. Sign in or create an account with <strong>{invitedEmail}</strong> to accept.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button onClick={handleLogin} className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In to Accept
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Make sure to use the email address: {invitedEmail}
                </p>
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
                  This invitation was sent to <strong>{invitedEmail}</strong>, but you're signed in with a different email.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                  Sign In with {invitedEmail}
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
