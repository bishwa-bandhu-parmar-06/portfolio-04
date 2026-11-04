import { getProject, getProjectSlugs, getSite } from '@/lib/api';
import { OG_SIZE, ogCard, uploadedImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Project preview';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return (slugs.length ? slugs : ['__none__']).map((slug) => ({ slug }));
}

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, site] = await Promise.all([getProject(slug), getSite()]);
  const project = data?.project;
  if (!project) {
    return ogCard({ eyebrow: 'Project', title: site.profile.name, subtitle: site.profile.tagline, footer: site.profile.title, theme: site.theme });
  }
  return (
    (await uploadedImage(project.coverImage)) ??
    ogCard({
      eyebrow: project.subtitle || 'Project',
      title: project.title,
      subtitle: project.summary,
      footer: [project.techTags.slice(0, 4).join(' · '), `by ${site.profile.name}`].filter(Boolean).join('   —   '),
      theme: site.theme,
    })
  );
}
