import { SocialIcon } from '@/components/ui/Icon';
import type { SiteData } from '@/lib/types';
import { NAV_LINKS } from '@/lib/nav';

export function Footer({ site }: { site: SiteData }) {
  const { profile, socialLinks } = site;
  const year = new Date(site.updatedAt).getUTCFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-display font-semibold text-text">{profile.name}</p>
          <p className="mt-1 text-sm text-muted">{profile.title}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a href={`/#${link.id}`} className="transition-colors hover:text-text">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex gap-2">
          {socialLinks.map((link) => (
            <li key={link._id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={link.label}
                className="grid size-9 place-items-center rounded-xl border border-border text-muted transition-colors hover:border-primary/50 hover:text-text"
              >
                <SocialIcon platform={link.platform} size={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-border py-6 text-center font-mono text-xs text-muted">
        © {year} {profile.name}. Built with Next.js, Express and MongoDB.
      </p>
    </footer>
  );
}
