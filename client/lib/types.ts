/** Shapes returned by the Express API (see server/src/controllers/public.controller.ts). */

export interface Media {
  url: string;
  publicId: string;
  resourceType: 'image' | 'raw';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface Profile {
  name: string;
  title: string;
  company: string;
  companyUrl?: string;
  tagline: string;
  bio: string;
  location: string;
  availability: string;
  openToWork: boolean;
  email: string;
  phone?: string;
  photo?: Media | null;
}

export interface Palette {
  primary: string;
  secondary: string;
}

export interface Theme {
  preset: string;
  dark: Palette;
  light: Palette;
  defaultMode: 'dark' | 'light';
}

export interface Seo {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: Media | null;
}

export type SocialPlatform =
  | 'linkedin'
  | 'github'
  | 'leetcode'
  | 'geeksforgeeks'
  | 'x'
  | 'fiverr'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'medium'
  | 'website'
  | 'email'
  | 'other';

export interface SocialLink {
  _id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface ProjectCard {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  techTags: string[];
  liveUrl?: string;
  githubUrl?: string;
  coverImage?: Media | null;
  date?: string | null;
  featured: boolean;
}

export interface Project extends ProjectCard {
  description: string;
  features: string[];
  architecture: string;
  screenshots: { image: Media; caption?: string }[];
  updatedAt: string;
}

export interface Role {
  title: string;
  startDate: string;
  endDate?: string | null;
  note?: string;
}

export interface Experience {
  _id: string;
  company: string;
  companyUrl?: string;
  location?: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  roles: Role[];
  bullets: string[];
}

export interface SkillGroup {
  _id: string;
  name: string;
  skills: { name: string; icon?: string }[];
}

export interface Education {
  _id: string;
  institution: string;
  university?: string;
  degree: string;
  field?: string;
  startYear: number;
  endYear?: number | null;
  grade?: string;
}

export interface Certification {
  _id: string;
  name: string;
  issuer: string;
  platform?: string;
  date?: string | null;
  url?: string;
}

export interface CodingProfile {
  _id: string;
  platform: 'leetcode' | 'geeksforgeeks' | 'codeforces' | 'codechef' | 'hackerrank' | 'other';
  username: string;
  url: string;
  totalSolved: number;
  breakdown: { easy?: number | null; medium?: number | null; hard?: number | null };
  highlights: { label: string; value: string }[];
}

export interface ResumeLink {
  label: string;
  slug: string;
  url: string;
  isDefault: boolean;
}

export type SectionKey = 'about' | 'experience' | 'projects' | 'skills' | 'coding' | 'education' | 'contact';

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export interface SiteData {
  profile: Profile;
  stats: { label: string; value: string }[];
  sections: Record<SectionKey, SectionCopy>;
  theme: Theme;
  seo: Seo;
  updatedAt: string;
  socialLinks: SocialLink[];
  projects: ProjectCard[];
  experience: Experience[];
  skillGroups: SkillGroup[];
  education: Education[];
  certifications: Certification[];
  codingProfiles: CodingProfile[];
  resumes: ResumeLink[];
}

export interface ProjectDetail {
  project: Project;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}
