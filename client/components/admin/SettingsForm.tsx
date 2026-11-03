'use client';

import { useState } from 'react';
import { api, ApiError, discardUnused, discardUpload } from '@/lib/admin/api';
import { errorMap, fromForm, toForm, type FieldDef, type Values } from '@/lib/admin/fields';
import { useUnsavedWarning } from '@/lib/admin/hooks';
import type { Media } from '@/lib/types';
import { useFeedback } from './feedback';
import { FormFields } from './FormFields';
import { Button, Panel } from './ui';

interface SettingsFormProps {
  title: string;
  description?: string;
  fields: FieldDef[];
  /** The current values for this section of the settings document. */
  initial: Values;
  /** PATCH endpoint, e.g. "/admin/settings/profile". */
  endpoint: string;
  onSaved?: (settings: Values) => void;
}

/** One card on a settings page: renders the fields and PATCHes only that section. */
export function SettingsForm({ title, description, fields, initial, endpoint, onSaved }: SettingsFormProps) {
  const { toast } = useFeedback();
  const [baseline, setBaseline] = useState(() => toForm(fields, initial));
  const [values, setValues] = useState(baseline);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Media[]>([]);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  useUnsavedWarning(dirty);

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const payload = fromForm(fields, values);
      const { settings } = await api<{ settings: Values }>('PATCH', endpoint, payload);
      setBaseline(values);
      discardUnused(pending, payload);
      setPending([]);
      onSaved?.(settings);
      toast('success', `${title} saved. The site updates in a few seconds.`);
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

  function reset() {
    // Uploads made since the last save are no longer referenced.
    pending.forEach(discardUpload);
    setPending([]);
    setValues(baseline);
    setErrors({});
  }

  return (
    <Panel
      title={title}
      description={description}
      actions={
        <div className="flex gap-2">
          {dirty && (
            <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
              Discard
            </Button>
          )}
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
            Save
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) void save();
        }}
      >
        <FormFields fields={fields} values={values} onChange={setValues} errors={errors} onUploaded={(m) => setPending((p) => [...p, m])} />
        {/* Lets Enter in a text field submit the card. */}
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </Panel>
  );
}
