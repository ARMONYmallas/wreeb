import { cn } from '@/lib/cn';

export function ProgressBar({ step, total = 3 }: { step: number; total?: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-ink">
          Paso {step} de {total}
        </p>
        <p className="text-xs text-muted">{pct}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Paso ${step} de ${total}`}
        className="mt-2 flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-brand-600' : 'bg-line',
            )}
          />
        ))}
      </div>
    </div>
  );
}
