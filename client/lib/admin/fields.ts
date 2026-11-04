import type { UploadFolder } from './api';

/**
 * Declarative form definitions. Each admin form is described as a list of
 * fields; <FormFields> renders them and these helpers convert between the
 * API's shapes and the strings HTML inputs work with.
 */

interface Base {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Span both columns of the form grid. */
  full?: boolean;
  /** Leave the key out of the payload when the input is empty (e.g. an optional slug). */
  omitEmpty?: boolean;
  /** For number/month inputs: send `null` when empty, to clear the value. Otherwise empty is left out. */
  nullable?: boolean;
}

export type FieldDef =
  | (Base & { type: 'text' | 'url' | 'email' | 'tel'; placeholder?: string; maxLength?: number })
  | (Base & { type: 'textarea' | 'markdown'; rows?: number; placeholder?: string; maxLength?: number })
  | (Base & { type: 'number'; min?: number; max?: number; placeholder?: string })
  | (Base & { type: 'month' })
  | (Base & { type: 'boolean'; description?: string })
  | (Base & { type: 'select'; options: { value: string; label: string }[] })
  | (Base & { type: 'tags'; placeholder?: string })
  | (Base & { type: 'list'; placeholder?: string; addLabel?: string })
  | (Base & { type: 'image'; folder: UploadFolder })
  | (Base & { type: 'pdf'; folder: UploadFolder })
  | (Base & { type: 'color' })
  | (Base & { type: 'group'; fields: FieldDef[] })
  | (Base & {
      type: 'objectList';
      fields: FieldDef[];
      /** Title shown on each item's card, e.g. the role title. */
      itemTitle?: (item: Record<string, unknown>, index: number) => string;
      newItem: () => Record<string, unknown>;
      addLabel?: string;
      max?: number;
      /** Lay items out as compact inline rows instead of cards. */
      inline?: boolean;
    });

export type Values = Record<string, unknown>;

const toMonth = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 7) : '');
const fromMonth = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}$/.test(v) ? `${v}-01T00:00:00.000Z` : null);

/** API document → editable form values (only the fields the form knows about). */
export function toForm(fields: FieldDef[], doc: Values = {}): Values {
  const out: Values = {};
  for (const f of fields) {
    const v = doc[f.name];
    switch (f.type) {
      case 'month':
        out[f.name] = toMonth(v);
        break;
      case 'number':
        out[f.name] = v === null || v === undefined ? '' : String(v);
        break;
      case 'boolean':
        out[f.name] = Boolean(v);
        break;
      case 'tags':
      case 'list':
        out[f.name] = Array.isArray(v) ? [...v] : [];
        break;
      case 'group':
        out[f.name] = toForm(f.fields, (v as Values) ?? {});
        break;
      case 'objectList':
        out[f.name] = Array.isArray(v) ? v.map((item) => toForm(f.fields, item as Values)) : [];
        break;
      case 'image':
      case 'pdf':
        out[f.name] = v ?? null;
        break;
      default:
        out[f.name] = v ?? '';
    }
  }
  return out;
}

/** Form values → API payload. */
export function fromForm(fields: FieldDef[], values: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    const v = values[f.name];
    switch (f.type) {
      case 'month':
        out[f.name] = fromMonth(v) ?? (f.nullable ? null : undefined);
        break;
      case 'number':
        out[f.name] = v === '' || v === null || v === undefined ? (f.nullable ? null : undefined) : Number(v);
        break;
      case 'list':
      case 'tags':
        out[f.name] = (v as string[]).map((s) => s.trim()).filter(Boolean);
        break;
      case 'group':
        out[f.name] = fromForm(f.fields, v as Values);
        break;
      case 'objectList':
        out[f.name] = (v as Values[]).map((item) => fromForm(f.fields, item));
        break;
      case 'text':
      case 'url':
      case 'email':
      case 'tel':
      case 'textarea':
      case 'markdown':
        out[f.name] = typeof v === 'string' ? v.trim() : v;
        break;
      default:
        out[f.name] = v;
    }
    if (f.omitEmpty && (out[f.name] === '' || out[f.name] === null)) delete out[f.name];
  }
  return out;
}

/** Turn the API's `[{ path: "roles.0.title", message }]` into a lookup by path. */
export function errorMap(fields: { path: string; message: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fields) map[f.path] ??= f.message;
  return map;
}
