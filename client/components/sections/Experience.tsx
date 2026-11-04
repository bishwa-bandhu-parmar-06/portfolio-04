import { MapPin } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import { formatRange } from '@/lib/format';
import type { Experience as ExperienceItem, SectionCopy } from '@/lib/types';

const WORK_MODE = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' } as const;

export function Experience({ items, copy }: { items: ExperienceItem[]; copy: SectionCopy }) {
  if (items.length === 0) return null;

  return (
    <Section id="experience">
      <SectionHeading id="experience" {...copy} />
      <ol className="relative space-y-8 border-l border-border pl-6 sm:pl-10">
        {items.map((job, index) => {
          const current = job.roles.some((r) => !r.endDate);
          return (
            <li key={job._id} className="relative">
              <span
                aria-hidden
                className={`absolute top-6 -left-[31px] size-3 rounded-full border-2 border-bg sm:-left-[47px] ${
                  current ? 'bg-primary shadow-[0_0_0_4px_rgb(var(--primary-rgb)/0.2)]' : 'bg-border'
                }`}
              />
              <Reveal delay={Math.min(index, 3) * 0.05}>
                <Card className="p-6 hover:border-primary/40 hover:shadow-glow sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <h3 className="text-xl font-semibold text-text">
                      {job.companyUrl ? (
                        <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                    </h3>
                    <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                      <MapPin size={13} aria-hidden />
                      {[WORK_MODE[job.workMode], job.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {job.roles.map((role) => (
                      <li key={`${role.title}-${role.startDate}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="font-medium text-text">
                          {role.title}
                          {role.note && <span className="ml-2 text-sm font-normal text-muted">({role.note})</span>}
                        </p>
                        <p className={`font-mono text-xs ${role.endDate ? 'text-muted' : 'text-primary-text'}`}>
                          {formatRange(role.startDate, role.endDate)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {job.bullets.length > 0 && (
                    <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted sm:text-[15px]">
                      {job.bullets.map((b) => (
                        <li key={b} className="flex gap-3">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
