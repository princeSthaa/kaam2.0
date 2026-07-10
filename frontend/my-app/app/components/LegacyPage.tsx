"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { findPage, normalizePath, pageKeyFromPath } from "../legacy/routing";
import { AppHeader } from "./AppHeader";
import { LegacyPageContent } from "./LegacyPageContent";
import { LegacyScriptLoader } from "./LegacyScriptLoader";
import { isRouteOverridden, shouldSkipLegacyScripts } from "../legacy/pageOverrides";

export default function LegacyPage() {
  const pathname = normalizePath(usePathname());
  const route = pageKeyFromPath(pathname);
  const page = findPage(pathname);
  const skipScripts = shouldSkipLegacyScripts(route);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <AppHeader pathname={pathname} />
      <LegacyPageContent page={page} pathname={pathname} route={route} />
      {mounted && (
        <LegacyScriptLoader page={page} route={route} skipScripts={skipScripts} />
      )}
    </>
  );
}
