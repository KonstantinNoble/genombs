import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface AnalysisOptionsType {
  marketSize: boolean;
  competitors: boolean;
  trends: boolean;
  channels: boolean;
  demographics: boolean;
  growth: boolean;
}

interface AnalysisOptionsProps {
  options: AnalysisOptionsType;
  onChange: (options: AnalysisOptionsType) => void;
  disabled?: boolean;
}

const optionLabels: Record<keyof AnalysisOptionsType, { label: string; description: string }> = {
  marketSize: {
    label: "Market Size",
    description: "Total market value, TAM, and SAM"
  },
  growth: {
    label: "Growth Projections",
    description: "CAGR, YoY growth, and future projections"
  },
  competitors: {
    label: "Competitor Analysis",
    description: "Top competitors and market share distribution"
  },
  trends: {
    label: "Market Trends",
    description: "Key trends with impact and growth potential"
  },
  channels: {
    label: "Marketing Channels",
    description: "Channel effectiveness and ROI analysis"
  },
  demographics: {
    label: "Demographics",
    description: "Customer segments and spending patterns"
  }
};

export function AnalysisOptions({ options, onChange, disabled }: AnalysisOptionsProps) {
  const handleChange = (key: keyof AnalysisOptionsType, checked: boolean) => {
    onChange({ ...options, [key]: checked });
  };

  const selectAll = () => {
    const allSelected: AnalysisOptionsType = {
      marketSize: true,
      competitors: true,
      trends: true,
      channels: true,
      demographics: true,
      growth: true
    };
    onChange(allSelected);
  };

  const clearAll = () => {
    const allCleared: AnalysisOptionsType = {
      marketSize: false,
      competitors: false,
      trends: false,
      channels: false,
      demographics: false,
      growth: false
    };
    onChange(allCleared);
  };

  const allSelected = Object.values(options).every(v => v);
  const noneSelected = Object.values(options).every(v => !v);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium text-foreground">Analysis Options</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled || allSelected}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Select All
          </button>
          <span className="text-muted-foreground text-[10px] sm:text-xs">|</span>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled || noneSelected}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(optionLabels) as Array<keyof AnalysisOptionsType>).map((key) => (
          <div
            key={key}
            className={`
              flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border transition-all
              ${options[key] 
                ? 'border-primary/50 bg-primary/5' 
                : 'border-border bg-background/50 hover:border-border/80'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && handleChange(key, !options[key])}
          >
            <Checkbox
              id={key}
              checked={options[key]}
              onCheckedChange={(checked) => handleChange(key, checked === true)}
              disabled={disabled}
              className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4"
            />
            <div className="space-y-0 sm:space-y-0.5 min-w-0">
              <Label 
                htmlFor={key} 
                className={`text-[11px] sm:text-sm font-medium cursor-pointer leading-tight ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                {optionLabels[key].label}
              </Label>
              <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">
                {optionLabels[key].description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
