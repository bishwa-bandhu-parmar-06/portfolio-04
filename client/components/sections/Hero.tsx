import { ArrowRight, Download, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { HeroVisual } from '@/components/three/HeroVisual';
import { SocialIcon } from '@/components/ui/Icon';
import { buttonClass } from '@/components/ui/primitives';
import type { SiteData } from '@/lib/types';

export function Hero({ site }: { site: SiteData }) {
  const { profile, socialLinks, resumes } = site;
  const resume = resumes.find((r) => r.isDefault) ?? resumes[0];
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden pt-24 pb-20 sm:pt-36 sm:pb-28">
      {/* Soft background: grid + accent glow. Purely decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--primary-rgb)/0.18),transparent)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="hero-rise order-2 lg:order-1">
          {profile.availability && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur">
              <span className="relative flex size-2">
                {profile.openToWork && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                )}
                <span className={`relative inline-flex size-2 rounded-full ${profile.openToWork ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </span>
              {profile.availability}
            </p>
          )}

          <h1 id="hero-title" className="text-4xl font-bold leading-[1.05] text-text sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted sm:text-base">
            <span className="text-gradient font-semibold">{profile.title}</span>
            {profile.company && (
              <>
                {' '}
                @{' '}
                {profile.companyUrl ? (
                  <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className="text-text underline-offset-4 hover:underline">
                    {profile.company}
                  </a>
                ) : (
                  <span className="text-text">{profile.company}</span>
                )}
              </>
            )}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.tagline}</p>
          {profile.location && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={15} aria-hidden /> {profile.location}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className={buttonClass('primary')}>
              View Projects <ArrowRight size={16} aria-hidden />
            </a>
            {resume && (
              <a href={resume.url} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
                <Download size={16} aria-hidden /> Download Resume
              </a>
            )}
            <a href="#contact" className={buttonClass('ghost')}>
              <Mail size={16} aria-hidden /> Contact Me
            </a>
          </div>

          {socialLinks.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Social profiles">
              {socialLinks.map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={link.label}
                    title={link.label}
                    className="grid size-10 place-items-center rounded-xl border border-border bg-card/60 text-muted transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-text"
                  >
                    <SocialIcon platform={link.platform} size={17} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kept small on phones so the name and buttons still fit on the first screen. */}
        <div className="hero-rise order-1 mx-auto w-full max-w-[220px] [animation-delay:120ms] sm:max-w-[340px] lg:order-2 lg:max-w-[420px]">
          <div className="relative aspect-square">
            <HeroVisual />
            <div className="absolute inset-[18%] overflow-hidden rounded-full border border-border bg-card shadow-[0_30px_80px_-30px_rgb(var(--primary-rgb)/0.6)] ring-8 ring-bg/60">
              {profile.photo ? (
                <Image
                  src={profile.photo.url}
                  alt={`Photo of ${profile.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 270px, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center bg-gradient-to-br from-primary/25 to-secondary/25">
                  <span className="font-display text-6xl font-bold text-text/80">{initials}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
