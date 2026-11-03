import { About } from '@/components/sections/About';
import { CodingProfiles } from '@/components/sections/CodingProfiles';
import { Contact } from '@/components/sections/Contact';
import { Education } from '@/components/sections/Education';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { getSite } from '@/lib/api';

export default async function HomePage() {
  const site = await getSite();
  const { sections } = site;

  return (
    <>
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
