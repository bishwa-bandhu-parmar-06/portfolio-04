'use client';

import type { Media } from '@/lib/types';

/**
 * Browser-side client for the admin API. Requests go to same-origin /api/*,
 * which Next.js rewrites to the Express server, so the session cookie is first-party.
 */

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: FieldError[] = [],
    public code?: string,
  ) {
    super(message);
  }
}

/** Fired on any 401 so the shell can send the user back to the login page. */
export const UNAUTHORIZED_EVENT = 'admin:unauthorized';

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    const err = body?.error;
    throw new ApiError(
      res.status,
      err?.message ?? (res.status >= 500 ? 'Server error. Please try again.' : `Request failed (${res.status})`),
      err?.fields ?? [],
      err?.code,
    );
  }
  return body as T;
}

export async function api<T = unknown>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. It may be waking up; try again in a few seconds.');
  }
  return parse<T>(res);
}

export type UploadFolder = 'profile' | 'projects' | 'resumes' | 'seo' | 'misc';

export async function uploadFile(file: File, kind: 'image' | 'pdf', folder: UploadFolder): Promise<Media> {
  const form = new FormData();
  form.append('file', file);
  let res: Response;
  try {
    res = await fetch(`/api/admin/uploads?kind=${kind}&folder=${folder}`, { method: 'POST', body: form, credentials: 'same-origin' });
  } catch {
    throw new ApiError(0, 'Upload failed: could not reach the server.');
  }
  const { media } = await parse<{ media: Media }>(res);
  return media;
}

/** After a save, delete uploads from this edit session that the saved payload no longer references. */
export function discardUnused(uploads: Media[], saved: unknown): void {
  const json = JSON.stringify(saved);
  uploads.filter((m) => !json.includes(m.publicId)).forEach(discardUpload);
}

/** Remove an upload that was replaced before it was ever saved. Best effort. */
export function discardUpload(media: Media): void {
  void api('DELETE', '/admin/uploads', { publicId: media.publicId, resourceType: media.resourceType }).catch(() => {});
}
