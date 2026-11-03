'use client';

import { useState, type FormEvent } from 'react';
import { useFeedback } from '@/components/admin/feedback';
import { Button, FieldError, Input, Label, PageHeader, Panel } from '@/components/admin/ui';
import { api, ApiError } from '@/lib/admin/api';

const RULES = [
  { test: (p: string) => p.length >= 12, label: 'At least 12 characters' },
  { test: (p: string) => /[a-z]/.test(p), label: 'A lowercase letter' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'An uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'A number' },
];

export default function PasswordPage() {
  const { toast } = useFeedback();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!current) local.currentPassword = 'Enter your current password';
    if (!RULES.every((r) => r.test(next))) local.newPassword = 'The new password does not meet all the rules below';
    if (next !== confirm) local.confirm = 'Passwords do not match';
    setErrors(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      await api('PATCH', '/auth/password', { currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast('success', 'Password changed. Other devices have been signed out.');
    } catch (err) {
      if (err instanceof ApiError) {
        const field = (err.fields[0]?.path ?? (err.message.includes('Current') ? 'currentPassword' : '')) || 'form';
        setErrors({ [field]: err.fields[0]?.message ?? err.message });
      } else setErrors({ form: 'Could not change the password.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Password" description="Changing your password signs you out everywhere else." />
      <Panel className="max-w-lg">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={Boolean(errors.currentPassword)} />
            <FieldError>{errors.currentPassword}</FieldError>
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={Boolean(errors.newPassword)} aria-describedby="rules" />
            <FieldError>{errors.newPassword}</FieldError>
            <ul id="rules" className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {RULES.map((r) => {
                const ok = r.test(next);
                return (
                  <li key={r.label} className={ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted'}>
                    {ok ? '✓' : '•'} {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={Boolean(errors.confirm)} />
            <FieldError>{errors.confirm}</FieldError>
          </div>
          <FieldError>{errors.form}</FieldError>
          <Button type="submit" loading={busy}>
            Change password
          </Button>
        </form>
      </Panel>
    </>
  );
}
