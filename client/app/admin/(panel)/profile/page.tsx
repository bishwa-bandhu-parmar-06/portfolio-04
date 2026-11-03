'use client';

import { SettingsForm } from '@/components/admin/SettingsForm';
import { ErrorNotice, PageHeader, Spinner } from '@/components/admin/ui';
import type { Values } from '@/lib/admin/fields';
import { useApiData } from '@/lib/admin/hooks';
import { profileFields, statsFields } from '@/lib/admin/settings';

export default function ProfilePage() {
  const { data, error, loading, reload } = useApiData<{ settings: { profile: Values; stats: Values[] } }>('/admin/settings');

  return (
    <>
      <PageHeader title="Profile" description="Your name, photo, bio and contact details, used across the whole site." />
      {loading && !data ? (
        <Spinner />
      ) : error || !data ? (
        <ErrorNotice message={error ?? 'Could not load settings.'} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <SettingsForm title="Profile" fields={profileFields} initial={data.settings.profile} endpoint="/admin/settings/profile" />
          <SettingsForm title="Quick stats" fields={statsFields} initial={{ stats: data.settings.stats }} endpoint="/admin/settings/stats" />
        </div>
      )}
    </>
  );
}
