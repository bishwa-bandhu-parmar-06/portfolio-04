import { ArrowUpRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Card, Tag, buttonClass } from '@/components/ui/primitives';
import { formatMonth } from '@/lib/format';
import type { ProjectCard as Project } from '@/lib/types';

const MAX_TAGS = 5;

/** Decorative stand-in until a cover image is uploaded. */
export function ProjectCover({ title, className = '' }: { title: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative grid place-items-center overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,rgb(var(--primary-rgb)/0.35),transparent_55%),radial-gradient(120%_120%_at_100%_100%,rgb(var(--secondary-rgb)/0.3),transparent_55%)] ${className}`}
    >
      <div className="bg-grid absolute inset-0 opacity-70" />
      <span className="relative font-display text-4xl font-bold tracking-tight text-text/85">{title}</span>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const tags = project.techTags.slice(0, MAX_TAGS);
  const extra = project.techTags.length - tags.length;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow transition-transform">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border">
        {project.coverImage ? (
          <Image
            src={project.coverImage.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ProjectCover title={project.title} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
        {project.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-border bg-bg/80 px-2.5 py-1 font-mono text-[11px] text-text backdrop-blur">
            <Star size={11} className="fill-current text-amber-500" aria-hidden /> Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-text">
            {/* Stretched link: the whole card opens the detail page. */}
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {project.title}
            </Link>
          </h3>
          {project.date && <span className="shrink-0 font-mono text-xs text-muted">{formatMonth(project.date)}</span>}
        </div>
        {project.subtitle && <p className="mt-1 text-sm font-medium text-primary-text">{project.subtitle}</p>}
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
          {extra > 0 && (
            <li>
              <Tag>+{extra}</Tag>
            </li>
          )}
        </ul>

        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('primary', 'sm')}
              aria-label={`${project.title} live demo`}
            >
              Live <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('secondary', 'sm')}
              aria-label={`${project.title} source code on GitHub`}
            >
              <Icon name="github" size={14} /> GitHub
            </a>
          )}
          <span className="ml-auto inline-flex items-center gap-1 self-center text-sm text-muted transition-colors group-hover:text-text">
            Details <ArrowUpRight size={14} aria-hidden />
          </span>
        </div>
      </div>
    </Card>
  );
}
