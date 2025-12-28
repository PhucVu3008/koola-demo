import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DurationSelectorProps {
  value: number; // in seconds
  onChange: (seconds: number) => void;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
  className?: string;
}

export function DurationSelector({
  value,
  onChange,
  label,
  description,
  min = 0,
  max = 3600,
  step = 1,
  unit = 'seconds',
  className
}: DurationSelectorProps) {
  const getDisplayValue = () => {
    switch (unit) {
      case 'minutes': return Math.floor(value / 60);
      case 'hours': return Math.floor(value / 3600);
      case 'days': return Math.floor(value / 86400);
      default: return value;
    }
  };

  const getDisplayMax = () => {
    switch (unit) {
      case 'minutes': return Math.floor(max / 60);
      case 'hours': return Math.floor(max / 3600);
      case 'days': return Math.floor(max / 86400);
      default: return max;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = parseInt(e.target.value);
    let seconds = displayValue;
    
    switch (unit) {
      case 'minutes': seconds = displayValue * 60; break;
      case 'hours': seconds = displayValue * 3600; break;
      case 'days': seconds = displayValue * 86400; break;
    }
    
    onChange(seconds);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = parseInt(e.target.value) || 0;
    let seconds = displayValue;
    
    switch (unit) {
      case 'minutes': seconds = displayValue * 60; break;
      case 'hours': seconds = displayValue * 3600; break;
      case 'days': seconds = displayValue * 86400; break;
    }
    
    onChange(seconds);
  };

  const getUnitLabel = () => {
    switch (unit) {
      case 'minutes': return 'phút';
      case 'hours': return 'giờ';
      case 'days': return 'ngày';
      default: return 'giây';
    }
  };

  const displayValue = getDisplayValue();
  const displayMax = getDisplayMax();
  const percentage = (displayValue / displayMax) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={displayValue}
            onChange={handleInputChange}
            min={min}
            max={displayMax}
            className="h-8 w-20 text-right"
          />
          <span className="text-sm text-gray-500">{getUnitLabel()}</span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          value={displayValue}
          onChange={handleSliderChange}
          min={min}
          max={displayMax}
          step={step}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{min} {getUnitLabel()}</span>
          <span>{displayMax} {getUnitLabel()}</span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {/* Display in multiple units */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {value >= 60 && (
          <span className="rounded-full bg-blue-50 px-2 py-1">
            {Math.floor(value / 60)} phút
          </span>
        )}
        {value >= 3600 && (
          <span className="rounded-full bg-purple-50 px-2 py-1">
            {Math.floor(value / 3600)} giờ
          </span>
        )}
        {value >= 86400 && (
          <span className="rounded-full bg-green-50 px-2 py-1">
            {Math.floor(value / 86400)} ngày
          </span>
        )}
        <span className="rounded-full bg-gray-50 px-2 py-1">
          = {value.toLocaleString()} giây
        </span>
      </div>
    </div>
  );
}
