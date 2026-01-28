import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Settings, 
  ArrowRight, 
  Plus,
  LogOut,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam, TeamRole } from "@/contexts/TeamContext";
import { useToast } from "@/hooks/use-toast";
import { TEAM_LIMITS } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { CreateTeamDialog } from "@/components/team/CreateTeamDialog";
import { PremiumUpgradeDialog } from "@/components/team/PremiumUpgradeDialog";

const roleColors: Record<TeamRole, string> = {
  owner: "bg-foreground/5 text-foreground border-foreground/10",
  admin: "bg-foreground/5 text-foreground border-foreground/10",
  member: "bg-foreground/5 text-muted-foreground border-foreground/10",
  viewer: "bg-muted/50 text-muted-foreground border-muted",
};

export default function Teams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, isLoading, switchTeam, leaveTeam } = useTeam();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Leave team state
  const [teamToLeave, setTeamToLeave] = useState<{ id: string; name: string } | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const checkPremium = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_credits")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsPremium(data?.is_premium ?? false);
    };
    checkPremium();
  }, [user]);

  const ownedTeamsCount = teams.filter(t => t.role === "owner").length;
  const canCreateMoreTeams = ownedTeamsCount < TEAM_LIMITS.MAX_TEAMS_PER_USER;

  const handleSwitchToTeam = (teamId: string) => {
    switchTeam(teamId);
    navigate("/validate");
  };

  const handleSwitchToPersonal = () => {
    switchTeam(null);
    navigate("/validate");
  };

  const handleSetTeamForLink = (teamId: string) => {
    switchTeam(teamId);
  };

  const handleLeaveTeam = async () => {
    if (!teamToLeave) return;

    setIsLeaving(true);
    try {
      await leaveTeam(teamToLeave.id);
      toast({ 
        title: "Left team",
        description: `You are no longer a member of ${teamToLeave.name}.` 
      });
    } catch (error: any) {
      toast({
        title: "Failed to leave team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
      setTeamToLeave(null);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <SEOHead
        title="My Workspaces"
        description="Manage your personal workspace and team collaborations"
        canonical="/teams"
        noindex={true}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container max-w-4xl py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Workspaces</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Switch between your personal workspace and team collaborations
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {/* Personal Workspace Skeleton */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>

              {/* Team Skeletons */}
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Personal Workspace */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg sm:text-xl">Personal Workspace</h3>
                        <p className="text-base text-muted-foreground">
                          Your private analyses and experiments
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleSwitchToPersonal} className="gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Teams Section */}
              {teams.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold">
                      Teams
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        ({teams.length})
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {teams.map((team) => {
                      const isOwnerOrAdmin = team.role === "owner" || team.role === "admin";
                      const isOwner = team.role === "owner";

                      return (
                        <Card key={team.id} className="hover:border-primary/30 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              {/* Team Info */}
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-lg sm:text-xl truncate">{team.name}</h3>
                                  <div className="flex items-center gap-2 text-base text-muted-foreground">
                                    <Badge variant="outline" className={cn("text-sm", roleColors[team.role])}>
                                      {team.role}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Actions - Full width on mobile */}
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {isOwnerOrAdmin && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                                      asChild
                                    >
                                      <Link to="/team/members" onClick={() => handleSetTeamForLink(team.id)}>
                                        <Users className="h-4 w-4" />
                                        <span className="hidden xs:inline">Members</span>
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                                      asChild
                                    >
                                      <Link to="/team/settings" onClick={() => handleSetTeamForLink(team.id)}>
                                        <Settings className="h-4 w-4" />
                                        <span className="hidden xs:inline">Settings</span>
                                      </Link>
                                    </Button>
                                  </>
                                )}

                                {/* Leave button - only for non-owners */}
                                {!isOwner && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTeamToLeave({ id: team.id, name: team.name })}
                                    className="gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <LogOut className="h-4 w-4" />
                                    Leave
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleSwitchToTeam(team.id)}
                                  className="gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                                >
                                  Open
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Create Team Button - Always visible */}
              <div className="pt-6 space-y-3">
                {isPremium && !canCreateMoreTeams && (
                  <Card className="border-muted bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="font-medium text-base">Team limit reached</p>
                          <p className="text-base text-muted-foreground">
                            You've created {ownedTeamsCount} of {TEAM_LIMITS.MAX_TEAMS_PER_USER} teams. 
                            To create a new team, please delete an existing one first.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2 h-12 border-dashed"
                  onClick={() => {
                    if (isPremium) {
                      if (canCreateMoreTeams) {
                        setShowCreateDialog(true);
                      }
                    } else {
                      setShowUpgradeDialog(true);
                    }
                  }}
                  disabled={isPremium && !canCreateMoreTeams}
                >
                  <Plus className="h-4 w-4" />
                  Create New Team
                  {!isPremium && (
                    <span className="text-xs text-muted-foreground ml-1">(Premium)</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
        <Footer />

        <CreateTeamDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
        
        <PremiumUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
        />

        {/* Leave Team Confirmation Dialog */}
        <AlertDialog open={!!teamToLeave} onOpenChange={(open) => !open && setTeamToLeave(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Team?</AlertDialogTitle>
              <AlertDialogDescription>
                You will lose access to all shared analyses, experiments, and decisions in <strong>{teamToLeave?.name}</strong>. 
                You can rejoin if the team owner invites you again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isLeaving} className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeaveTeam}
                disabled={isLeaving}
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                {isLeaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Leave Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
