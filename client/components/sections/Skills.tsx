import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import type { SectionCopy, SkillGroup } from '@/lib/types';

export function Skills({ groups, copy }: { groups: SkillGroup[]; copy: SectionCopy }) {
  if (groups.length === 0) return null;

  return (
    <Section id="skills">
      <SectionHeading id="skills" {...copy} />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <StaggerItem key={group._id} className="h-full">
            <Card className="h-full p-6 hover:border-primary/40 hover:shadow-glow">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-primary-text">{group.name}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg/50 px-3 py-1.5 text-sm text-text transition-colors hover:border-primary/40"
                  >
                    <Icon name={skill.icon} size={15} className="shrink-0 text-muted" />
                    {skill.name}
                  </li>
                ))}
              </ul>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
