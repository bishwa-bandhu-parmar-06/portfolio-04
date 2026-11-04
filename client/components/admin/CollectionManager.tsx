'use client';

import { Eye, EyeOff, GripVertical, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState, type DragEvent, type ReactNode } from 'react';
import { api, ApiError, discardUnused, discardUpload } from '@/lib/admin/api';
import { errorMap, fromForm, toForm, type FieldDef, type Values } from '@/lib/admin/fields';
import { useApiData } from '@/lib/admin/hooks';
import { cn } from '@/lib/format';
import type { Media } from '@/lib/types';
import { Drawer, useFeedback } from './feedback';
import { FormFields } from './FormFields';
import { Button, EmptyState, ErrorNotice, PageHeader, Spinner } from './ui';

export interface Item extends Values {
  _id: string;
  order?: number;
  visible?: boolean;
}

export interface CollectionConfig {
  /** API path segment, e.g. "projects" → /api/admin/projects */
  resource: string;
  title: string;
  description?: string;
  singular: string;
  fields: FieldDef[];
  /** Values for a brand-new item, in API shape. */
  defaults?: Values;
  rowTitle: (item: Item) => string;
  rowSubtitle?: (item: Item) => ReactNode;
  rowThumb?: (item: Item) => string | undefined;
  /** Disable drag ordering when the list is sorted another way (e.g. featured first). */
  sortNote?: string;
  wideEditor?: boolean;
  /** Extra buttons on each row (e.g. "Make default"). */
  rowActions?: (item: Item, helpers: { reload: () => void }) => ReactNode;
  rowBadge?: (item: Item) => ReactNode;
}

type Editing = { mode: 'create' } | { mode: 'edit'; item: Item } | null;

/** List + drag-to-reorder + show/hide + create/edit drawer + delete, for one collection. */
export function CollectionManager({ config }: { config: CollectionConfig }) {
  const { toast, confirm } = useFeedback();
  const { data, setData, error, loading, reload } = useApiData<{ items: Item[] }>(`/admin/${config.resource}`);
  const items = data?.items ?? [];
  const [editing, setEditing] = useState<Editing>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function saveOrder(next: Item[]) {
    const previous = items;
    setData({ items: next });
    try {
      const res = await api<{ items: Item[] }>('PATCH', `/admin/${config.resource}/reorder`, { ids: next.map((i) => i._id) });
      setData(res);
    } catch (err) {
      setData({ items: previous });
      toast('error', err instanceof ApiError ? err.message : 'Could not save the new order.');
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void saveOrder(next);
  }

  async function toggleVisible(item: Item) {
    try {
      const { item: updated } = await api<{ item: Item }>('PATCH', `/admin/${config.resource}/${item._id}`, { visible: !item.visible });
      setData({ items: items.map((i) => (i._id === item._id ? updated : i)) });
      toast('success', `${config.rowTitle(updated)} is now ${updated.visible ? 'visible' : 'hidden'}.`);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not update.');
    }
  }

  async function remove(item: Item) {
    const ok = await confirm({
      title: `Delete "${config.rowTitle(item)}"?`,
      message: 'This removes it from the site, including any uploaded files. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api('DELETE', `/admin/${config.resource}/${item._id}`);
      toast('success', 'Deleted.');
      void reload();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not delete.');
    }
  }

  const onDragStart = (i: number) => (e: DragEvent) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (i: number) => (e: DragEvent) => {
    e.preventDefault();
    setOverIndex(i);
  };
  const onDrop = (i: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null) move(dragIndex, i);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button onClick={() => setEditing({ mode: 'create' })}>
            <Plus size={16} aria-hidden /> Add {config.singular}
          </Button>
        }
      />

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${config.title.toLowerCase()} yet`}>
          Use <strong>Add {config.singular}</strong> to create the first one.
        </EmptyState>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">
            {config.sortNote ?? 'Drag rows (or use the arrow keys on the handle) to change the order on the site.'}
          </p>
          <ul className="space-y-2">
            {items.map((item, i) => {
              const thumb = config.rowThumb?.(item);
              return (
                <li
                  key={item._id}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOver(i)}
                  onDrop={onDrop(i)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors',
                    overIndex === i && dragIndex !== i ? 'border-primary' : 'border-border',
                    dragIndex === i && 'opacity-50',
                    item.visible === false && 'opacity-60',
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Reorder ${config.rowTitle(item)}. Use arrow up or down to move.`}
                    className="cursor-grab rounded p-1 text-muted hover:text-text active:cursor-grabbing"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        move(i, i - 1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        move(i, i + 1);
                      }
                    }}
                  >
                    <GripVertical size={16} aria-hidden />
                  </button>
                  {thumb !== undefined && (
                    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
                      {thumb && (
                        // Tiny admin thumbnail; next/image is unnecessary here.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb.replace('/image/upload/', '/image/upload/c_fill,w_88,h_88,f_auto,q_auto/')} alt="" className="size-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium text-text">
                      {config.rowTitle(item)}
                      {config.rowBadge?.(item)}
                      {item.featured === true && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
                    </p>
                    {config.rowSubtitle && <p className="truncate text-sm text-muted">{config.rowSubtitle(item)}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {config.rowActions?.(item, { reload })}
                    {item.visible !== undefined && (
                      <Button variant="ghost" size="icon" aria-label={item.visible ? 'Hide from site' : 'Show on site'} title={item.visible ? 'Visible' : 'Hidden'} onClick={() => toggleVisible(item)}>
                        {item.visible ? <Eye size={15} aria-hidden /> : <EyeOff size={15} aria-hidden />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label={`Edit ${config.rowTitle(item)}`} onClick={() => setEditing({ mode: 'edit', item })}>
                      <Pencil size={15} aria-hidden />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${config.rowTitle(item)}`} onClick={() => remove(item)}>
                      <Trash2 size={15} aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {editing && (
        <Editor
          key={editing.mode === 'edit' ? editing.item._id : 'new'}
          config={config}
          item={editing.mode === 'edit' ? editing.item : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      )}
    </>
  );
}

function Editor({ config, item, onClose, onSaved }: { config: CollectionConfig; item: Item | null; onClose: () => void; onSaved: () => void }) {
  const { toast, confirm } = useFeedback();
  const [initial] = useState(() => toForm(config.fields, item ?? config.defaults ?? {}));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Media[]>([]);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const payload = fromForm(config.fields, values);
      if (item) await api('PATCH', `/admin/${config.resource}/${item._id}`, payload);
      else await api('POST', `/admin/${config.resource}`, payload);
      discardUnused(pending, payload);
      toast('success', `${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${item ? 'updated' : 'added'}.`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields.length) {
        setErrors(errorMap(err.fields));
        toast('error', 'Please fix the highlighted fields.');
      } else {
        toast('error', err instanceof ApiError ? err.message : 'Could not save.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function close() {
    if (dirty && !(await confirm({ title: 'Discard changes?', message: 'Your edits have not been saved.', confirmLabel: 'Discard', danger: true }))) {
      return;
    }
    pending.forEach(discardUpload);
    onClose();
  }

  return (
    <Drawer
      open
      wide={config.wideEditor}
      title={item ? `Edit ${config.rowTitle(item)}` : `New ${config.singular}`}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {item ? 'Save changes' : `Add ${config.singular}`}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <FormFields fields={config.fields} values={values} onChange={setValues} errors={errors} onUploaded={(m) => setPending((p) => [...p, m])} />
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </Drawer>
  );
}
