import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

  useEffect(() => {
    if (!resetAt || !open) return;

    const updateTimer = () => {
      const diff = resetAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining("Limit has been reset. You can validate again.");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetAt, open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Daily Limit Reached</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isPremium ? (
              "You have used all 20 daily validations. Your limit will reset in:"
            ) : (
              "You have used your 2 free daily validations. Upgrade to Premium for 20 validations per day."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Time until reset:</p>
            <p className="text-3xl font-bold text-foreground font-mono">{timeRemaining}</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!isPremium && (
            <Button 
              onClick={() => { onUpgrade(); onClose(); }}
              className="w-full sm:w-auto"
            >
              Upgrade to Premium
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
