'use client';

import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { useId, useState, type KeyboardEvent } from 'react';
import type { FieldDef, Values } from '@/lib/admin/fields';
import { cn } from '@/lib/format';
import type { Media } from '@/lib/types';
import { MediaUpload } from './MediaUpload';
import { Button, FieldError, Input, Label, Select, Switch, Textarea } from './ui';

interface FormFieldsProps {
  fields: FieldDef[];
  values: Values;
  onChange: (values: Values) => void;
  errors?: Record<string, string>;
  /** Dotted path of this level inside the whole form, used to look up server errors like "roles.0.title". */
  path?: string;
  onUploaded?: (media: Media) => void;
  columns?: 1 | 2;
}

/** Renders a list of field definitions as a responsive form grid. */
export function FormFields({ fields, values, onChange, errors = {}, path = '', onUploaded, columns = 2 }: FormFieldsProps) {
  const set = (name: string, value: unknown) => onChange({ ...values, [name]: value });

  return (
    <div className={cn('grid gap-5', columns === 2 && 'sm:grid-cols-2')}>
      {fields.map((field) => {
        const fullPath = path ? `${path}.${field.name}` : field.name;
        const wide =
          columns === 1 ||
          field.full ||
          ['textarea', 'markdown', 'list', 'tags', 'image', 'pdf', 'objectList', 'group'].includes(field.type);
        return (
          <div key={field.name} className={cn(wide && 'sm:col-span-2')}>
            <Field
              field={field}
              value={values[field.name]}
              onChange={(v) => set(field.name, v)}
              errors={errors}
              path={fullPath}
              onUploaded={onUploaded}
            />
          </div>
        );
      })}
    </div>
  );
}

interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  errors: Record<string, string>;
  path: string;
  onUploaded?: (media: Media) => void;
}

function Field({ field, value, onChange, errors, path, onUploaded }: FieldProps) {
  const id = `f-${useId().replace(/:/g, '')}`;
  const error = errors[path];
  const aria = { 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-err` : undefined };
  const label = (
    <Label htmlFor={id} hint={field.hint}>
      {field.label}
      {field.required && <span className="text-rose-500"> *</span>}
    </Label>
  );

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
    case 'tel':
      return (
        <>
          {label}
          <Input
            id={id}
            type={field.type}
            value={String(value ?? '')}
            placeholder={field.placeholder ?? (field.type === 'url' ? 'https://' : undefined)}
            maxLength={field.maxLength}
            onChange={(e) => onChange(e.target.value)}
            {...aria}
          />
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'textarea':
    case 'markdown':
      return (
        <>
          {label}
          <Textarea
            id={id}
            rows={field.rows ?? (field.type === 'markdown' ? 10 : 4)}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => onChange(e.target.value)}
            className={field.type === 'markdown' ? 'font-mono text-[13px]' : undefined}
            {...aria}
          />
          {field.type === 'markdown' && !error && (
            <p className="mt-1.5 text-xs text-muted">Markdown: **bold**, - lists, [links](https://…), `code`. Raw HTML is not rendered.</p>
          )}
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'number':
      return (
        <>
          {label}
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            {...aria}
          />
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'month':
      return (
        <>
          {label}
          <Input id={id} type="month" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} {...aria} />
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'boolean':
      return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-bg/50 px-4 py-3">
          <div>
            <label htmlFor={id} className="text-sm font-medium text-text">
              {field.label}
            </label>
            {field.description && <p className="mt-0.5 text-xs text-muted">{field.description}</p>}
          </div>
          <Switch id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
        </div>
      );

    case 'select':
      return (
        <>
          {label}
          <Select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} {...aria}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'color':
      return (
        <>
          {label}
          <ColorInput id={id} value={String(value ?? '')} onChange={onChange} />
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'tags':
      return (
        <>
          {label}
          <TagsInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} />
          <FieldError id={`${id}-err`}>{error ?? firstChildError(errors, path)}</FieldError>
        </>
      );

    case 'list':
      return (
        <>
          {label}
          <ListInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} addLabel={field.addLabel} errors={errors} path={path} />
          <FieldError id={`${id}-err`}>{error}</FieldError>
        </>
      );

    case 'image':
    case 'pdf':
      return (
        <>
          {label}
          <MediaUpload
            id={id}
            kind={field.type}
            folder={field.folder}
            value={(value as Media) ?? null}
            onChange={onChange}
            onUploaded={onUploaded}
            invalid={Boolean(error)}
          />
          <FieldError id={`${id}-err`}>{error ?? firstChildError(errors, path)}</FieldError>
        </>
      );

    case 'group':
      return (
        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium text-text">{field.label}</legend>
          <FormFields fields={field.fields} values={(value as Values) ?? {}} onChange={onChange} errors={errors} path={path} onUploaded={onUploaded} columns={field.fields.length > 2 ? 2 : 1} />
        </fieldset>
      );

    case 'objectList':
      return <ObjectList field={field} value={(value as Values[]) ?? []} onChange={onChange} errors={errors} path={path} onUploaded={onUploaded} />;
  }
}

function firstChildError(errors: Record<string, string>, path: string): string | undefined {
  const key = Object.keys(errors).find((k) => k.startsWith(`${path}.`));
  return key ? errors[key] : undefined;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function ColorInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick a color"
        value={valid ? value : '#000000'}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-bg p-1"
      />
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} className="font-mono uppercase" placeholder="#6366F1" />
    </div>
  );
}

function TagsInput({ id, value, onChange, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-bg p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
      {value.map((tag, i) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-text">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted hover:text-text">
            <X size={12} aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? '' : (placeholder ?? 'Type and press Enter')}
        className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-text outline-none placeholder:text-muted/70"
      />
    </div>
  );
}

function ListInput({
  id,
  value,
  onChange,
  placeholder,
  addLabel,
  errors,
  path,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  errors: Record<string, string>;
  path: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i}>
          <div className="flex items-start gap-2">
            <Textarea
              id={i === 0 ? id : undefined}
              rows={2}
              value={item}
              placeholder={placeholder}
              aria-label={`Item ${i + 1}`}
              aria-invalid={errors[`${path}.${i}`] ? true : undefined}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
              className="min-h-0 flex-1"
            />
            <ItemControls index={i} count={value.length} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
          <FieldError>{errors[`${path}.${i}`]}</FieldError>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onChange([...value, ''])}>
        <Plus size={13} aria-hidden /> {addLabel ?? 'Add item'}
      </Button>
    </div>
  );
}

function ItemControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      <Button variant="ghost" size="icon" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ArrowUp size={14} aria-hidden />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <ArrowDown size={14} aria-hidden />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Remove" onClick={onRemove}>
        <Trash2 size={14} aria-hidden />
      </Button>
    </div>
  );
}

function ObjectList({
  field,
  value,
  onChange,
  errors,
  path,
  onUploaded,
}: {
  field: Extract<FieldDef, { type: 'objectList' }>;
  value: Values[];
  onChange: (v: Values[]) => void;
  errors: Record<string, string>;
  path: string;
  onUploaded?: (media: Media) => void;
}) {
  const atMax = field.max !== undefined && value.length >= field.max;
  return (
    <fieldset>
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-text">
        {field.label}
        {field.hint && <span className="text-xs font-normal text-muted">{field.hint}</span>}
      </legend>
      <FieldError>{errors[path]}</FieldError>
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className={cn('rounded-xl border border-border bg-bg/40', field.inline ? 'flex items-start gap-2 p-2.5' : 'p-4')}>
            {!field.inline && (
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-text">{field.itemTitle?.(item, i) || `Item ${i + 1}`}</p>
                <ItemControls index={i} count={value.length} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
              </div>
            )}
            <div className="flex-1">
              <FormFields
                fields={field.fields}
                values={item}
                onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))}
                errors={errors}
                path={`${path}.${i}`}
                onUploaded={onUploaded}
                columns={field.fields.length > 1 ? 2 : 1}
              />
            </div>
            {field.inline && (
              <div className="pt-6">
                <ItemControls index={i} count={value.length} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-3" disabled={atMax} onClick={() => onChange([...value, field.newItem()])}>
        <Plus size={13} aria-hidden /> {field.addLabel ?? 'Add'}
      </Button>
    </fieldset>
  );
}
