'use client';

import { ArrowLeft, Mail, MailOpen, Reply, Search, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useFeedback } from '@/components/admin/feedback';
import { Button, EmptyState, ErrorNotice, Input, PageHeader, Spinner } from '@/components/admin/ui';
import { api, ApiError } from '@/lib/admin/api';
import { useApiData } from '@/lib/admin/hooks';
import { cn } from '@/lib/format';

type Status = 'unread' | 'read' | 'replied';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: Status;
  repliedAt?: string | null;
  createdAt: string;
}

interface MessageList {
  items: Message[];
  total: number;
  unread: number;
  page: number;
  pages: number;
}

const FILTERS: { value: Status | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
];

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function MessagesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Inbox />
    </Suspense>
  );
}

function Inbox() {
  const { toast, confirm } = useFeedback();
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get('open');

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const qs = new URLSearchParams({ page: String(page), limit: '20' });
  if (debounced) qs.set('q', debounced);
  if (status) qs.set('status', status);
  const { data, setData, error, loading, reload } = useApiData<MessageList>(`/admin/messages?${qs}`);

  const selected = data?.items.find((m) => m._id === openId) ?? null;
  const { data: fetched } = useApiData<{ item: Message }>(openId && !selected ? `/admin/messages/${openId}` : null);
  const current = selected ?? fetched?.item ?? null;

  const open = (id: string | null) => router.replace(id ? `/admin/messages?open=${id}` : '/admin/messages', { scroll: false });

  async function setMessageStatus(msg: Message, next: Status, quiet = false) {
    try {
      const { item } = await api<{ item: Message }>('PATCH', `/admin/messages/${msg._id}`, { status: next });
      setData((d) =>
        d && {
          ...d,
          items: d.items.map((m) => (m._id === item._id ? item : m)),
          unread: d.unread + (msg.status === 'unread' ? -1 : 0) + (next === 'unread' ? 1 : 0),
        },
      );
      if (!quiet) toast('success', `Marked as ${next}.`);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not update the message.');
    }
  }

  // Opening an unread message marks it read.
  useEffect(() => {
    if (current?.status === 'unread') void setMessageStatus(current, 'read', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  async function remove(msg: Message) {
    const ok = await confirm({ title: 'Delete this message?', message: `From ${msg.name} · "${msg.subject}". This cannot be undone.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await api('DELETE', `/admin/messages/${msg._id}`);
      toast('success', 'Message deleted.');
      open(null);
      void reload();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete.');
    }
  }

  return (
    <>
      <PageHeader title="Messages" description={data ? `${data.total} message${data.total === 1 ? '' : 's'} · ${data.unread} unread` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
          <Input type="search" placeholder="Search name, email, subject or text" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" aria-label="Search messages" />
        </div>
        <div role="tablist" aria-label="Filter by status" className="flex rounded-xl border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={status === f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={cn('rounded-lg px-3 py-1.5 text-sm transition-colors', status === f.value ? 'bg-primary-solid text-white' : 'text-muted hover:text-text')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className={cn(current && 'hidden lg:block')}>
          {loading && !data ? (
            <Spinner />
          ) : error ? (
            <ErrorNotice message={error} onRetry={reload} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState title={debounced || status ? 'No matching messages' : 'Inbox is empty'}>
              {debounced || status ? 'Try a different search or filter.' : 'Messages from the contact form will appear here.'}
            </EmptyState>
          ) : (
            <>
              <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                {data.items.map((m) => (
                  <li key={m._id} className="border-b border-border last:border-0">
                    <button
                      type="button"
                      onClick={() => open(m._id)}
                      aria-current={current?._id === m._id ? 'true' : undefined}
                      className={cn('block w-full px-4 py-3 text-left transition-colors hover:bg-card-hover', current?._id === m._id && 'bg-primary/10')}
                    >
                      <div className="flex items-center gap-2">
                        {m.status === 'unread' && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        <span className={cn('flex-1 truncate text-sm', m.status === 'unread' ? 'font-semibold text-text' : 'text-text')}>{m.name}</span>
                        {m.status === 'replied' && <Reply size={13} className="text-muted" aria-label="Replied" />}
                        <span className="shrink-0 text-xs text-muted">{when.format(new Date(m.createdAt))}</span>
                      </div>
                      <p className={cn('mt-0.5 truncate text-sm', m.status === 'unread' ? 'text-text' : 'text-muted')}>{m.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{m.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
              {data.pages > 1 && (
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  Page {data.page} of {data.pages}
                  <Button variant="secondary" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={cn(!current && 'hidden lg:block')}>
          {current ? (
            <article className="rounded-2xl border border-border bg-card">
              <header className="border-b border-border p-5">
                <Button variant="ghost" size="sm" className="mb-3 lg:hidden" onClick={() => open(null)}>
                  <ArrowLeft size={14} aria-hidden /> Back
                </Button>
                <h2 className="text-lg font-semibold text-text">{current.subject}</h2>
                <p className="mt-1 text-sm text-muted">
                  <span className="text-text">{current.name}</span> ·{' '}
                  <a href={`mailto:${current.email}`} className="hover:underline">
                    {current.email}
                  </a>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {when.format(new Date(current.createdAt))}
                  {current.repliedAt && ` · replied ${when.format(new Date(current.repliedAt))}`}
                </p>
              </header>
              <p className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-text">{current.message}</p>
              <footer className="flex flex-wrap gap-2 border-t border-border p-4">
                <a
                  href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject}`)}`}
                  onClick={() => current.status !== 'replied' && void setMessageStatus(current, 'replied')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary-solid px-3 text-xs font-medium text-white hover:brightness-110"
                >
                  <Reply size={13} aria-hidden /> Reply by email
                </a>
                {current.status !== 'replied' && (
                  <Button variant="secondary" size="sm" onClick={() => setMessageStatus(current, 'replied')}>
                    Mark as replied
                  </Button>
                )}
                {current.status !== 'unread' ? (
                  <Button variant="ghost" size="sm" onClick={() => setMessageStatus(current, 'unread')}>
                    <Mail size={13} aria-hidden /> Mark unread
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setMessageStatus(current, 'read')}>
                    <MailOpen size={13} aria-hidden /> Mark read
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto text-rose-600 dark:text-rose-400" onClick={() => remove(current)}>
                  <Trash2 size={13} aria-hidden /> Delete
                </Button>
              </footer>
            </article>
          ) : (
            <div className="grid h-full min-h-60 place-items-center rounded-2xl border border-dashed border-border text-sm text-muted">Select a message to read it.</div>
          )}
        </div>
      </div>
    </>
  );
}
