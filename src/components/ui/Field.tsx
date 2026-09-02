'use client';

import { forwardRef, useId } from 'react';
import type {
  ReactNode,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

const controlBase =
  'w-full rounded-2xl border bg-white px-4 text-ink placeholder:text-muted-soft ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 ' +
  'disabled:bg-surface disabled:text-muted';

export function FieldWrapper({
  label,
  hint,
  error,
  htmlFor,
  optional,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-soft">
          {label}
          {optional && <span className="ml-1.5 font-normal text-muted-soft">(opcional)</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, optional, className, id, ...rest },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={inputId} optional={optional}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          'h-13 py-3.5',
          error && 'border-red-300 focus:ring-red-100',
          className,
        )}
        style={{ height: '3.25rem' }}
        {...rest}
      />
    </FieldWrapper>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, optional, className, id, children, ...rest },
  ref,
) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={selectId} optional={optional}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            'appearance-none py-3.5 pr-11',
            error && 'border-red-300 focus:ring-red-100',
            className,
          )}
          style={{ height: '3.25rem' }}
          {...rest}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldWrapper>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, optional, className, id, ...rest },
  ref,
) {
  const generated = useId();
  const areaId = id ?? generated;
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={areaId} optional={optional}>
      <textarea
        ref={ref}
        id={areaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          'min-h-28 py-3.5 leading-relaxed',
          error && 'border-red-300',
          className,
        )}
        {...rest}
      />
    </FieldWrapper>
  );
});
