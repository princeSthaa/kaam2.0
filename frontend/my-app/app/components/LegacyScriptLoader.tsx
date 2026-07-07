import type { LegacyPageDefinition } from "../generated/pages";
import {
  compatibilityScript,
  domReadyReplayScript,
  sharedLegacyScripts,
} from "../legacy/scripts";
import { ScriptMount } from "./ui/ScriptMount";

type LegacyScriptLoaderProps = {
  page: LegacyPageDefinition;
};

function getLegacyScriptId(page: LegacyPageDefinition, index: number) {
  return `legacy-script-${page.title}-${index}`;
}

export function LegacyScriptLoader({ page }: LegacyScriptLoaderProps) {
  return (
    <>
      {sharedLegacyScripts.map((src) => (
        <ScriptMount key={src} src={src} />
      ))}
      <ScriptMount
        id="legacy-dom-ready-replay"
        inline={domReadyReplayScript}
      />
      <ScriptMount src={compatibilityScript} />
      {page.scripts.map((script, index) => (
        <ScriptMount
          key={`${script.src || "inline"}-${index}`}
          id={getLegacyScriptId(page, index)}
          src={script.src}
          type={script.type}
          inline={script.inline}
        />
      ))}
    </>
  );
}
