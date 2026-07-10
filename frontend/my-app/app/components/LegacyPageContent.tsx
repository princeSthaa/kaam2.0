import { Suspense } from "react";
import type { LegacyPageDefinition } from "../generated/pages";
import { renderPageOverride } from "../legacy/pageOverrides";
import { hasSidebar } from "../legacy/routing";
import { Sidebar } from "./Sidebar";
import { PageShell } from "./ui/PageShell";
import { RawHtml } from "./ui/RawHtml";

type LegacyPageContentProps = {
  page: LegacyPageDefinition;
  pathname: string;
  route: string;
};

export function LegacyPageContent({ page, pathname, route }: LegacyPageContentProps) {
  const override = renderPageOverride(route);
  const contentClassName = route === "/Production/InHouse/CreateInHouse" ? "inhouse-create-content" : undefined;

  return (
    <PageShell sidebar={hasSidebar(page.section) ? <Sidebar section={page.section} pathname={pathname} /> : null} contentClassName={contentClassName}>
      <Suspense fallback={null}>
        {override ?? <RawHtml html={page.html} />}
      </Suspense>
    </PageShell>
  );
}
