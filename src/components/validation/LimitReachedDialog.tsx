import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LimitReachedDialogProps {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
  resetAt: Date | null;
  onUpgrade: () => void;
}

const PREMIUM_BENEFITS = [
  "20 validations per day (vs. 2 for free)",
  "More detailed AI recommendations (4-5 vs. 2-3)",
  "5-7 action items per analysis",
  "Strategic Alternatives section",
  "Long-term Outlook insights",
  "Competitor Insights analysis"
];

export function LimitReachedDialog({ open, onClose, isPremium, resetAt, onUpgrade }: LimitReachedDialogProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    if (!resetAt || !open) return;

    const updateTimer = () => {
      const diff = resetAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining("Ready!");
        setIsReset(true);
        return;
      }
      setIsReset(false);
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetAt, open]);

  // Premium user view - simple dialog
  if (isPremium) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Daily Limit Reached</DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-muted-foreground text-center mb-4">
              You have used all 20 daily validations.
            </p>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Time until reset:</p>
              <p className="text-3xl font-bold text-foreground font-mono">{timeRemaining}</p>
            </div>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Free user view - upgrade-focused dialog
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Daily Limit Reached
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current status */}
          <div className="text-center">
            <p className="text-muted-foreground">
              You've used your <span className="font-semibold text-foreground">2 free</span> daily validations.
            </p>
          </div>

          {/* Reset timer */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Next reset in:</p>
            <p className={`text-2xl font-bold font-mono ${isReset ? 'text-primary' : 'text-foreground'}`}>
              {timeRemaining}
            </p>
            {isReset && (
              <Button onClick={onClose} className="mt-3">
                Continue Validating
              </Button>
            )}
          </div>

          {!isReset && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground font-medium">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* Premium upgrade section */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="text-lg font-bold text-foreground">
                    Upgrade to Premium
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    $14.99<span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {PREMIUM_BENEFITS.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => { onUpgrade(); onClose(); }}
                  className="w-full text-base py-5 font-semibold"
                  size="lg"
                >
                  Upgrade Now
                </Button>
              </div>

              {/* Maybe later */}
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full text-muted-foreground"
              >
                Maybe Later
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
