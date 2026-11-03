'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import { certificationsConfig } from '@/lib/admin/collections';

export default function Page() {
  return <CollectionManager config={certificationsConfig} />;
}
