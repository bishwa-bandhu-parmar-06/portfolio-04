import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { Section, SectionHeading } from '@/components/ui/primitives';
import type { ProjectCard as Project, SectionCopy } from '@/lib/types';
import { ProjectCard } from './ProjectCard';

export function Projects({ projects, copy }: { projects: Project[]; copy: SectionCopy }) {
  if (projects.length === 0) return null;

  return (
    <Section id="projects">
      <SectionHeading id="projects" {...copy} />
      <Stagger className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <StaggerItem key={project._id} className="h-full">
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
