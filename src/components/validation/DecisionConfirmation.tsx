import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, FileCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DecisionConfirmationProps {
  validationId: string;
  prompt: string;
  onConfirmed: (decisionRecordId: string) => void;
  isConfirmed: boolean;
  decisionRecordId?: string;
  className?: string;
}

export function DecisionConfirmation({
  validationId,
  prompt,
  onConfirmed,
  isConfirmed,
  decisionRecordId,
  className
}: DecisionConfirmationProps) {
  const [ownershipChecked, setOwnershipChecked] = useState(false);
  const [reviewedChecked, setReviewedChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canConfirm = ownershipChecked && reviewedChecked;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to confirm your decision.",
          variant: "destructive"
        });
        return;
      }

      // Create decision record
      const { data: decisionRecord, error: insertError } = await supabase
        .from('decision_records')
        .insert({
          user_id: user.id,
          validation_id: validationId,
          decision_title: prompt.substring(0, 100),
          decision_context: prompt,
          user_confirmed_ownership: true,
          confirmed_at: new Date().toISOString(),
          status: 'confirmed'
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Create audit log entry
      await supabase.rpc('log_decision_action', {
        p_decision_id: decisionRecord.id,
        p_action: 'confirmed',
        p_metadata: {
          confirmed_statements: [
            'I confirm that the final decision remains with me',
            'I have reviewed all documented perspectives'
          ],
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Decision Confirmed",
        description: "Your decision record has been created. You can now export the audit report."
      });

      onConfirmed(decisionRecord.id);

    } catch (error) {
      console.error('Error confirming decision:', error);
      toast({
        title: "Confirmation Failed",
        description: "Could not create decision record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className={cn(
        "p-4 sm:p-5 rounded-xl border-2 border-green-500/30 bg-green-500/5",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/20">
            <FileCheck className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-700 dark:text-green-400">
              Decision Record Confirmed
            </p>
            <p className="text-sm text-muted-foreground">
              You confirmed ownership on {new Date().toLocaleDateString()}. PDF export is now available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-xl border-2 border-amber-500/30 bg-amber-500/5",
      className
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-full bg-amber-500/20 shrink-0">
          <Shield className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Confirm Decision Ownership
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            To create an auditable decision record and enable PDF export, please confirm the following:
          </p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
          <Checkbox
            id="ownership"
            checked={ownershipChecked}
            onCheckedChange={(checked) => setOwnershipChecked(checked === true)}
            disabled={isSubmitting}
            className="mt-0.5"
          />
          <Label 
            htmlFor="ownership" 
            className="text-sm sm:text-base cursor-pointer leading-relaxed"
          >
            <span className="font-semibold">I confirm that the final decision remains with me.</span>
            <span className="text-muted-foreground block mt-1">
              This analysis documents perspectives only – it does not make decisions for me.
            </span>
          </Label>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
          <Checkbox
            id="reviewed"
            checked={reviewedChecked}
            onCheckedChange={(checked) => setReviewedChecked(checked === true)}
            disabled={isSubmitting}
            className="mt-0.5"
          />
          <Label 
            htmlFor="reviewed" 
            className="text-sm sm:text-base cursor-pointer leading-relaxed"
          >
            <span className="font-semibold">I have reviewed all documented perspectives.</span>
            <span className="text-muted-foreground block mt-1">
              I understand both the consensus points and areas of dissent.
            </span>
          </Label>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mb-5">
        <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-muted-foreground">
          PDF export requires confirmation. This creates a timestamped audit record that can be shared with stakeholders.
        </p>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!canConfirm || isSubmitting}
        className={cn(
          "w-full h-11 sm:h-12 font-semibold transition-all",
          canConfirm 
            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" 
            : "bg-muted text-muted-foreground"
        )}
      >
        {isSubmitting ? (
          "Creating Decision Record..."
        ) : canConfirm ? (
          <>
            <FileCheck className="h-4 w-4 mr-2" />
            Confirm & Create Decision Record
          </>
        ) : (
          "Check both boxes to confirm"
        )}
      </Button>
    </div>
  );
}
