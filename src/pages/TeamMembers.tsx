import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Trash2, 
  Loader2,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TEAM_LIMITS } from "@/lib/constants";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam, TeamRole } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Session } from "@supabase/supabase-js";

interface TeamMember {
  id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  email: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  expires_at: string;
  created_at: string;
}

const roleColors: Record<TeamRole, string> = {
  owner: "bg-foreground/5 text-foreground border-foreground/10",
  admin: "bg-foreground/5 text-foreground border-foreground/10",
  member: "bg-foreground/5 text-muted-foreground border-foreground/10",
  viewer: "bg-muted/50 text-muted-foreground border-muted",
};

export default function TeamMembers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentTeam, teamRole, refreshTeams } = useTeam();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerIsPremium, setOwnerIsPremium] = useState<boolean | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [isInviting, setIsInviting] = useState(false);

  // Confirm dialogs
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<TeamInvitation | null>(null);

  const isAdmin = userRole === "owner" || userRole === "admin";
  const isOwner = userRole === "owner";
  
  // Calculate member limit status
  const isMemberLimitReached = members.length + invitations.length >= TEAM_LIMITS.MAX_MEMBERS_PER_TEAM;

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (!currentTeam) {
        navigate("/teams");
        return;
      }
      
      if (data.session && currentTeam) {
        fetchMembersWithSession(data.session);
      }
    };
    init();
  }, [currentTeam]);

  const fetchMembersWithSession = async (sess: Session) => {
    if (!currentTeam) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("team-management", {
        body: { action: "members", teamId: currentTeam.id },
        headers: {
          Authorization: `Bearer ${sess.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setMembers(response.data.members || []);
      setInvitations(response.data.invitations || []);
      setUserRole(response.data.userRole);
      setOwnerIsPremium(response.data.ownerIsPremium ?? true);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast({
        title: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!session) return;
    fetchMembersWithSession(session);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail || !currentTeam || !session) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await supabase.functions.invoke("team-management", {
        body: {
          action: "invite",
          teamId: currentTeam.id,
          email: inviteEmail,
          role: inviteRole,
          siteUrl: window.location.origin,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data?.error) {
        if (response.data.error === "INVITE_RATE_LIMIT_EXCEEDED") {
          toast({
            title: "Rate limit exceeded",
            description: "You can only send 10 invitations per day. Try again tomorrow.",
            variant: "destructive",
          });
        } else if (response.data.error === "EMAIL_INVITE_LIMIT_EXCEEDED") {
          toast({
            title: "Email limit exceeded",
            description: "This email already has too many pending invitations.",
            variant: "destructive",
          });
        } else if (response.data.error === "MEMBER_LIMIT_REACHED") {
          toast({
            title: "Member limit reached",
            description: `This team has reached the maximum of ${TEAM_LIMITS.MAX_MEMBERS_PER_TEAM} members.`,
            variant: "destructive",
          });
        } else if (response.data.error === "OWNER_NOT_PREMIUM") {
          toast({
            title: "Premium subscription required",
            description: "The workspace owner needs an active Premium subscription to invite new members.",
            variant: "destructive",
          });
        } else {
          throw new Error(response.data.error);
        }
        return;
      }

      toast({
        title: "Invitation sent!",
        description: `An email has been sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      fetchMembers();
    } catch (error: any) {
      console.error("Failed to invite:", error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !currentTeam || !session) return;

    try {
      const response = await supabase.functions.invoke("team-management", {
        body: {
          action: "remove-member",
          teamId: currentTeam.id,
          userId: memberToRemove.user_id,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Member removed",
        description: `${memberToRemove.email} has been removed from the team.`,
      });

      setMemberToRemove(null);
      
      // If removing self, refresh teams and navigate
      if (memberToRemove.user_id === user?.id) {
        await refreshTeams();
        navigate("/validate");
      } else {
        fetchMembers();
      }
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelInvite = async () => {
    if (!inviteToCancel || !session) return;

    try {
      const response = await supabase.functions.invoke("team-management", {
        body: { action: "cancel-invite", invitationId: inviteToCancel.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Invitation cancelled",
      });

      setInviteToCancel(null);
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, userId: string, newRole: TeamRole) => {
    if (!currentTeam || !session) return;

    try {
      const response = await supabase.functions.invoke("team-management", {
        body: {
          action: "update-role",
          teamId: currentTeam.id,
          userId,
          role: newRole,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({ title: "Role updated" });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentTeam) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8 px-4">
        {/* Back button with smart navigation */}
        <Button
          variant="ghost"
          onClick={() => {
            const from = (location.state as { from?: string })?.from;
            navigate(from || "/teams");
          }}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{currentTeam.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{currentTeam.name}</h1>
              <p className="text-base text-muted-foreground">
                Manage members and invitations
              </p>
            </div>
          </div>
          {(userRole === "owner" || userRole === "admin") && (
            <Button
              variant="outline"
              onClick={() => navigate("/team/settings")}
              className="gap-2 shrink-0 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              Team Settings
            </Button>
          )}
        </div>

        {/* Role Descriptions */}
        <Card className="mb-6 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-medium text-base">Owner</p>
                <p className="text-muted-foreground">Full control, manage & delete team</p>
              </div>
              <div>
                <p className="font-medium text-base">Member</p>
                <p className="text-muted-foreground">Create & view Decision Records and experiments</p>
              </div>
              <div>
                <p className="font-medium text-base">Viewer</p>
                <p className="text-muted-foreground">View-only access to Decision Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite Form (Admin/Owner only) */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Invite Member
                <span className="text-base font-normal text-muted-foreground ml-2">
                  ({members.length}/{TEAM_LIMITS.MAX_MEMBERS_PER_TEAM})
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                Send an invitation email to add a new team member. They'll need to create an account or log in to accept.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownerIsPremium === false && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm mb-4">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Invitations disabled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The workspace owner's Premium subscription has expired. New member invitations are blocked until the subscription is renewed.
                    </p>
                  </div>
                </div>
              )}
              {isMemberLimitReached && ownerIsPremium !== false && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm mb-4">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Member limit reached ({TEAM_LIMITS.MAX_MEMBERS_PER_TEAM} max). Remove a member or cancel an invitation to add more.</span>
                </div>
              )}
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                </div>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as TeamRole)}
                  disabled={isInviting}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="submit" 
                  disabled={isInviting || !inviteEmail || isMemberLimitReached || ownerIsPremium === false}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Invite"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const isSelf = member.user_id === user?.id;
                  const canModify = isOwner && !isSelf && member.role !== "owner";
                  // Owner cannot be removed (not even by themselves)
                  const canRemove = member.role !== "owner" && ((isAdmin && !isSelf) || isSelf);

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card gap-3"
                    >
                      {/* Member Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                          <span className="text-sm font-bold text-muted-foreground">
                            {member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-sm sm:text-base">
                            {member.email}
                            {isSelf && (
                              <span className="text-muted-foreground ml-2">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        {canModify ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) =>
                              handleRoleChange(member.id, member.user_id, v as TeamRole)
                            }
                          >
                            <SelectTrigger className="w-[110px] min-h-[44px] sm:min-h-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={roleColors[member.role]}
                          >
                            {member.role}
                          </Badge>
                        )}

                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {isAdmin && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Pending Invitations ({invitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-dashed bg-muted/30 gap-3"
                  >
                    {/* Invite Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-sm sm:text-base">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Badge variant="outline" className={roleColors[invite.role]}>
                        {invite.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] sm:min-h-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setInviteToCancel(invite)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {memberToRemove?.user_id === user?.id
                ? "Leave Team?"
                : "Remove Member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.user_id === user?.id
                ? "You will lose access to this team's shared analyses and decisions."
                : `${memberToRemove?.email} will lose access to this team.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {memberToRemove?.user_id === user?.id ? "Leave" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog
        open={!!inviteToCancel}
        onOpenChange={(open) => !open && setInviteToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              The invitation to {inviteToCancel?.email} will be revoked and they won't be able to join.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvite}>
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}