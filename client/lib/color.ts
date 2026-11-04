/**
 * Small colour helpers used to keep admin-chosen accent colours WCAG AA compliant.
 * Given any accent, we derive:
 *  - a "solid" shade that white text can sit on (buttons)
 *  - a "text" shade readable on the page background (links, highlights)
 */

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(hex: string, target: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * amount) as RGB);
}

/** Nudge `color` toward black or white until it reaches `ratio` against `against`. */
export function ensureContrast(color: string, against: string, ratio = 4.5): string {
  if (contrast(color, against) >= ratio) return color;
  const target = luminance(against) > 0.5 ? '#000000' : '#ffffff';
  for (let step = 0.04; step <= 1; step += 0.04) {
    const candidate = mix(color, target, step);
    if (contrast(candidate, against) >= ratio) return candidate;
  }
  return target;
}

export function hexToRgbString(hex: string): string {
  return hexToRgb(hex).join(' ');
}
