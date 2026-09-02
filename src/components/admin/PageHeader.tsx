export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-10 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-surface text-muted">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{description}</p>}
    </div>
  );
}
