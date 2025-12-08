import { useState } from 'react';
import { Plus, X, DollarSign, Globe, Target, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface OptionalParams {
  budget?: string;
  industry?: string;
  channels?: string;
  timeline?: string;
  geographic?: string;
}

interface StrategyInputProps {
  value: string;
  onChange: (value: string) => void;
  optionalParams: OptionalParams;
  onOptionalParamsChange: (params: OptionalParams) => void;
  placeholder?: string;
  disabled?: boolean;
}

const budgetOptions = [
  { value: 'under-1k', label: 'Under $1,000/month' },
  { value: '1k-5k', label: '$1,000 - $5,000/month' },
  { value: '5k-20k', label: '$5,000 - $20,000/month' },
  { value: '20k-50k', label: '$20,000 - $50,000/month' },
  { value: '50k-plus', label: '$50,000+/month' },
];

const timelineOptions = [
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '12-months', label: '12 Months' },
];

export function StrategyInput({
  value,
  onChange,
  optionalParams,
  onOptionalParamsChange,
  placeholder = "Describe your goals, challenges, target audience, and what you want to achieve...",
  disabled = false,
}: StrategyInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(optionalParams.budget || '');
  const [tempIndustry, setTempIndustry] = useState(optionalParams.industry || '');
  const [tempChannels, setTempChannels] = useState(optionalParams.channels || '');
  const [tempTimeline, setTempTimeline] = useState(optionalParams.timeline || '');
  const [tempGeographic, setTempGeographic] = useState(optionalParams.geographic || '');

  const handleAddParams = () => {
    const newParams: OptionalParams = {};
    if (tempBudget) newParams.budget = tempBudget;
    if (tempIndustry) newParams.industry = tempIndustry;
    if (tempChannels) newParams.channels = tempChannels;
    if (tempTimeline) newParams.timeline = tempTimeline;
    if (tempGeographic) newParams.geographic = tempGeographic;
    
    onOptionalParamsChange({ ...optionalParams, ...newParams });
    setIsPopoverOpen(false);
  };

  const removeParam = (key: keyof OptionalParams) => {
    const newParams = { ...optionalParams };
    delete newParams[key];
    onOptionalParamsChange(newParams);
    
    // Reset temp values
    if (key === 'budget') setTempBudget('');
    if (key === 'industry') setTempIndustry('');
    if (key === 'channels') setTempChannels('');
    if (key === 'timeline') setTempTimeline('');
    if (key === 'geographic') setTempGeographic('');
  };

  const hasParams = Object.keys(optionalParams).length > 0;

  const getParamIcon = (key: keyof OptionalParams) => {
    switch (key) {
      case 'budget': return <DollarSign className="h-3 w-3" />;
      case 'industry': return <Building2 className="h-3 w-3" />;
      case 'channels': return <Target className="h-3 w-3" />;
      case 'timeline': return <Clock className="h-3 w-3" />;
      case 'geographic': return <Globe className="h-3 w-3" />;
    }
  };

  const getParamLabel = (key: keyof OptionalParams, value: string) => {
    if (key === 'budget') {
      const option = budgetOptions.find(o => o.value === value);
      return option?.label || value;
    }
    if (key === 'timeline') {
      const option = timelineOptions.find(o => o.value === value);
      return option?.label || value;
    }
    return value;
  };

  return (
    <div className="relative rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
      <div className="flex gap-3">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-10 w-10 rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
              disabled={disabled}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Add Context (Optional)</h4>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3" /> Budget
                  </Label>
                  <Select value={tempBudget} onValueChange={setTempBudget}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> Industry
                  </Label>
                  <Input 
                    placeholder="e.g., E-commerce, SaaS, Healthcare"
                    value={tempIndustry}
                    onChange={(e) => setTempIndustry(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Preferred Channels
                  </Label>
                  <Input 
                    placeholder="e.g., Google Ads, Facebook, LinkedIn"
                    value={tempChannels}
                    onChange={(e) => setTempChannels(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Timeline
                  </Label>
                  <Select value={tempTimeline} onValueChange={setTempTimeline}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Geographic Target
                  </Label>
                  <Input 
                    placeholder="e.g., United States, Europe, Global"
                    value={tempGeographic}
                    onChange={(e) => setTempGeographic(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <Button onClick={handleAddParams} className="w-full" size="sm">
                Add Parameters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
        />
      </div>

      {hasParams && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
          {(Object.entries(optionalParams) as [keyof OptionalParams, string][]).map(([key, paramValue]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="pl-2 pr-1 py-1 gap-1.5 text-xs font-normal bg-secondary/50"
            >
              {getParamIcon(key)}
              <span className="capitalize">{key}:</span>
              <span className="font-medium">{getParamLabel(key, paramValue)}</span>
              <button
                onClick={() => removeParam(key)}
                className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
