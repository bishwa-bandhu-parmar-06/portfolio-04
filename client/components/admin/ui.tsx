'use client';

import { LoaderCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/format';

export const inputClass =
  'w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-muted/70 transition-colors ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 aria-[invalid=true]:border-rose-500';

export function Input(props: ComponentProps<'input'>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea {...props} className={cn(inputClass, 'min-h-24 leading-relaxed', props.className)} />;
}

export function Select(props: ComponentProps<'select'>) {
  return <select {...props} className={cn(inputClass, 'pr-8', props.className)} />;
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {children}
      </label>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
      {children}
    </p>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50',
        checked ? 'border-primary-solid bg-primary-solid' : 'border-border bg-border',
      )}
    >
      <span
        className={cn('inline-block size-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')}
      />
    </button>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-primary-solid text-white hover:brightness-110',
  secondary: 'border border-border bg-card text-text hover:bg-card-hover',
  ghost: 'text-muted hover:bg-card-hover hover:text-text',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ComponentProps<'button'> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'icon'; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'icon' && 'size-8',
        btnVariants[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Panel({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="font-semibold text-text">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted" role="status">
      <LoaderCircle size={18} className="animate-spin" aria-hidden /> {label}…
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <p className="font-medium text-text">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-300">
      {message}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
