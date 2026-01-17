import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";

interface StartExperimentButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function StartExperimentButton({ onClick, disabled }: StartExperimentButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="w-full gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
    >
      <FlaskConical className="h-4 w-4" />
      Turn into Experiment
    </Button>
  );
}
