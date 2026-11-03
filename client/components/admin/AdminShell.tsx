'use client';

import {
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Heading,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Palette,
  Search,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { api, UNAUTHORIZED_EVENT } from '@/lib/admin/api';
import { cn } from '@/lib/format';

const NAV = [
  { group: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin/messages', label: 'Messages', icon: Inbox }] },
  {
    group: 'Content',
    items: [
      { href: '/admin/profile', label: 'Profile', icon: UserRound },
      { href: '/admin/resumes', label: 'Resumes', icon: FileText },
      { href: '/admin/social', label: 'Social links', icon: Link2 },
      { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { href: '/admin/experience', label: 'Experience', icon: Briefcase },
      { href: '/admin/skills', label: 'Skills', icon: Code2 },
      { href: '/admin/coding', label: 'Coding profiles', icon: Trophy },
      { href: '/admin/education', label: 'Education', icon: GraduationCap },
      { href: '/admin/certifications', label: 'Certifications', icon: Award },
    ],
  },
  {
    group: 'Site',
    items: [
      { href: '/admin/sections', label: 'Section headings', icon: Heading },
      { href: '/admin/theme', label: 'Theme', icon: Palette },
      { href: '/admin/seo', label: 'SEO', icon: Search },
      { href: '/admin/password', label: 'Password', icon: KeyRound },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api<{ admin: { email: string } }>('GET', '/auth/me')
      .then((r) => setEmail(r.admin.email))
      .catch(() => {});
    const onUnauthorized = () => {
      // Hard navigation on purpose: drops all in-memory admin state along with the dead session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  // Close the mobile menu on navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await api('POST', '/auth/logout').catch(() => {});
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reset after logout
    window.location.assign('/admin/login');
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary font-mono text-xs font-bold text-white">
          A
        </span>
        <span className="font-display font-semibold text-text">Portfolio admin</span>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="mb-2 px-2 font-mono text-[11px] uppercase tracking-wider text-muted">{section.group}</p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      isActive(href) ? 'bg-primary/12 font-medium text-text' : 'text-muted hover:bg-card-hover hover:text-text',
                    )}
                  >
                    <Icon size={16} className={isActive(href) ? 'text-primary-text' : undefined} aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3">
        {email && <p className="truncate px-2.5 pb-2 text-xs text-muted">{email}</p>}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-card-hover hover:text-text"
        >
          <LogOut size={16} aria-hidden /> Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-muted transition-colors hover:text-text"
            >
              View site <ExternalLink size={14} aria-hidden />
            </a>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
