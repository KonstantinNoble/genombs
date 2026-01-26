import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Crown, 
  Trash2, 
  Loader2,
  Clock,
  X,
  ChevronLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const roleIcons: Record<TeamRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye,
};

const roleColors: Record<TeamRole, string> = {
  owner: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  member: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  viewer: "bg-muted text-muted-foreground border-muted",
};

export default function TeamMembers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTeam, teamRole, refreshTeams } = useTeam();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [isInviting, setIsInviting] = useState(false);

  // Confirm dialogs
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<TeamInvitation | null>(null);

  const isAdmin = userRole === "owner" || userRole === "admin";
  const isOwner = userRole === "owner";

  useEffect(() => {
    if (!currentTeam) {
      navigate("/validate");
      return;
    }
    fetchMembers();
  }, [currentTeam]);

  const fetchMembers = async () => {
    if (!currentTeam || !session) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("team-management", {
        body: { action: "members", teamId: currentTeam.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setMembers(response.data.members || []);
      setInvitations(response.data.invitations || []);
      setUserRole(response.data.userRole);
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
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/validate")}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Validation
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{currentTeam.name}</h1>
          <p className="text-muted-foreground">
            Manage team members and invitations
          </p>
        </div>

        {/* Invite Form (Admin/Owner only) */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Member
              </CardTitle>
              <CardDescription>
                Send an invitation email to add a new team member. They'll need to create an account or log in to accept.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isInviting || !inviteEmail}>
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span className="ml-2">Invite</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const isSelf = member.user_id === user?.id;
                  const canModify = isOwner && !isSelf && member.role !== "owner";
                  const canRemove = (isAdmin && member.role !== "owner" && !isSelf) || isSelf;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <RoleIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
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

                      <div className="flex items-center gap-2">
                        {canModify ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) =>
                              handleRoleChange(member.id, member.user_id, v as TeamRole)
                            }
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
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
                            className="text-destructive hover:text-destructive"
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
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Invitations ({invitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-dashed bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={roleColors[invite.role]}>
                        {invite.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setInviteToCancel(invite)}
                      >
                        <X className="h-4 w-4" />
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
