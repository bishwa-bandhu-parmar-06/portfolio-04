import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const idParams = z.object({ id: objectId });

/** Short single-line text. */
export const text = (max = 200) => z.string().trim().max(max);
/** Required short text. */
export const requiredText = (max = 200) => z.string().trim().min(1, 'Required').max(max);
/** Long text (bios, markdown). */
export const longText = (max = 10_000) => z.string().trim().max(max);

/** http(s) URLs only, so stored links can never be `javascript:` or `data:`. */
export const httpUrl = z.url({ protocol: /^https?$/, error: 'Must be a valid http(s) URL' }).max(2000);
/**
 * A link that may also be cleared with an empty string. Deliberately has no
 * `.default()`: Zod applies defaults inside `.partial()`, which would wipe the
 * field on every PATCH that omits it.
 */
export const optionalUrl = z.union([z.literal(''), httpUrl]);

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #6366F1');

export const media = z.object({
  url: z.url({ protocol: /^https$/, hostname: /^res\.cloudinary\.com$/, error: 'Must be a Cloudinary URL' }),
  publicId: requiredText(300),
  resourceType: z.enum(['image', 'raw']).default('image'),
  format: text(20).optional(),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type MediaInput = z.infer<typeof media>;

export const optionalDate = z.coerce.date().nullable().optional();

export const orderable = {
  order: z.number().int().min(0).max(10_000).optional(),
  visible: z.boolean().optional(),
};

export const reorderBody = z.object({
  ids: z.array(objectId).min(1).max(500),
});

export const labelValue = z.object({ label: requiredText(60), value: requiredText(60) });
