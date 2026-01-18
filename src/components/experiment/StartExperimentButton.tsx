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
      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0"
    >
      Turn into Experiment
    </Button>
  );
}
