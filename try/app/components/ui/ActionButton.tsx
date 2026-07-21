import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "../../lib/classNames";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  id?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "light" | "danger-light" | "outline" | "outline-primary" | "outline-secondary" | "outline-light";
  size?: "sm";
  className?: string;
  hidden?: boolean;
};

function variantClass(variant: ActionButtonProps["variant"]) {
  if (!variant) return "btn";
  return `btn btn-${variant}`;
}

export function ActionButton({
  children,
  href,
  id,
  type = "button",
  variant = "light",
  size,
  className,
  hidden = false,
}: ActionButtonProps) {
  const classes = cx(variantClass(variant), size && `btn-${size}`, hidden && "hidden", className);

  if (href) {
    return (
      <Link href={href} id={id} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} id={id} className={classes}>
      {children}
    </button>
  );
}

