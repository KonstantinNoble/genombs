import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ValidationInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  riskPreference: number;
  onRiskChange: (value: number) => void;
  creativityPreference: number;
  onCreativityChange: (value: number) => void;
  disabled?: boolean;
}

export function ValidationInput({
  prompt,
  onPromptChange,
  riskPreference,
  onRiskChange,
  creativityPreference,
  onCreativityChange,
  disabled = false
}: ValidationInputProps) {
  const getRiskLabel = (value: number) => {
    if (value <= 2) return "Conservative";
    if (value >= 4) return "Aggressive";
    return "Balanced";
  };

  const getCreativityLabel = (value: number) => {
    if (value <= 2) return "Data-Driven";
    if (value >= 4) return "Innovative";
    return "Balanced";
  };

  const MAX_CHARACTERS = 500;
  const charactersRemaining = MAX_CHARACTERS - prompt.length;

  const handlePromptChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      onPromptChange(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Question Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-base font-semibold">
            Your Business Question
          </Label>
          <span className={`text-xs ${charactersRemaining <= 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {prompt.length}/{MAX_CHARACTERS}
          </span>
        </div>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder="E.g., Should I expand my SaaS product to enterprise clients, or focus on growing the SMB market? What pricing strategy should I use?"
          className="min-h-[120px] text-base resize-none"
          disabled={disabled}
          maxLength={MAX_CHARACTERS}
        />
        <p className="text-xs text-muted-foreground">
          Ask any strategic business question. 3 AI models will analyze and provide validated recommendations.
        </p>
      </div>

      {/* Preference Sliders */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Risk Preference */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Risk Tolerance</Label>
            <span className="text-sm font-semibold text-primary">
              {getRiskLabel(riskPreference)}
            </span>
          </div>
          <Slider
            value={[riskPreference]}
            onValueChange={([value]) => onRiskChange(value)}
            min={1}
            max={5}
            step={1}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Safe choices</span>
            <span>Bold moves</span>
          </div>
        </div>

        {/* Creativity Preference */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Analysis Style</Label>
            <span className="text-sm font-semibold text-primary">
              {getCreativityLabel(creativityPreference)}
            </span>
          </div>
          <Slider
            value={[creativityPreference]}
            onValueChange={([value]) => onCreativityChange(value)}
            min={1}
            max={5}
            step={1}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Facts & Data</span>
            <span>Creative Ideas</span>
          </div>
        </div>
      </div>

      {/* Model Info Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs">
          <span className="font-medium">GPT-5.2</span>
          <span className="text-muted-foreground">Reasoning</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs">
          <span className="font-medium">Gemini 3 Pro</span>
          <span className="text-muted-foreground">Creative</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs">
          <span className="font-medium">Gemini Flash</span>
          <span className="text-muted-foreground">Pragmatic</span>
        </div>
      </div>
    </div>
  );
}
