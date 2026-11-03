'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { projectsConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={projectsConfig} />;
}
