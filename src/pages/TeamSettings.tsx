import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Trash2, 
  Loader2,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam, TeamRole } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Session } from "@supabase/supabase-js";

interface TeamMember {
  id: string;
  user_id: string;
  role: TeamRole;
  email: string;
}

export default function TeamSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTeam, refreshTeams, deleteTeam } = useTeam();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  const [teamName, setTeamName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delete team
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = userRole === "owner";
  const isAdmin = userRole === "owner" || userRole === "admin";

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (!currentTeam) {
        navigate("/teams");
        return;
      }
      
      setTeamName(currentTeam.name);
      
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
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast({
        title: "Failed to load team data",
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

  const handleRenameTeam = async () => {
    if (!currentTeam || !session || !teamName.trim()) return;

    setIsRenaming(true);
    try {
      const response = await supabase.functions.invoke("team-management", {
        body: { action: "rename", teamId: currentTeam.id, name: teamName.trim() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({ title: "Team renamed successfully" });
      await refreshTeams();
    } catch (error: any) {
      toast({
        title: "Failed to rename team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!currentTeam || deleteConfirmation !== currentTeam.name) return;

    setIsDeleting(true);
    try {
      await deleteTeam(currentTeam.id);
      toast({ 
        title: "Team deleted",
        description: "All team data has been permanently removed." 
      });
      navigate("/validate");
    } catch (error: any) {
      toast({
        title: "Failed to delete team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };


  if (!currentTeam) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-2xl py-8 px-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/team/members")}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Team Members
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Team Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your team: {currentTeam.name}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {/* Team Name Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </CardContent>
            </Card>


            {/* Danger Zone Card Skeleton */}
            <Card className="border-destructive/30">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rename Team */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Name</CardTitle>
                  <CardDescription>
                    Change how your team appears to members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="teamName" className="sr-only">
                        Team Name
                      </Label>
                      <Input
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value.slice(0, 100))}
                        placeholder="Team name"
                        disabled={isRenaming}
                        maxLength={100}
                        className="min-h-[44px] sm:min-h-0"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {teamName.length}/100
                      </p>
                    </div>
                    <Button
                      onClick={handleRenameTeam}
                      disabled={isRenaming || teamName === currentTeam.name || !teamName.trim() || teamName.length > 100}
                      className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
                    >
                      {isRenaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Delete Team - Owner only */}
            {isOwner && (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Permanently delete this team and all its data including shared analyses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Team
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Non-owner info */}
            {!isOwner && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    You are a <span className="font-medium">{userRole}</span> of this team. 
                    Only the team owner can delete the team.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />


      {/* Delete Team Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Team Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action <strong>cannot be undone</strong>. This will permanently delete:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>All team members and their access</li>
                <li>All shared analyses and validations</li>
                <li>All experiments linked to team analyses</li>
                <li>All decision records created in team context</li>
              </ul>
              <div className="pt-2">
                <Label htmlFor="deleteConfirm" className="text-sm">
                  Type <strong>{currentTeam.name}</strong> to confirm:
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Team name"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto min-h-[44px] sm:min-h-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isDeleting || deleteConfirmation !== currentTeam.name}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
