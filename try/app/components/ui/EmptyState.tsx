type EmptyStateProps = {
  children: string;
};

export function EmptyState({ children }: EmptyStateProps) {
  return <div className="empty-cell">{children}</div>;
}
