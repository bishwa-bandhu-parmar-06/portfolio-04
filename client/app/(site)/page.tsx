import { About } from '@/components/sections/About';
import { CodingProfiles } from '@/components/sections/CodingProfiles';
import { Contact } from '@/components/sections/Contact';
import { Education } from '@/components/sections/Education';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { getSite } from '@/lib/api';
import { SITE_URL, jsonLd } from '@/lib/site';

export default async function HomePage() {
  const site = await getSite();
  const { sections, profile } = site;
  const education = site.education[0];
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    jobTitle: profile.title,
    description: profile.tagline,
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    ...(profile.photo ? { image: profile.photo.url } : {}),
    ...(profile.company ? { worksFor: { '@type': 'Organization', name: profile.company, ...(profile.companyUrl ? { url: profile.companyUrl } : {}) } } : {}),
    ...(profile.location ? { address: { '@type': 'PostalAddress', addressLocality: profile.location } } : {}),
    ...(education ? { alumniOf: { '@type': 'CollegeOrUniversity', name: education.institution } } : {}),
    sameAs: site.socialLinks.filter((l) => l.url.startsWith('http')).map((l) => l.url),
    knowsAbout: site.skillGroups.flatMap((g) => g.skills.map((s) => s.name)).slice(0, 30),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <Hero site={site} />
      <About site={site} copy={sections.about} />
      <Experience items={site.experience} copy={sections.experience} />
      <Projects projects={site.projects} copy={sections.projects} />
      <Skills groups={site.skillGroups} copy={sections.skills} />
      <CodingProfiles profiles={site.codingProfiles} copy={sections.coding} />
      <Education education={site.education} certifications={site.certifications} copy={sections.education} />
      <Contact site={site} copy={sections.contact} />
    </>
  );
}
