import React from "react";

function callLegacy(name: string, ...args: unknown[]) {
  const fn = (window as unknown as Record<string, (...values: unknown[]) => void>)[name];
  if (typeof fn === "function") fn(...args);
}

export interface StepButtonProps {
  children: React.ReactNode;
  step?: number;
  type?: "button" | "submit";
  className?: string;
}

/** Wizard step navigation button that triggers legacy goToStep window function. */
export function StepButton({ children, step, type = "button", className = "btn btn-primary" }: StepButtonProps) {
  return (
    <button type={type} className={className} onClick={step ? () => callLegacy("goToStep", step) : undefined}>
      {children}
    </button>
  );
}

export interface WizardIndicatorProps {
  steps: { label: string }[];
  activeStep?: number;
}

/** Renders the numbered step indicator bar at the top of a wizard flow. */
export function WizardIndicator({ steps, activeStep = 1 }: WizardIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <div
          key={i}
          className={`step-bullet${i + 1 <= activeStep ? " active" : ""}`}
          id={`indicator-${i + 1}`}
        >
          {i + 1}. {s.label}
        </div>
      ))}
    </div>
  );
}

export interface WizardStepProps {
  id: string;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}

/** Single step panel in a wizard flow. Only visible when active. */
export function WizardStep({ id, title, active = false, children }: WizardStepProps) {
  return (
    <div id={id} className={`wizard-step ${active ? "active" : ""}`}>
      <h3 className="order-step-title">{title}</h3>
      {children}
    </div>
  );
}
