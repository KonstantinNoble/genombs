import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, 
  User, 
  Users, 
  Settings, 
  ArrowRight, 
  Plus,
  Crown,
  Shield,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam, TeamRole } from "@/contexts/TeamContext";
import { TEAM_LIMITS } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { CreateTeamDialog } from "@/components/team/CreateTeamDialog";
import { PremiumUpgradeDialog } from "@/components/team/PremiumUpgradeDialog";

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

export default function Teams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, isLoading, switchTeam } = useTeam();
  const [isPremium, setIsPremium] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

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
            <h1 className="text-3xl font-bold mb-2">My Workspaces</h1>
            <p className="text-muted-foreground">
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Personal Workspace</h3>
                        <p className="text-sm text-muted-foreground">
                          Your private analyses and experiments
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleSwitchToPersonal} className="gap-2">
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
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Teams
                      <span className="text-sm font-normal text-muted-foreground">
                        ({teams.length})
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {teams.map((team) => {
                      const RoleIcon = roleIcons[team.role];
                      const isOwnerOrAdmin = team.role === "owner" || team.role === "admin";

                      return (
                        <Card key={team.id} className="hover:border-primary/30 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{team.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <RoleIcon className="h-3.5 w-3.5" />
                                    <span className="capitalize">{team.role}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={roleColors[team.role]}>
                                  {team.role}
                                </Badge>
                                
                                {isOwnerOrAdmin && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1.5"
                                      asChild
                                    >
                                      <Link to="/team/members" onClick={() => handleSetTeamForLink(team.id)}>
                                        <Users className="h-4 w-4" />
                                        Members
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1.5"
                                      asChild
                                    >
                                      <Link to="/team/settings" onClick={() => handleSetTeamForLink(team.id)}>
                                        <Settings className="h-4 w-4" />
                                        Settings
                                      </Link>
                                    </Button>
                                  </>
                                )}
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleSwitchToTeam(team.id)}
                                  className="gap-1.5"
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
              <div className="pt-6">
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
                  {!isPremium ? (
                    <Crown className="h-4 w-4 text-amber-500 ml-1" />
                  ) : !canCreateMoreTeams ? (
                    <span className="text-muted-foreground text-xs">
                      ({ownedTeamsCount}/{TEAM_LIMITS.MAX_TEAMS_PER_USER} teams)
                    </span>
                  ) : null}
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
      </div>
    </>
  );
}
