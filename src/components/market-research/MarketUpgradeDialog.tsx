import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";

interface MarketUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketUpgradeDialog({ open, onOpenChange }: MarketUpgradeDialogProps) {
  const { openCheckout, isLoading } = useFreemiusCheckout();

  const benefits = [
    "3 market research analyses per day",
    "Access to all analysis options",
    "Detailed competitor insights",
    "Historical data comparison",
    "Priority data processing"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Get more market research analyses and unlock premium features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            You have used your free daily analysis. Upgrade to Premium for:
          </p>
          
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                <span className="text-primary font-medium">+</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => openCheckout()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Loading..." : "Upgrade to Premium"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
