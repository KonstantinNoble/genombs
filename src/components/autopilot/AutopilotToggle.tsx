import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface AutopilotToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

const AutopilotToggle = ({ enabled, onToggle, disabled }: AutopilotToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="autopilot-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      <Label 
        htmlFor="autopilot-toggle" 
        className="flex items-center gap-1.5 cursor-pointer"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Autopilot</span>
      </Label>
    </div>
  );
};

export default AutopilotToggle;
