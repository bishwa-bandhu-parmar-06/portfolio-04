'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { educationConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={educationConfig} />;
}
