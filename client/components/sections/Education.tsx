import { ArrowUpRight, Award, GraduationCap } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import { formatMonth } from '@/lib/format';
import type { Certification, Education as EducationItem, SectionCopy } from '@/lib/types';

export function Education({
  education,
  certifications,
  copy,
}: {
  education: EducationItem[];
  certifications: Certification[];
  copy: SectionCopy;
}) {
  if (education.length === 0 && certifications.length === 0) return null;

  return (
    <Section id="education">
      <SectionHeading id="education" {...copy} />
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal className="space-y-4">
          {education.map((edu) => (
            <Card key={edu._id} className="p-6 hover:border-primary/40 hover:shadow-glow sm:p-7">
              <div className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-bg/60 text-primary-text">
                  <GraduationCap size={20} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-text">
                    {edu.degree}
                    {edu.field && <span className="font-normal">, {edu.field}</span>}
                  </h3>
                  <p className="mt-1 text-muted">{edu.institution}</p>
                  {edu.university && <p className="text-sm text-muted">{edu.university}</p>}
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
                    <span>
                      {edu.startYear} – {edu.endYear ?? 'Present'}
                    </span>
                    {edu.grade && <span className="text-primary-text">{edu.grade}</span>}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </Reveal>

        {certifications.length > 0 && (
          <Reveal delay={0.08}>
            <ul className="space-y-3">
              {certifications.map((cert) => {
                const meta = [cert.issuer, cert.platform && `via ${cert.platform}`, formatMonth(cert.date)].filter(Boolean).join(' · ');
                const body = (
                  <>
                    <Award size={18} className="mt-0.5 shrink-0 text-secondary-text" aria-hidden />
                    <span className="flex-1">
                      <span className="block font-medium text-text">{cert.name}</span>
                      <span className="mt-0.5 block text-sm text-muted">{meta}</span>
                    </span>
                    {cert.url && <ArrowUpRight size={16} className="shrink-0 text-muted transition-colors group-hover:text-text" aria-hidden />}
                  </>
                );
                return (
                  <li key={cert._id}>
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-glow"
                      >
                        {body}
                        <span className="sr-only">(view certificate)</span>
                      </a>
                    ) : (
                      <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
