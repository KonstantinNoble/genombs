import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
  { value: 'under-1k', label: 'Under $1K' },
  { value: '1k-5k', label: '$1K - $5K' },
  { value: '5k-20k', label: '$5K - $20K' },
  { value: '20k-plus', label: '$20K+' },
];

const industryOptions = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'services', label: 'Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

const channelOptions = [
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta', label: 'Meta (FB/IG)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'mixed', label: 'Mixed Channels' },
];

const timelineOptions = [
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '12-months', label: '12 Months' },
];

const geographicOptions = [
  { value: 'local', label: 'Local' },
  { value: 'national', label: 'National' },
  { value: 'europe', label: 'Europe' },
  { value: 'global', label: 'Global' },
];

const MAX_CHARS = 150;

const getLabel = (options: { value: string; label: string }[], value?: string) => {
  return options.find(o => o.value === value)?.label;
};

export function StrategyInput({
  value,
  onChange,
  optionalParams,
  onOptionalParamsChange,
  placeholder = "Describe your goals in a few words...",
  disabled = false,
}: StrategyInputProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const charCount = value.length;
  const isAtLimit = charCount >= MAX_CHARS;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue);
    }
  };

  const updateParam = (key: keyof OptionalParams, val: string) => {
    onOptionalParamsChange({
      ...optionalParams,
      [key]: val === 'none' ? undefined : val,
    });
  };

  const removeParam = (key: keyof OptionalParams) => {
    const newParams = { ...optionalParams };
    delete newParams[key];
    onOptionalParamsChange(newParams);
  };

  const activeParams = Object.entries(optionalParams).filter(([_, v]) => v);

  return (
    <div className="space-y-3">
      {/* Main Input Container */}
      <div className="relative">
        <div className="flex items-start gap-2 p-3 rounded-2xl border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
          {/* Plus Button */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full bg-muted hover:bg-muted/80"
                disabled={disabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-4 z-50 bg-popover border border-border shadow-lg" 
              align="start"
              sideOffset={8}
            >
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">Add Context</p>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Budget</Label>
                    <Select
                      value={optionalParams.budget || 'none'}
                      onValueChange={(val) => updateParam('budget', val)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="none">Not specified</SelectItem>
                        {budgetOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    <Select
                      value={optionalParams.industry || 'none'}
                      onValueChange={(val) => updateParam('industry', val)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="none">Not specified</SelectItem>
                        {industryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Channels</Label>
                    <Select
                      value={optionalParams.channels || 'none'}
                      onValueChange={(val) => updateParam('channels', val)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="none">Not specified</SelectItem>
                        {channelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Timeline</Label>
                    <Select
                      value={optionalParams.timeline || 'none'}
                      onValueChange={(val) => updateParam('timeline', val)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="none">Not specified</SelectItem>
                        {timelineOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Geographic</Label>
                    <Select
                      value={optionalParams.geographic || 'none'}
                      onValueChange={(val) => updateParam('geographic', val)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="none">Not specified</SelectItem>
                        {geographicOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              value={value}
              onChange={handleTextChange}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={MAX_CHARS}
              className="min-h-[60px] max-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
          </div>

          {/* Character Count */}
          <span className={`text-xs shrink-0 self-end pb-1 ${isAtLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Active Context Badges */}
      {activeParams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {optionalParams.budget && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Budget: {getLabel(budgetOptions, optionalParams.budget)}
              <button
                type="button"
                onClick={() => removeParam('budget')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {optionalParams.industry && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Industry: {getLabel(industryOptions, optionalParams.industry)}
              <button
                type="button"
                onClick={() => removeParam('industry')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {optionalParams.channels && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Channels: {getLabel(channelOptions, optionalParams.channels)}
              <button
                type="button"
                onClick={() => removeParam('channels')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {optionalParams.timeline && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Timeline: {getLabel(timelineOptions, optionalParams.timeline)}
              <button
                type="button"
                onClick={() => removeParam('timeline')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {optionalParams.geographic && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Geographic: {getLabel(geographicOptions, optionalParams.geographic)}
              <button
                type="button"
                onClick={() => removeParam('geographic')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
