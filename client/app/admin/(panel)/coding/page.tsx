'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { codingConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={codingConfig} />;
}
