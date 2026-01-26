import { useState } from "react";
import { Check, ChevronDown, Building2, User, Plus, Loader2 } from "lucide-react";
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

export function TeamSwitcher() {
  const { currentTeam, teams, switchTeam, isLoading } = useTeam();
  const { isPremium } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

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
                <Building2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate hidden sm:inline">{currentTeam.name}</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Personal</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {/* Personal Workspace */}
          <DropdownMenuItem
            onClick={() => {
              switchTeam(null);
              setOpen(false);
            }}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span className="flex-1">Personal Workspace</span>
            {!currentTeam && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>

          {/* Teams */}
          {teams.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Teams
              </div>
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => {
                    switchTeam(team.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{team.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {team.role}
                    </span>
                  </div>
                  {currentTeam?.id === team.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Create Team */}
          {isPremium && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setShowCreateDialog(true);
                  setOpen(false);
                }}
                className="gap-2 text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Create Team</span>
              </DropdownMenuItem>
            </>
          )}

          {/* Upgrade prompt for non-premium */}
          {!isPremium && teams.length === 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs text-muted-foreground">
                <span className="text-primary font-medium">Upgrade to Premium</span> to create and manage teams.
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
