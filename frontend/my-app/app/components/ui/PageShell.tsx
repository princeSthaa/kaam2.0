import type { ReactNode } from "react";

import { cx } from "../../legacy/classNames";

type PageShellProps = {
  sidebar?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export function PageShell({ sidebar, children, contentClassName }: PageShellProps) {
  const withSidebar = Boolean(sidebar);

  return (
    <main className={cx("page-container", withSidebar && "with-sidebar")}>
      <div className={withSidebar ? "layout-wrapper" : undefined}>
        {sidebar}
        <div className={cx(withSidebar && "content-area", contentClassName)}>{children}</div>
      </div>
    </main>
  );
}
