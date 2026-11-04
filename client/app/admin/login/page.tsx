'use client';

import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Button, FieldError, Input, Label } from '@/components/admin/ui';
import { api, ApiError } from '@/lib/admin/api';

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
            <LockKeyhole size={22} aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-text">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Manage your portfolio content.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="hover:text-text hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}

/** Only same-site paths are allowed as the post-login destination. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
}

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError(null);
    try {
      await api('POST', '/auth/login', { email, password });
      // Full navigation so the proxy sees the new session cookie.
      window.location.assign(safeNext(params.get('next')));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-text"
          >
            {show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
      </div>
      <div role="alert" aria-live="assertive">
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" loading={busy} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
