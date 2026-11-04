'use client';

import { FileText, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { buttonClass } from '@/components/ui/primitives';
import { cn } from '@/lib/format';
import { NAV_LINKS } from '@/lib/nav';
import { SectionLink, takePendingSection } from './SectionLink';

interface NavbarProps {
  name: string;
  resumeUrl?: string;
}

/**
 * Home-page section tracking: highlights the section in view, and scrolls to the
 * section a cross-page SectionLink asked for. It reads the pathname so it re-runs
 * after client-side navigation back to "/". It renders nothing, so it lives in its
 * own <Suspense> boundary: pages rendered on demand (e.g. a project added after
 * the deploy) can then still be served from the pre-rendered shell.
 */
function SectionSpy({ onActive }: { onActive: (id: string | null) => void }) {
  const pathname = usePathname();

  useEffect(() => {
    onActive(null);
    if (pathname !== '/') return;

    // Section to bring into view: one requested by a SectionLink on another page, or the URL hash.
    const pending = takePendingSection();
    const target = pending ?? (decodeURIComponent(window.location.hash.slice(1)) || null);
    const deadline = performance.now() + 3000;
    let frame = 0;
    let steady = 0;
    let observer: IntersectionObserver | null = null;
    let userScrolled = false;
    const onUserScroll = () => (userScrolled = true);
    const USER_INPUT = ['wheel', 'touchstart', 'keydown'] as const;
    USER_INPUT.forEach((e) => window.addEventListener(e, onUserScroll, { once: true, passive: true }));

    // Sections may still be streaming in, and the router's scroll-to-top can run after us,
    // so work frame by frame for up to 3s: keep the target in view until it holds still,
    // and start observing sections once they all exist.
    const tick = () => {
      const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
      if (!observer && (sections.length === NAV_LINKS.length || performance.now() >= deadline)) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) if (entry.isIntersecting) onActive(entry.target.id);
          },
          { rootMargin: '-45% 0px -50% 0px' },
        );
        sections.forEach((el) => observer!.observe(el));
      }

      let settled = !target || userScrolled;
      const el = target && !userScrolled ? document.getElementById(target) : null;
      if (el) {
        const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop || '0');
        if (Math.abs(el.getBoundingClientRect().top - padding) > 4) {
          steady = 0;
          el.scrollIntoView({ block: 'start', behavior: 'instant' });
        } else if (++steady >= 10) {
          settled = true;
          // Reflect the section in the URL, keeping the router's history state.
          if (pending) window.history.replaceState(window.history.state, '', `/#${pending}`);
        }
      }

      if ((!settled || !observer) && performance.now() < deadline) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      USER_INPUT.forEach((e) => window.removeEventListener(e, onUserScroll));
      observer?.disconnect();
    };
  }, [pathname, onActive]);

  return null;
}

export function Navbar({ name, resumeUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || open ? 'border-border bg-bg/75 backdrop-blur-xl' : 'border-transparent bg-transparent',
      )}
    >
      <Suspense fallback={null}>
        <SectionSpy onActive={setActive} />
      </Suspense>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-text" onClick={() => setOpen(false)}>
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary font-mono text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline">{name}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <SectionLink
                section={link.id}
                aria-current={active === link.id ? 'true' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm transition-colors',
                  active === link.id ? 'text-text' : 'text-muted hover:text-text',
                )}
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'sm', 'hidden sm:inline-flex')}>
              <FileText size={15} aria-hidden />
              Resume
            </a>
          )}
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-bg/95 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <SectionLink
                  section={link.id}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base text-muted hover:bg-card hover:text-text"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
            {resumeUrl && (
              <li className="pt-2">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'md', 'w-full')}>
                  <FileText size={16} aria-hidden />
                  Download Resume
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
