'use client';

import { Moon, Sun } from 'lucide-react';
import { THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * Both icons are rendered and CSS shows the right one, so the server markup
 * never disagrees with the mode the boot script picked.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode: the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-9 place-items-center rounded-xl border border-border text-muted transition-colors hover:border-primary/50 hover:text-text"
      aria-label="Toggle dark mode"
    >
      <Sun size={17} className="hidden dark:block" aria-hidden />
      <Moon size={17} className="block dark:hidden" aria-hidden />
    </button>
  );
}
