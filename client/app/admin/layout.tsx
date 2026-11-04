import type { Metadata } from 'next';
import { FeedbackProvider } from '@/components/admin/feedback';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <FeedbackProvider>{children}</FeedbackProvider>;
}
