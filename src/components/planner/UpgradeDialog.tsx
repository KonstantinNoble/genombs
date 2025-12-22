import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Brain, Sparkles } from "lucide-react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export function UpgradeDialog({ open, onOpenChange, onUpgrade }: UpgradeDialogProps) {
  const benefits = [
    { icon: Brain, text: "Deep Analysis with 6 phases + AI insights" },
    { icon: Zap, text: "6 standard analyses per day (vs 2)" },
    { icon: Sparkles, text: "Autopilot mode for daily focus tasks" },
    { icon: Crown, text: "Priority AI processing" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl">Upgrade Your Plan for More Features</DialogTitle>
          <DialogDescription className="text-base">
            Unlock the full power of AI Business Planner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30"
            size="lg"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
