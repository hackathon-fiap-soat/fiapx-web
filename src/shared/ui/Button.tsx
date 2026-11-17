import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary-strong text-white hover:bg-primary-active active:bg-primary-active shadow-card',
  secondary: 'bg-surface text-ink border border-line hover:bg-canvas hover:border-line-strong',
  ghost: 'bg-transparent text-muted hover:bg-surface-muted hover:text-ink',
  destructive:
    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
};

const SIZES = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  sm: 'h-8 px-3 text-xs',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={16} label="" /> : icon}
      {children}
    </button>
  );
}
