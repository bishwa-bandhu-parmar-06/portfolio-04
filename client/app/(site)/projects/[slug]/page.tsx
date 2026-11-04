import { ArrowLeft, ArrowRight, ArrowUpRight, CircleCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SectionLink } from '@/components/layout/SectionLink';
import { ProjectCover } from '@/components/sections/ProjectCard';
import { Icon } from '@/components/ui/Icon';
import { Markdown } from '@/components/ui/Markdown';
import { Card, Tag, buttonClass } from '@/components/ui/primitives';
import { getProject, getProjectSlugs, getSite } from '@/lib/api';
import { formatMonth } from '@/lib/format';
import { SITE_URL, jsonLd } from '@/lib/site';

// Cache Components requires at least one param; an unknown slug simply renders the 404.
const NO_PROJECTS = '__none__';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return (slugs.length ? slugs : [NO_PROJECTS]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: 'Project not found' };
  const { project } = data;
  const description = project.summary || project.subtitle;
  return {
    title: `${project.title}${project.subtitle ? `: ${project.subtitle}` : ''}`,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `/projects/${project.slug}`,
    },
  };
}

/**
 * Built projects are fully pre-rendered. Any other slug (a project added after the
 * deploy) gets the pre-rendered shell instantly and its content streams in, then is
 * cached. Unknown slugs show the not-found page with `noindex` (the 200 status is
 * already sent by the time the lookup finishes).
 */
export default function ProjectPage(props: PageProps<'/projects/[slug]'>) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProjectDetail params={props.params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, site] = await Promise.all([slug === NO_PROJECTS ? null : getProject(slug), getSite()]);
  if (!data) notFound();
  const { project, prev, next } = data;
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.subtitle || project.title,
    description: project.summary,
    url: `${SITE_URL}/projects/${project.slug}`,
    ...(project.date ? { dateCreated: project.date } : {}),
    keywords: project.techTags.join(', '),
    ...(project.coverImage ? { image: project.coverImage.url } : {}),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
    author: { '@type': 'Person', name: site.profile.name, url: SITE_URL },
  };

  return (
    <article className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <SectionLink section="projects" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text">
        <ArrowLeft size={16} aria-hidden /> All projects
      </SectionLink>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-text">
          {[project.featured && 'Featured project', formatMonth(project.date)].filter(Boolean).join(' · ') || 'Project'}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-text sm:text-5xl">{project.title}</h1>
        {project.subtitle && <p className="mt-3 text-xl text-muted">{project.subtitle}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary')}>
              Live demo <ArrowUpRight size={16} aria-hidden />
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
              <Icon name="github" size={16} /> Source code
            </a>
          )}
        </div>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.techTags.map((tag) => (
            <li key={tag}>
              <Tag className="text-xs">{tag}</Tag>
            </li>
          ))}
        </ul>
      </header>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
        {project.coverImage ? (
          <Image src={project.coverImage.url} alt={`${project.title} screenshot`} fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
        ) : (
          <ProjectCover title={project.title} className="size-full" />
        )}
      </div>

      <div className="mt-14 grid gap-12">
        {project.description && (
          <section aria-labelledby="overview">
            <h2 id="overview" className="mb-5 text-2xl font-semibold text-text">
              Overview
            </h2>
            <Markdown>{project.description}</Markdown>
          </section>
        )}

        {project.features.length > 0 && (
          <section aria-labelledby="features">
            <h2 id="features" className="mb-5 text-2xl font-semibold text-text">
              Key features
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature}>
                  <Card className="flex h-full gap-3 p-4 text-sm leading-relaxed text-muted">
                    <CircleCheck size={18} className="mt-0.5 shrink-0 text-secondary-text" aria-hidden />
                    {feature}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.architecture && (
          <section aria-labelledby="architecture">
            <h2 id="architecture" className="mb-5 text-2xl font-semibold text-text">
              Architecture
            </h2>
            <Card className="p-6 sm:p-8">
              <Markdown>{project.architecture}</Markdown>
            </Card>
          </section>
        )}

        {project.screenshots.length > 0 && (
          <section aria-labelledby="screenshots">
            <h2 id="screenshots" className="mb-5 text-2xl font-semibold text-text">
              Screenshots
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {project.screenshots.map((shot, i) => (
                <li key={shot.image.publicId}>
                  <figure>
                    <a
                      href={shot.image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-[16/10] overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-glow"
                    >
                      <Image
                        src={shot.image.url}
                        alt={shot.caption || `${project.title} screenshot ${i + 1}`}
                        fill
                        sizes="(min-width: 640px) 440px, 100vw"
                        className="object-cover"
                      />
                    </a>
                    {shot.caption && <figcaption className="mt-2 text-sm text-muted">{shot.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {(prev || next) && (
        <nav aria-label="More projects" className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border border-border p-5 transition-all hover:border-primary/40 hover:shadow-glow">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                <ArrowLeft size={13} aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-semibold text-text">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/projects/${next.slug}`}
              className="group rounded-2xl border border-border p-5 text-right transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                Next <ArrowRight size={13} aria-hidden />
              </span>
              <span className="mt-1 block font-semibold text-text">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 pt-32 pb-20 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading project">
      <div className="h-4 w-28 rounded bg-card" />
      <div className="mt-10 h-12 w-2/3 rounded-lg bg-card" />
      <div className="mt-4 h-6 w-1/2 rounded bg-card" />
      <div className="mt-10 aspect-[16/9] rounded-2xl bg-card" />
    </div>
  );
}
