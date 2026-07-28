"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { adToBs } from "./dateUtils";
export { adToBs } from "./dateUtils";

const scriptId = "nepali-date-picker-script";
const stylesheetId = "nepali-date-picker-styles";
let assetsPromise: Promise<void> | null = null;

interface NepaliInputElement extends HTMLInputElement {
  nepaliDatePicker?: (options: { ndpYear: boolean; ndpMonth: boolean; onSelect: (event: { value?: string }) => void }) => void;
}

interface NepaliDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (newDate: string) => void;
  /** Enable the Nepali calendar popup. Use only on stable, non-dynamic form fields. */
  enableNepaliPicker?: boolean;
}

function loadNepaliPickerAssets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (assetsPromise) return assetsPromise;

  assetsPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(stylesheetId)) {
      const stylesheet = document.createElement("link");
      stylesheet.id = stylesheetId;
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css";
      document.head.appendChild(stylesheet);
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if (typeof (document.createElement("input") as NepaliInputElement).nepaliDatePicker === "function") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Nepali date picker"));
    document.head.appendChild(script);
  });

  return assetsPromise;
}

export function NepaliDatePicker({ value, onChange, onDateChange, className, enableNepaliPicker = false, ...props }: NepaliDatePickerProps) {
  const inputRef = useRef<NepaliInputElement>(null);
  const initialized = useRef(false);

  const handleDateSelect = useCallback((bsDate: string) => {
    const event = { target: { value: bsDate }, currentTarget: { value: bsDate } } as React.ChangeEvent<HTMLInputElement>;
    onDateChange?.(bsDate);
    onChange(event);
  }, [onChange, onDateChange]);

  // API values are AD; users always see the equivalent BS date in this field.
  const displayValue = adToBs(value);

  useEffect(() => {
    if (!enableNepaliPicker || initialized.current || !inputRef.current) return;
    const input = inputRef.current;
    let cancelled = false;

    loadNepaliPickerAssets().then(() => {
      if (cancelled || initialized.current || typeof input.nepaliDatePicker !== "function") return;
      initialized.current = true;
      input.nepaliDatePicker({
        ndpYear: true,
        ndpMonth: true,
        onSelect: (event) => handleDateSelect(event.value || input.value),
      });
    }).catch(console.error);

    return () => { cancelled = true; };
  }, [enableNepaliPicker, handleDateSelect]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      className={`nepali-date ${className || ""}`}
      value={displayValue}
      onChange={onChange}
    />
  );
}
