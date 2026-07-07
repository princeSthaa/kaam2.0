import type { ReactNode } from "react";

import { cx } from "../../legacy/classNames";

type PageShellProps = {
  sidebar?: ReactNode;
  children: ReactNode;
};

export function PageShell({ sidebar, children }: PageShellProps) {
  const withSidebar = Boolean(sidebar);

  return (
    <main className={cx("page-container", withSidebar && "with-sidebar")}>
      <div className={withSidebar ? "layout-wrapper" : undefined}>
        {sidebar}
        <div className={withSidebar ? "content-area" : undefined}>{children}</div>
      </div>
    </main>
  );
}
