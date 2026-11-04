/** Canonical public URL of the site, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/[/]$/, '');

// U+2028 / U+2029 are valid in JSON but end a line in older JavaScript parsers.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
const UNSAFE = new RegExp(`[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, 'g');

const BACKSLASH = String.fromCharCode(92);

/** JSON unicode escape for one character: "<" becomes backslash + "u003c". */
const escapeChar = (c: string) => `${BACKSLASH}u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;

/**
 * Serialize JSON-LD for an inline <script>. Characters that could close the
 * script tag or break parsing become JSON unicode escapes, which parse back to
 * the same text, so admin-entered values can never inject markup.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, escapeChar);
}
