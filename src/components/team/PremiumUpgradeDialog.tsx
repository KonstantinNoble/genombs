import { Link } from "react-router-dom";
import { Crown, Users, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumUpgradeDialog({ open, onOpenChange }: PremiumUpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Premium Feature
          </DialogTitle>
          <DialogDescription>
            Team collaboration is available for Premium users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Create & Manage Teams</p>
              <p className="text-xs text-muted-foreground mt-1">
                Collaborate with up to 5 team members, share analyses, and work together on business decisions.
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Upgrade to Premium for <span className="font-semibold text-foreground">$26.99/month</span>
            </p>
            <Button asChild className="w-full gap-2">
              <Link to="/pricing" onClick={() => onOpenChange(false)}>
                View Premium Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
