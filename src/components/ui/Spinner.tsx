import { cn } from '@/lib/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current',
          className,
        )}
      />
      <span className={label ? 'text-sm' : 'sr-only'}>{label ?? 'Cargando'}</span>
    </span>
  );
}
