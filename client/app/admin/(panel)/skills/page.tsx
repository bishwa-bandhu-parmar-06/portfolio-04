'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { skillsConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={skillsConfig} />;
}
