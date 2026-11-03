'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { experienceConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={experienceConfig} />;
}
