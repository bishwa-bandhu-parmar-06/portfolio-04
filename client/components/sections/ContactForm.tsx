'use client';

import { CircleAlert, CircleCheck, LoaderCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { buttonClass } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

// Mirrors server/src/validators/message.ts so visitors get instant feedback; the API validates again.
const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80, 'Name is too long'),
  email: z.email('Please enter a valid email').max(254),
  subject: z.string().trim().min(3, 'Please add a subject').max(120, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message is too short (10 characters minimum)').max(5000, 'Message is too long'),
});

type Field = keyof z.infer<typeof schema>;
type Status = { state: 'idle' } | { state: 'sending' } | { state: 'sent' } | { state: 'error'; message: string };

const FIELDS: { name: Field; label: string; type?: string; autoComplete?: string; rows?: number }[] = [
  { name: 'name', label: 'Name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'subject', label: 'Subject' },
  { name: 'message', label: 'Message', rows: 5 },
];

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as Field] ??= issue.message;
      setErrors(next);
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ state: 'sending' });
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, website: data.website ?? '' }),
      });
      if (res.ok) {
        form.reset();
        setStatus({ state: 'sent' });
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.status === 400 && body?.error?.fields) {
        const next: Partial<Record<Field, string>> = {};
        for (const f of body.error.fields as { path: Field; message: string }[]) next[f.path] ??= f.message;
        setErrors(next);
        setStatus({ state: 'idle' });
        return;
      }
      setStatus({ state: 'error', message: body?.error?.message ?? 'Something went wrong. Please try again.' });
    } catch {
      setStatus({ state: 'error', message: 'Could not reach the server. Please check your connection and try again.' });
    }
  }

  const clearError = (name: Field) => errors[name] && setErrors((prev) => ({ ...prev, [name]: undefined }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-describedby="contact-status">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const id = `contact-${field.name}`;
          const error = errors[field.name];
          const common = {
            id,
            name: field.name,
            autoComplete: field.autoComplete,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${id}-error` : undefined,
            onChange: () => clearError(field.name),
            className: cn(
              'w-full rounded-xl border bg-bg px-4 py-3 text-sm text-text placeholder:text-muted/70 transition-colors',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
              error ? 'border-rose-500' : 'border-border',
            ),
          };
          return (
            <div key={field.name} className={field.rows || field.name === 'subject' ? 'sm:col-span-2' : undefined}>
              <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
                {field.label}
              </label>
              {field.rows ? <textarea rows={field.rows} {...common} /> : <input type={field.type ?? 'text'} {...common} />}
              {error && (
                <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={buttonClass('primary')} disabled={status.state === 'sending'}>
          {status.state === 'sending' ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              <Send size={16} aria-hidden /> Send message
            </>
          )}
        </button>

        <p id="contact-status" role="status" aria-live="polite" className="text-sm">
          {status.state === 'sent' && (
            <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CircleCheck size={16} aria-hidden /> Thanks! Your message was sent. I&apos;ll reply soon.
            </span>
          )}
          {status.state === 'error' && (
            <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <CircleAlert size={16} aria-hidden /> {status.message}
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
