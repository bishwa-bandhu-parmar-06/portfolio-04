'use client';

import { SettingsForm } from '@/components/admin/SettingsForm';
import { ErrorNotice, PageHeader, Spinner } from '@/components/admin/ui';
import type { Values } from '@/lib/admin/fields';
import { useApiData } from '@/lib/admin/hooks';
import { sectionFields } from '@/lib/admin/settings';

export default function SectionsPage() {
  const { data, error, loading, reload } = useApiData<{ settings: { sections: Values } }>('/admin/settings');

  return (
    <>
      <PageHeader
        title="Section headings"
        description="The small label, heading and intro text above each section of the home page. In the Coding profiles heading, {total} is replaced with your total problem count."
      />
      {loading && !data ? (
        <Spinner />
      ) : error || !data ? (
        <ErrorNotice message={error ?? 'Could not load settings.'} onRetry={reload} />
      ) : (
        <SettingsForm title="Headings" fields={sectionFields} initial={data.settings.sections} endpoint="/admin/settings/sections" />
      )}
    </>
  );
}
