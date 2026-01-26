import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createTeam, switchTeam } = useTeam();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      toast({
        title: "Invalid name",
        description: "Team name must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }

    if (name.trim().length > 100) {
      toast({
        title: "Name too long",
        description: "Team name must be 100 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const team = await createTeam(name.trim());
      toast({
        title: "Team created!",
        description: `${team.name} is ready. Invite your team members to get started.`,
      });
      switchTeam(team.id);
      onOpenChange(false);
      setName("");
      navigate("/team/members");
    } catch (error: any) {
      console.error("Failed to create team:", error);
      
      if (error.message === "PREMIUM_REQUIRED") {
        toast({
          title: "Premium required",
          description: "Only Premium subscribers can create teams.",
          variant: "destructive",
        });
      } else if (error.message === "TEAM_LIMIT_REACHED") {
        toast({
          title: "Team limit reached",
          description: "You can create a maximum of 5 teams. Delete an existing team to create a new one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create team",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-2">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Create a Team</DialogTitle>
            <DialogDescription className="text-center">
              Collaborate with your colleagues on strategic decisions. Invite team members after creating your team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g., Marketing Team, Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 100))}
                disabled={isLoading}
                maxLength={100}
                autoFocus
              />
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>You can change this later in team settings.</span>
                <span>{name.length}/100</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || name.trim().length < 2}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
