import type { ReactNode } from "react";

type TableShellProps = {
  id?: string;
  bodyId?: string;
  headers: string[];
  children?: ReactNode;
  tableClassName?: string;
  wrapperClassName?: string;
};

export function TableShell({
  id,
  bodyId,
  headers,
  children,
  tableClassName = "pp-table",
  wrapperClassName = "pp-table-wrapper",
}: TableShellProps) {
  return (
    <div className={wrapperClassName}>
      <table className={tableClassName} id={id}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody id={bodyId}>{children}</tbody>
      </table>
    </div>
  );
}
