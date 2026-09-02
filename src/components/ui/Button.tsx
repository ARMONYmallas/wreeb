import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-55 select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[var(--shadow-soft)]',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200',
  outline: 'border border-line-strong bg-white text-ink hover:bg-surface active:bg-surface-2',
  ghost: 'text-ink hover:bg-surface active:bg-surface-2',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
};

/** Alturas ≥ 44px: objetivos táctiles cómodos. */
const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-[0.9375rem]',
  lg: 'h-14 px-7 text-base',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps>;
type AnchorProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps> & { href: string; external?: boolean };

function classes({ variant = 'primary', size = 'md', fullWidth, className }: CommonProps) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

export function Button({ variant, size, fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, size, fullWidth, className, children })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  href,
  external,
  ...rest
}: AnchorProps) {
  const cls = classes({ variant, size, fullWidth, className, children });
  if (
    external ||
    href.startsWith('http') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:')
  ) {
    return (
      <a
        href={href}
        className={cls}
        {...(external || href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
