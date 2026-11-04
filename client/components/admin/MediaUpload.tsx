'use client';

import { FileText, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ApiError, uploadFile, type UploadFolder } from '@/lib/admin/api';
import { cn } from '@/lib/format';
import type { Media } from '@/lib/types';
import { Button } from './ui';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = { image: 'image/jpeg,image/png,image/webp', pdf: 'application/pdf' } as const;

interface MediaUploadProps {
  id?: string;
  kind: 'image' | 'pdf';
  folder: UploadFolder;
  value: Media | null;
  onChange: (media: Media | null) => void;
  /** Called with every file uploaded, so unsaved uploads can be cleaned up if the form is discarded. */
  onUploaded?: (media: Media) => void;
  invalid?: boolean;
}

function formatBytes(n?: number) {
  if (!n) return '';
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

function fileName(media: Media) {
  const name = media.publicId.split('/').pop() ?? 'file';
  return media.format && !name.endsWith(`.${media.format}`) ? `${name}.${media.format}` : name;
}

export function MediaUpload({ id, kind, folder, value, onChange, onUploaded, invalid }: MediaUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) return setError('File is larger than 5 MB.');
    if (!ACCEPT[kind].split(',').includes(file.type)) {
      return setError(kind === 'pdf' ? 'Please choose a PDF file.' : 'Please choose a JPG, PNG or WEBP image.');
    }
    setBusy(true);
    try {
      const media = await uploadFile(file, kind, folder);
      onUploaded?.(media);
      onChange(media);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex items-center gap-4 rounded-xl border border-dashed p-3 transition-colors',
          dragging ? 'border-primary bg-primary/5' : invalid ? 'border-rose-500' : 'border-border',
        )}
      >
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-bg">
          {busy ? (
            <LoaderCircle size={20} className="animate-spin text-muted" aria-hidden />
          ) : value && kind === 'image' ? (
            <Image src={value.url} alt="Preview" fill sizes="80px" className="object-cover" />
          ) : value ? (
            <FileText size={24} className="text-primary-text" aria-hidden />
          ) : kind === 'image' ? (
            <ImagePlus size={22} className="text-muted" aria-hidden />
          ) : (
            <FileText size={22} className="text-muted" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 text-sm">
          {value ? (
            <a href={value.url} target="_blank" rel="noopener noreferrer" className="block truncate font-medium text-text hover:underline">
              {fileName(value)}
            </a>
          ) : (
            <p className="text-muted">{kind === 'pdf' ? 'Drop a PDF here' : 'Drop an image here'} or browse. Max 5 MB.</p>
          )}
          {value && (
            <p className="mt-0.5 text-xs text-muted">
              {[value.width && `${value.width}×${value.height}`, formatBytes(value.bytes)].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>
              <Upload size={13} aria-hidden /> {value ? 'Replace' : 'Upload'}
            </Button>
            {value && (
              <Button variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>
                <Trash2 size={13} aria-hidden /> Remove
              </Button>
            )}
          </div>
        </div>

        <input
          ref={input}
          id={id}
          type="file"
          accept={ACCEPT[kind]}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void handle(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
