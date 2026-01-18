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
  "20 validations per day instead of 2",
  "4-5 detailed recommendations per model",
  "5-7 concrete action items",
  "Strategic Alternatives analysis",
  "Long-term Outlook predictions",
  "Competitor Intelligence insights"
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
            You've Hit Today's Limit
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current status */}
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              Your <span className="font-semibold text-foreground">2 free</span> daily validations are used up.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Don't let decision paralysis slow you down.
            </p>
          </div>

          {/* Reset timer */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Next free validation in:</p>
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
                <span className="text-sm text-muted-foreground font-medium">or skip the wait</span>
                <Separator className="flex-1" />
              </div>

              {/* Premium upgrade section */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                <div className="text-center mb-5">
                  <p className="text-xl font-bold text-foreground">
                    Go Premium Today
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    $14.99<span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cancel anytime. No questions asked.
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {PREMIUM_BENEFITS.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="text-primary font-bold shrink-0">—</span>
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => { onUpgrade(); onClose(); }}
                  className="w-full text-base py-6 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  size="lg"
                >
                  Unlock Premium Access
                </Button>
              </div>

              {/* Maybe later */}
              <button 
                onClick={onClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                I'll wait for the reset
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
