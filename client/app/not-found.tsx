import Link from 'next/link';
import { buttonClass } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-primary-text">404</p>
        <h1 className="mt-3 text-4xl font-bold text-text">Page not found</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className={buttonClass('primary', 'md', 'mt-8')}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
