import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LimitReachedDialogProps {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
  resetAt: Date | null;
  onUpgrade: () => void;
}

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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Daily Limit Reached</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              You've used all 15 validations for today.
            </p>
            <p className="text-2xl font-bold text-foreground font-mono">{timeRemaining}</p>
            <p className="text-xs text-muted-foreground mt-1">until reset</p>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Free user view - compact, conversion-focused dialog
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              2 of 2 Free Checks Used
            </DialogTitle>
          </DialogHeader>
          
          {/* Timer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Next free check in</p>
            <p className={`text-xl font-bold font-mono mt-1 ${isReset ? 'text-primary' : 'text-foreground'}`}>
              {timeRemaining}
            </p>
            {isReset && (
              <Button onClick={onClose} size="sm" className="mt-2">
                Continue
              </Button>
            )}
          </div>
        </div>

        {!isReset && (
          <>
            {/* Premium Section */}
            <div className="bg-primary/5 border-t border-primary/10 px-6 py-5">
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-bold text-foreground">Premium</span>
                <span className="text-primary font-bold">$26.99<span className="text-muted-foreground font-normal text-sm">/mo</span></span>
              </div>
              
              {/* Compact benefits - 2 columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">15×</span>
                  <span className="text-muted-foreground">daily checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">7</span>
                  <span className="text-muted-foreground">action steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">+</span>
                  <span className="text-muted-foreground">backup strategies</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">+</span>
                  <span className="text-muted-foreground">competitor context</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">+</span>
                  <span className="text-muted-foreground">12-month outlook</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">+</span>
                  <span className="text-muted-foreground">full analysis</span>
                </div>
              </div>

              <Button 
                onClick={() => { onUpgrade(); onClose(); }}
                className="w-full font-semibold"
              >
                Upgrade to Premium
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                Cancel anytime · No commitment
              </p>
            </div>

            {/* Close link */}
            <button 
              onClick={onClose}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-3 border-t"
            >
              Wait for reset
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
