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
import type { Session } from "@supabase/supabase-js";

type InviteState = "loading" | "requiresAuth" | "emailMismatch" | "success" | "error" | "alreadyMember";

export default function TeamInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { switchTeam, refreshTeams } = useTeam();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const [state, setState] = useState<InviteState>("loading");
  const [teamName, setTeamName] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Invalid invitation link");
      return;
    }

    acceptInvitation();
  }, [token, session]);

  const acceptInvitation = async () => {
    if (!token) return;

    setState("loading");

    try {
      const headers: Record<string, string> = {};
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await supabase.functions.invoke("team-management", {
        body: { action: "accept-invite", token },
        headers,
      });

      const data = response.data;

      if (response.error) {
        setState("error");
        setErrorMessage("Failed to process invitation");
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

      if (data.error) {
        setState("error");
        setErrorMessage(data.error === "Invalid or expired invitation" 
          ? "This invitation has expired or is invalid."
          : data.error);
        return;
      }

      if (data.requiresAuth) {
        setState("requiresAuth");
        setTeamName(data.teamName || "the team");
        setInvitedEmail(data.email);
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
        await refreshTeams();
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setState("error");
      setErrorMessage("An unexpected error occurred");
    }
  };

  const handleGoToTeam = () => {
    switchTeam(teamId);
    navigate("/validate");
  };

  const handleLogin = () => {
    // Store the invite token to process after login
    sessionStorage.setItem("pending_team_invite", token || "");
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
