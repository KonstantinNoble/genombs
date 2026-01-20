import { Button } from "@/components/ui/button";

interface StartExperimentButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function StartExperimentButton({ onClick, disabled }: StartExperimentButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="w-full gap-2 bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-foreground text-lg font-bold py-6 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0 rounded-xl"
    >
      Validation Action
    </Button>
  );
}
