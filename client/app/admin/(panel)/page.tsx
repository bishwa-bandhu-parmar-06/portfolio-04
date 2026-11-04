'use client';

import { ArrowRight, FileText, FolderKanban, Inbox, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button, ErrorNotice, PageHeader, Panel, Spinner } from '@/components/admin/ui';
import { useApiData } from '@/lib/admin/hooks';

interface Dashboard {
  counts: {
    projects: number;
    visibleProjects: number;
    experience: number;
    certifications: number;
    resumes: number;
    unreadMessages: number;
    totalMessages: number;
  };
  lastUpdatedAt: string;
  latestMessages: { _id: string; name: string; subject: string; status: string; createdAt: string }[];
}

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

function relative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useApiData<Dashboard>('/admin/dashboard');

  if (loading && !data) return <Spinner />;
  if (error || !data) return <ErrorNotice message={error ?? 'Could not load the dashboard.'} onRetry={reload} />;

  const { counts } = data;
  const cards = [
    { label: 'Projects', value: counts.projects, detail: `${counts.visibleProjects} visible`, href: '/admin/projects', icon: FolderKanban },
    { label: 'Unread messages', value: counts.unreadMessages, detail: `${counts.totalMessages} total`, href: '/admin/messages', icon: Inbox, highlight: counts.unreadMessages > 0 },
    { label: 'Resumes', value: counts.resumes, detail: counts.resumes ? 'PDF versions' : 'Upload one to enable Download', href: '/admin/resumes', icon: FileText },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your portfolio."
        actions={
          <Button variant="secondary" onClick={reload} loading={loading}>
            <RefreshCw size={15} aria-hidden /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, detail, href, icon: Icon, highlight }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-glow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{label}</p>
              <Icon size={18} className={highlight ? 'text-primary-text' : 'text-muted'} aria-hidden />
            </div>
            <p className={`mt-3 font-display text-4xl font-bold ${highlight ? 'text-gradient' : 'text-text'}`}>{value}</p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        Content last updated <strong className="text-text">{relative(data.lastUpdatedAt)}</strong> ({dateTime.format(new Date(data.lastUpdatedAt))})
      </p>

      <Panel
        className="mt-8"
        title="Latest messages"
        actions={
          <Link href="/admin/messages" className="inline-flex items-center gap-1 text-sm text-primary-text hover:underline">
            Open inbox <ArrowRight size={14} aria-hidden />
          </Link>
        }
      >
        {data.latestMessages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet. They will appear here when someone uses the contact form.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.latestMessages.map((m) => (
              <li key={m._id}>
                <Link href={`/admin/messages?open=${m._id}`} className="flex items-center gap-3 py-3 text-sm hover:text-text">
                  <span className={`size-2 shrink-0 rounded-full ${m.status === 'unread' ? 'bg-primary' : 'bg-transparent'}`} aria-label={m.status === 'unread' ? 'Unread' : undefined} />
                  <span className={`w-40 shrink-0 truncate ${m.status === 'unread' ? 'font-semibold text-text' : 'text-muted'}`}>{m.name}</span>
                  <span className="flex-1 truncate text-muted">{m.subject}</span>
                  <span className="shrink-0 text-xs text-muted">{relative(m.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
