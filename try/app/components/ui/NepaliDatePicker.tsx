"use client";

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface NepaliInputElement extends HTMLInputElement {
  nepaliDatePicker?: (options?: any) => void;
}

interface NepaliDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (newDate: string) => void;
}

export function NepaliDatePicker({ value, onChange, onDateChange, className, ...props }: NepaliDatePickerProps) {
  const inputRef = useRef<NepaliInputElement>(null);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const handleDateSelect = (e: any) => {
      // Create a mock synthetic event for React
      const mockEvent = {
        target: { value: e.detail?.message || inputEl.value },
        currentTarget: { value: e.detail?.message || inputEl.value }
      } as React.ChangeEvent<HTMLInputElement>;
      
      if (onDateChange) onDateChange(mockEvent.target.value);
      onChange(mockEvent);
    };

    const initPicker = () => {
      if (typeof inputEl.nepaliDatePicker === 'function') {
        inputEl.nepaliDatePicker({
          ndpYear: true,
          ndpMonth: true,
          onSelect: function(event: any) {
            handleDateSelect({ detail: { message: event?.value || inputEl.value } });
          }
        });
      } else {
        setTimeout(initPicker, 500); // Retry if script isn't loaded yet
      }
    };

    // Give the Script a moment to load if it's the first time
    initPicker();

    inputEl.addEventListener('dateSelect', handleDateSelect);
    inputEl.addEventListener('change', handleDateSelect);

    return () => {
      inputEl.removeEventListener('dateSelect', handleDateSelect);
      inputEl.removeEventListener('change', handleDateSelect);
    };
  }, [onChange, onDateChange]);

  return (
    <>
      <Script 
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js" 
        strategy="lazyOnload" 
      />
      <link 
        rel="stylesheet" 
        href="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css" 
      />
      <input
        ref={inputRef}
        type="text"
        className={`nepali-date ${className || ''}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </>
  );
}
