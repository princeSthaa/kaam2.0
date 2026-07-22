"use client";

import React, { useEffect, useRef, useCallback } from 'react';
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
  const onChangeRef = useRef(onChange);
  const onDateChangeRef = useRef(onDateChange);
  const initialized = useRef(false);

  // Keep refs up-to-date without triggering re-initialization
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onDateChangeRef.current = onDateChange;
  }, [onDateChange]);

  const handleDateSelect = useCallback((bsDate: string) => {
    const mockEvent = {
      target: { value: bsDate },
      currentTarget: { value: bsDate }
    } as React.ChangeEvent<HTMLInputElement>;

    if (onDateChangeRef.current) onDateChangeRef.current(bsDate);
    onChangeRef.current(mockEvent);
  }, []);

  // Initialize picker only once on mount
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl || initialized.current) return;

    const initPicker = () => {
      if (typeof inputEl.nepaliDatePicker === 'function') {
        initialized.current = true;
        inputEl.nepaliDatePicker({
          ndpYear: true,
          ndpMonth: true,
          onSelect: function(event: any) {
            const picked = event?.value || inputEl.value;
            if (picked) handleDateSelect(picked);
          }
        });
      } else {
        setTimeout(initPicker, 300);
      }
    };

    // Small delay to allow the script to be injected
    const timer = setTimeout(initPicker, 100);

    return () => clearTimeout(timer);
  }, [handleDateSelect]);

  // Sync external value changes into the input without triggering the picker
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl || inputEl.value === value) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(inputEl, value);
    } else {
      inputEl.value = value;
    }
  }, [value]);

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Re-attempt initialization after script loads
          const inputEl = inputRef.current;
          if (!inputEl || initialized.current) return;
          if (typeof inputEl.nepaliDatePicker === 'function') {
            initialized.current = true;
            inputEl.nepaliDatePicker({
              ndpYear: true,
              ndpMonth: true,
              onSelect: function(event: any) {
                const picked = event?.value || inputEl.value;
                if (picked) handleDateSelect(picked);
              }
            });
          }
        }}
      />
      <link
        rel="stylesheet"
        href="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css"
      />
      <input
        ref={inputRef}
        type="text"
        className={`nepali-date ${className || ''}`}
        defaultValue={value}
        onChange={onChange}
        {...props}
      />
    </>
  );
}
