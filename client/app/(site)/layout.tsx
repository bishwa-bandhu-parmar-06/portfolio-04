import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { MotionProvider } from '@/components/motion/Reveal';
import { getSite } from '@/lib/api';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const resume = site.resumes.find((r) => r.isDefault) ?? site.resumes[0];

  return (
    <MotionProvider>
      <Navbar name={site.profile.name} resumeUrl={resume?.url} />
      <main id="main">{children}</main>
      <Footer site={site} />
    </MotionProvider>
  );
}
