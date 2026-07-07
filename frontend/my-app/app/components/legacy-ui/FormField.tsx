import type { ReactNode } from "react";

type Option = {
  value: string;
  label: string;
};

type FormFieldProps = {
  label: ReactNode;
  name?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  options?: Option[];
  rows?: number;
  className?: string;
  full?: boolean;
  readOnly?: boolean;
};

export function FormField({
  label,
  name,
  id,
  placeholder,
  type = "text",
  as = "input",
  options = [],
  rows,
  className = "form-control",
  full = false,
  readOnly = false,
}: FormFieldProps) {
  return (
    <div className="form-group" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={id} {...(name && !id ? { name } : {})}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={id} name={name} className={className} rows={rows} placeholder={placeholder}></textarea>
      ) : null}
      {as === "select" ? (
        <select id={id} name={name} className={className}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      {as === "input" ? (
        <input id={id} name={name} type={type} className={className} placeholder={placeholder} readOnly={readOnly} />
      ) : null}
      <span className="text-danger"></span>
    </div>
  );
}
