import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function StrategyInput({
  value,
  onChange,
  optionalParams,
  onOptionalParamsChange,
  placeholder = "Describe your goals in a few words...",
  disabled = false,
}: StrategyInputProps) {
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

  return (
    <div className="space-y-4">
      {/* Main Text Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="strategy-input">Your Goals</Label>
          <span className={`text-xs ${isAtLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <Textarea
          id="strategy-input"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={MAX_CHARS}
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Context Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Budget</Label>
          <Select
            value={optionalParams.budget || 'none'}
            onValueChange={(val) => updateParam('budget', val)}
            disabled={disabled}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
  );
}
