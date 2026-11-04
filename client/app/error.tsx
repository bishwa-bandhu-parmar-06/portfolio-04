'use client';

import { buttonClass } from '@/components/ui/primitives';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-primary-text">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold text-text">This page couldn&apos;t load</h1>
        <p className="mt-3 max-w-md text-muted">The content server may be waking up. Please try again in a few seconds.</p>
        <button type="button" onClick={reset} className={buttonClass('primary', 'md', 'mt-8')}>
          Try again
        </button>
      </div>
    </main>
  );
}
