import React from "react";

type MaterialIconProps = {
  name: string;
  style?: React.CSSProperties;
  className?: string;
};

export function MaterialIcon({ name, style, className }: MaterialIconProps) {
  return <span className={`material-symbols-outlined ${className || ""}`} style={style}>{name}</span>;
}
