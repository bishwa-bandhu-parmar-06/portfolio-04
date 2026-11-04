'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { useFeedback } from '@/components/admin/feedback';
import { Button } from '@/components/admin/ui';
import { api, ApiError } from '@/lib/admin/api';
import { resumesConfig } from '@/lib/admin/collections';

export default function ResumesPage() {
  const { toast } = useFeedback();

  return (
    <CollectionManager
      config={{
        ...resumesConfig,
        rowBadge: (r) =>
          r.isDefault ? (
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-text">
              Default
            </span>
          ) : null,
        rowActions: (r, { reload }) => (
          <>
            <a
              href={(r.file as { url: string }).url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-card-hover hover:text-text"
            >
              Open
            </a>
            {!r.isDefault && (
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await api('PATCH', `/admin/resumes/${r._id}/default`);
                    toast('success', `"${r.label}" is now the default resume.`);
                    reload();
                  } catch (err) {
                    toast('error', err instanceof ApiError ? err.message : 'Could not update.');
                  }
                }}
              >
                Make default
              </Button>
            )}
          </>
        ),
      }}
    />
  );
}
