import { Mail, MapPin, Phone } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SocialIcon } from '@/components/ui/Icon';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import type { SectionCopy, SiteData } from '@/lib/types';
import { ContactForm } from './ContactForm';

export function Contact({ site, copy }: { site: SiteData; copy: SectionCopy }) {
  const { profile, socialLinks } = site;

  return (
    <Section id="contact">
      <SectionHeading id="contact" {...copy} />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-6">
          <ul className="space-y-4 text-sm">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="group flex items-center gap-3 text-text">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-card text-primary-text">
                    <Mail size={18} aria-hidden />
                  </span>
                  <span className="break-all underline-offset-4 group-hover:underline">{profile.email}</span>
                </a>
              </li>
            )}
            {profile.phone && (
              <li>
                <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`} className="group flex items-center gap-3 text-text">
                  <span className="grid size-10 place-items-center rounded-xl border border-border bg-card text-primary-text">
                    <Phone size={18} aria-hidden />
                  </span>
                  <span className="underline-offset-4 group-hover:underline">{profile.phone}</span>
                </a>
              </li>
            )}
            {profile.location && (
              <li className="flex items-center gap-3 text-muted">
                <span className="grid size-10 place-items-center rounded-xl border border-border bg-card text-primary-text">
                  <MapPin size={18} aria-hidden />
                </span>
                {profile.location}
              </li>
            )}
          </ul>

          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Social profiles">
              {socialLinks.map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted transition-colors hover:border-primary/50 hover:text-text"
                  >
                    <SocialIcon platform={link.platform} size={15} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="relative p-6 sm:p-8">
            <ContactForm />
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
