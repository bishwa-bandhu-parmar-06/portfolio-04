import { Briefcase, MapPin } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import type { SectionCopy, SiteData } from '@/lib/types';

export function About({ site, copy }: { site: SiteData; copy: SectionCopy }) {
  const { profile, stats } = site;
  const paragraphs = profile.bio.split(/\n{2,}/).filter(Boolean);

  return (
    <Section id="about">
      <SectionHeading id="about" {...copy} />
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <dl className="grid gap-4 pt-2 text-sm sm:grid-cols-2">
            {profile.location && (
              <div>
                {/* dt/dd must be direct children of the group for a valid description list. */}
                <dt className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
                  <MapPin size={16} className="shrink-0 text-primary-text" aria-hidden />
                  Based in
                </dt>
                <dd className="mt-1 pl-6 text-text">{profile.location}</dd>
              </div>
            )}
            {profile.availability && (
              <div>
                {/* dt/dd must be direct children of the group for a valid description list. */}
                <dt className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
                  <Briefcase size={16} className="shrink-0 text-primary-text" aria-hidden />
                  Looking for
                </dt>
                <dd className="mt-1 pl-6 text-text">{profile.availability}</dd>
              </div>
            )}
          </dl>
        </Reveal>

        {stats.length > 0 && (
          <Stagger className="grid grid-cols-2 gap-4 self-start sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <Card className="p-5 hover:border-primary/40 hover:shadow-glow lg:flex lg:items-baseline lg:gap-4">
                  <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted lg:mt-0">{stat.label}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </Section>
  );
}
