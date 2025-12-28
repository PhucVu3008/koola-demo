import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function DateTimePicker({
  selected,
  onChange,
  showTimeSelect = false,
  timeIntervals = 15,
  dateFormat = showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
  placeholderText = showTimeSelect ? 'Chọn ngày và giờ' : 'Chọn ngày',
  className,
  minDate,
  maxDate,
  disabled = false,
}: DateTimePickerProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
        {showTimeSelect ? (
          <Clock className="h-4 w-4" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
      </div>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        wrapperClassName="w-full"
      />
    </div>
  );
}
