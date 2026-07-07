"use client";

import { usePathname } from "next/navigation";

import { findPage, normalizePath, pageKeyFromPath } from "../legacy/routing";
import { AppHeader } from "./AppHeader";
import { LegacyPageContent } from "./LegacyPageContent";
import { LegacyScriptLoader } from "./LegacyScriptLoader";

export default function LegacyPage() {
  const pathname = normalizePath(usePathname());
  const route = pageKeyFromPath(pathname);
  const page = findPage(pathname);

  return (
    <>
      <AppHeader pathname={pathname} />
      <LegacyPageContent page={page} pathname={pathname} route={route} />
      <LegacyScriptLoader page={page} />
    </>
  );
}
