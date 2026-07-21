import Script from "next/script";
import type { ScriptProps } from "next/script";

type ScriptMountProps = {
  id?: string;
  src?: string;
  inline?: string;
  type?: string;
  strategy?: ScriptProps["strategy"];
};

export function ScriptMount({
  id,
  src,
  inline,
  type,
  strategy = "afterInteractive",
}: ScriptMountProps) {
  return (
    <Script
      id={id}
      src={src}
      type={type}
      strategy={strategy}
      dangerouslySetInnerHTML={inline ? { __html: inline } : undefined}
    />
  );
}
