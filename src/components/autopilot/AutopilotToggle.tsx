import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
        className="cursor-pointer"
      >
        <span className="text-sm font-medium">Autopilot</span>
      </Label>
    </div>
  );
};

export default AutopilotToggle;
