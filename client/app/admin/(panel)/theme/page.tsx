'use client';

import { Check, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFeedback } from '@/components/admin/feedback';
import { Button, ErrorNotice, Input, Label, PageHeader, Panel, Spinner } from '@/components/admin/ui';
import { api, ApiError } from '@/lib/admin/api';
import { useApiData, useUnsavedWarning } from '@/lib/admin/hooks';
import { contrast, ensureContrast } from '@/lib/color';
import { cn } from '@/lib/format';
import { themeCss } from '@/lib/theme';
import type { Theme } from '@/lib/types';

const PRESETS: { id: Theme['preset']; name: string; dark: Theme['dark']; light: Theme['light'] }[] = [
  { id: 'indigo-cyan', name: 'Indigo & cyan', dark: { primary: '#6366F1', secondary: '#22D3EE' }, light: { primary: '#4F46E5', secondary: '#0891B2' } },
  { id: 'emerald-teal', name: 'Emerald & teal', dark: { primary: '#10B981', secondary: '#2DD4BF' }, light: { primary: '#047857', secondary: '#0D9488' } },
  { id: 'violet-pink', name: 'Violet & pink', dark: { primary: '#8B5CF6', secondary: '#F472B6' }, light: { primary: '#7C3AED', secondary: '#DB2777' } },
  { id: 'amber-orange', name: 'Amber & orange', dark: { primary: '#F59E0B', secondary: '#FB923C' }, light: { primary: '#B45309', secondary: '#C2410C' } },
];

const SURFACE = { dark: { bg: '#0A0F1C', card: '#111827', text: '#E5E7EB' }, light: { bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A' } };
const HEX = /^#[0-9a-fA-F]{6}$/;

export default function ThemePage() {
  const { data, error, loading, reload } = useApiData<{ settings: { theme: Theme } }>('/admin/settings');
  if (loading && !data) return <Spinner />;
  if (error || !data) return <ErrorNotice message={error ?? 'Could not load settings.'} onRetry={reload} />;
  return <ThemeEditor initial={data.settings.theme} />;
}

function ThemeEditor({ initial }: { initial: Theme }) {
  const { toast } = useFeedback();
  const [saved, setSaved] = useState(initial);
  const [theme, setTheme] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);
  const valid = [theme.dark.primary, theme.dark.secondary, theme.light.primary, theme.light.secondary].every((c) => HEX.test(c));
  useUnsavedWarning(dirty);

  // Live preview: the whole admin repaints with the draft colours; removed again on leave.
  useEffect(() => {
    if (!valid) return;
    let el = document.getElementById('theme-preview');
    if (!el) {
      el = document.createElement('style');
      el.id = 'theme-preview';
      document.head.appendChild(el);
    }
    el.textContent = themeCss(theme);
  }, [theme, valid]);
  useEffect(() => () => document.getElementById('theme-preview')?.remove(), []);

  const setColor = (mode: 'dark' | 'light', key: 'primary' | 'secondary', value: string) =>
    setTheme((t) => ({ ...t, preset: 'custom', [mode]: { ...t[mode], [key]: value.toUpperCase() } }));

  async function save() {
    setSaving(true);
    try {
      const { settings } = await api<{ settings: { theme: Theme } }>('PATCH', '/admin/settings/theme', theme);
      setSaved(settings.theme);
      setTheme(settings.theme);
      toast('success', 'Theme saved. The public site updates in a few seconds.');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Could not save the theme.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Theme"
        description="Pick a preset or your own accent colours. This admin previews your changes live; the public site switches after you save."
        actions={
          <>
            {dirty && (
              <Button variant="ghost" onClick={() => setTheme(saved)} disabled={saving}>
                Discard
              </Button>
            )}
            <Button onClick={save} loading={saving} disabled={!dirty || !valid}>
              Save theme
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Panel title="Presets">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRESETS.map((p) => {
              const active = theme.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTheme((t) => ({ ...t, preset: p.id, dark: p.dark, light: p.light }))}
                  className={cn('rounded-xl border p-3 text-left transition-colors', active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50')}
                >
                  <div className="flex h-10 overflow-hidden rounded-lg">
                    <span className="flex-1" style={{ background: p.dark.primary }} />
                    <span className="flex-1" style={{ background: p.dark.secondary }} />
                    <span className="flex-1" style={{ background: p.light.primary }} />
                    <span className="flex-1" style={{ background: p.light.secondary }} />
                  </div>
                  <p className="mt-2 flex items-center justify-between text-sm font-medium text-text">
                    {p.name} {active && <Check size={15} className="text-primary-text" aria-hidden />}
                  </p>
                </button>
              );
            })}
          </div>
          {theme.preset === 'custom' && <p className="mt-3 text-xs text-muted">Using custom colours.</p>}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          {(['dark', 'light'] as const).map((mode) => (
            <Panel key={mode} title={mode === 'dark' ? 'Dark mode colours' : 'Light mode colours'}>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['primary', 'secondary'] as const).map((key) => (
                  <ColorField key={key} id={`${mode}-${key}`} label={key === 'primary' ? 'Primary accent' : 'Secondary accent'} value={theme[mode][key]} onChange={(v) => setColor(mode, key, v)} />
                ))}
              </div>
              {HEX.test(theme[mode].primary) && HEX.test(theme[mode].secondary) && <Preview mode={mode} palette={theme[mode]} />}
            </Panel>
          ))}
        </div>

        <Panel title="Default mode" description="What first-time visitors see. Returning visitors keep the mode they picked.">
          <div className="flex gap-3">
            {(['dark', 'light'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={theme.defaultMode === mode}
                onClick={() => setTheme((t) => ({ ...t, defaultMode: mode }))}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm capitalize transition-colors',
                  theme.defaultMode === mode ? 'border-primary bg-primary/10 text-text' : 'border-border text-muted hover:text-text',
                )}
              >
                {mode === 'dark' ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />} {mode}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const valid = HEX.test(value);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label} picker`} value={valid ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-bg p-1" />
        <Input id={id} value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" aria-invalid={!valid} />
      </div>
      {!valid && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">Use a 6-digit hex colour like #6366F1</p>}
    </div>
  );
}

/** Mini mock-up of the site in one mode, with the contrast the site will actually use. */
function Preview({ mode, palette }: { mode: 'dark' | 'light'; palette: Theme['dark'] }) {
  const s = SURFACE[mode];
  const button = ensureContrast(palette.primary, '#ffffff');
  const accentText = ensureContrast(ensureContrast(palette.primary, s.bg), s.card);
  const adjusted = button.toLowerCase() !== palette.primary.toLowerCase() || accentText.toLowerCase() !== palette.primary.toLowerCase();

  return (
    <div className="mt-5">
      <div className="rounded-xl border p-4" style={{ background: s.bg, borderColor: mode === 'dark' ? '#1F2937' : '#E2E8F0' }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accentText }}>
          Projects
        </p>
        <p className="mt-1 font-display text-lg font-semibold" style={{ color: s.text }}>
          Products I&apos;ve{' '}
          <span style={{ background: `linear-gradient(100deg, ${accentText}, ${ensureContrast(palette.secondary, s.bg)})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
            shipped
          </span>
        </p>
        <span className="mt-3 inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-white" style={{ background: button }}>
          View Projects
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Button text {contrast('#ffffff', button).toFixed(1)}:1 · Accent text {contrast(accentText, s.bg).toFixed(1)}:1 (AA needs 4.5:1)
        {adjusted && ' · shades auto-adjusted for readability'}
      </p>
    </div>
  );
}
