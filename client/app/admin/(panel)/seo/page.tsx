'use client';

import { SettingsForm } from '@/components/admin/SettingsForm';
import { ErrorNotice, PageHeader, Spinner } from '@/components/admin/ui';
import type { Values } from '@/lib/admin/fields';
import { useApiData } from '@/lib/admin/hooks';
import { seoFields } from '@/lib/admin/settings';

export default function SeoPage() {
  const { data, error, loading, reload } = useApiData<{ settings: { seo: Values } }>('/admin/settings');

  return (
    <>
      <PageHeader title="SEO" description="How your site appears in search results and when the link is shared on LinkedIn, X or WhatsApp." />
      {loading && !data ? (
        <Spinner />
      ) : error || !data ? (
        <ErrorNotice message={error ?? 'Could not load settings.'} onRetry={reload} />
      ) : (
        <SettingsForm title="Search & sharing" fields={seoFields} initial={data.settings.seo} endpoint="/admin/settings/seo" />
      )}
    </>
  );
}
