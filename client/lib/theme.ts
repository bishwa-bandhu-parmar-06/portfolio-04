import { ensureContrast, hexToRgbString } from './color';
import type { Theme } from './types';

export const THEME_STORAGE_KEY = 'pf-theme';

const SURFACES = {
  dark: { bg: '#0A0F1C', card: '#111827' },
  light: { bg: '#F8FAFC', card: '#FFFFFF' },
} as const;

function paletteVars(mode: 'dark' | 'light', primary: string, secondary: string): string {
  const { bg, card } = SURFACES[mode];
  // Text-on-accent is always white; darken the accent until white text passes AA.
  const primarySolid = ensureContrast(primary, '#ffffff');
  // Accent used as text must pass AA on both the page and card backgrounds.
  const primaryText = ensureContrast(ensureContrast(primary, bg), card);
  const secondaryText = ensureContrast(ensureContrast(secondary, bg), card);
  return [
    `--primary:${primary}`,
    `--primary-rgb:${hexToRgbString(primary)}`,
    `--secondary:${secondary}`,
    `--secondary-rgb:${hexToRgbString(secondary)}`,
    `--primary-solid:${primarySolid}`,
    `--primary-text:${primaryText}`,
    `--secondary-text:${secondaryText}`,
  ].join(';');
}

/** CSS custom properties for the admin-selected accent colours in both modes. */
export function themeCss(theme: Theme): string {
  return `:root{${paletteVars('light', theme.light.primary, theme.light.secondary)}}.dark{${paletteVars(
    'dark',
    theme.dark.primary,
    theme.dark.secondary,
  )}}`;
}

/** Runs before first paint: apply the visitor's saved mode, or the site default. */
export function themeBootScript(defaultMode: 'dark' | 'light'): string {
  return `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');if(m!=='dark'&&m!=='light')m='${defaultMode}';var d=document.documentElement;d.classList.toggle('dark',m==='dark');d.style.colorScheme=m;}catch(e){}})();`;
}
