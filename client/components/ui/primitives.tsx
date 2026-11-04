import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]';

const sizes = { md: 'h-11 px-5 text-sm', sm: 'h-9 px-3.5 text-sm' } as const;

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-solid text-white shadow-[0_8px_24px_-10px_rgb(var(--primary-rgb)/0.7)] hover:brightness-110 hover:shadow-glow',
  secondary: 'border border-border bg-card text-text hover:border-primary/50 hover:bg-card-hover',
  ghost: 'text-muted hover:bg-card hover:text-text',
};

export function buttonClass(variant: Variant = 'primary', size: keyof typeof sizes = 'md', className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

type ExternalProps = ComponentProps<'a'> & { variant?: Variant; size?: keyof typeof sizes };

/** External link styled as a button. Opens in a new tab. */
export function ButtonA({ variant, size, className, ...props }: ExternalProps) {
  return <a target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-300', className)}
      {...props}
    />
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-border bg-bg/60 px-2 py-0.5 font-mono text-[11px] text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('relative py-20 sm:py-24', className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      {eyebrow && <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-text">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="text-3xl font-semibold text-text sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
