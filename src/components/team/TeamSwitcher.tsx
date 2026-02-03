import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { PremiumUpgradeDialog } from "./PremiumUpgradeDialog";

export function TeamSwitcher() {
  const navigate = useNavigate();
  const { currentTeam, teams, switchTeam, isLoading } = useTeam();
  const { isPremium } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [open, setOpen] = useState(false);

  // Count owned teams for limit check
  const ownedTeamsCount = teams.filter(t => t.role === "owner").length;
  const canCreateMoreTeams = ownedTeamsCount < 5;

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  const handleManageTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    switchTeam(teamId);
    setOpen(false);
    navigate("/teams");
  };

  const handleCreateTeamClick = () => {
    setOpen(false);
    if (isPremium) {
      if (canCreateMoreTeams) {
        setShowCreateDialog(true);
      }
    } else {
      setShowUpgradeDialog(true);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 px-2 sm:px-3 max-w-[160px] sm:max-w-[200px]",
              currentTeam && "bg-primary/10 border border-primary/20"
            )}
          >
            {currentTeam ? (
              <>
                <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {currentTeam.name.charAt(0)}
                </span>
                <span className="truncate hidden sm:inline">{currentTeam.name}</span>
              </>
            ) : (
              <>
                <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  P
                </span>
                <span className="hidden sm:inline">Personal</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] sm:w-[280px] max-w-[320px]">
          {/* Personal Workspace */}
          <DropdownMenuItem
            onClick={() => {
              switchTeam(null);
              setOpen(false);
            }}
            className="gap-2 min-h-[44px] sm:min-h-0"
          >
            <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
              P
            </span>
            <span className="flex-1 truncate">Personal Workspace</span>
            {!currentTeam && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>

          {/* Teams */}
          {teams.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Teams
              </div>
              {teams.map((team) => (
                <div key={team.id} className="relative">
                  <DropdownMenuItem
                    onClick={() => {
                      switchTeam(team.id);
                      setOpen(false);
                    }}
                    className="gap-2 pr-20 min-h-[48px] sm:min-h-0"
                  >
                    <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {team.name.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block text-sm">{team.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {team.role}
                      </span>
                    </div>
                    {currentTeam?.id === team.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                  {/* Manage button overlay */}
                  <button
                    onClick={(e) => handleManageTeam(e, team.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors min-h-[36px]"
                  >
                    <span>Manage</span>
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Create Team - Always visible */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCreateTeamClick}
            disabled={isPremium && !canCreateMoreTeams}
            className={cn(
              "gap-2 min-h-[44px] sm:min-h-0",
              isPremium && canCreateMoreTeams && "text-primary",
              isPremium && !canCreateMoreTeams && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="flex-1">Create Team</span>
            {!isPremium ? (
              <span className="text-xs text-muted-foreground">(Premium)</span>
            ) : !canCreateMoreTeams ? (
              <span className="text-xs text-muted-foreground shrink-0">(5/5)</span>
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <PremiumUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </>
  );
}