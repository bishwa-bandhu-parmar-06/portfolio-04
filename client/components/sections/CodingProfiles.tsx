import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { Card, Section, SectionHeading } from '@/components/ui/primitives';
import type { CodingProfile, SectionCopy } from '@/lib/types';

const PLATFORM: Record<CodingProfile['platform'], { name: string; icon: string }> = {
  leetcode: { name: 'LeetCode', icon: 'leetcode' },
  geeksforgeeks: { name: 'GeeksforGeeks', icon: 'geeksforgeeks' },
  codeforces: { name: 'Codeforces', icon: 'codeforces' },
  codechef: { name: 'CodeChef', icon: 'codechef' },
  hackerrank: { name: 'HackerRank', icon: 'hackerrank' },
  other: { name: 'Profile', icon: 'lucide:code-2' },
};

const DIFFICULTY = [
  { key: 'easy', label: 'Easy', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
  { key: 'medium', label: 'Medium', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' },
  { key: 'hard', label: 'Hard', text: 'text-rose-700 dark:text-rose-400', bar: 'bg-rose-500' },
] as const;

export function CodingProfiles({ profiles, copy }: { profiles: CodingProfile[]; copy: SectionCopy }) {
  if (profiles.length === 0) return null;
  const total = profiles.reduce((sum, p) => sum + p.totalSolved, 0);

  return (
    <Section id="coding">
      <SectionHeading
        id="coding"
        {...copy}
        // "{total}" in the admin-edited title is replaced with the live sum across profiles.
        title={copy.title.replaceAll('{total}', total.toLocaleString('en-US'))}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {profiles.map((profile, i) => {
          const meta = PLATFORM[profile.platform];
          const breakdown = DIFFICULTY.map((d) => ({ ...d, value: profile.breakdown?.[d.key] ?? null })).filter(
            (d) => d.value !== null,
          ) as ((typeof DIFFICULTY)[number] & { value: number })[];
          const breakdownTotal = breakdown.reduce((s, d) => s + d.value, 0);

          return (
            <Reveal key={profile._id} delay={i * 0.08}>
              <Card className="group relative h-full p-6 hover:border-primary/40 hover:shadow-glow sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-border bg-bg/60 text-text">
                      <Icon name={meta.icon} size={20} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-text">
                        <a href={profile.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
                          {meta.name}
                        </a>
                      </h3>
                      <p className="font-mono text-xs text-muted">@{profile.username}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-muted transition-colors group-hover:text-text" aria-hidden />
                </div>

                <p className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-text">{profile.totalSolved.toLocaleString('en-US')}+</span>
                  <span className="text-sm text-muted">problems solved</span>
                </p>

                {breakdownTotal > 0 && (
                  <div className="mt-5">
                    <div className="flex h-2 overflow-hidden rounded-full bg-border" aria-hidden>
                      {breakdown.map((d) => (
                        <span key={d.key} className={d.bar} style={{ width: `${(d.value / breakdownTotal) * 100}%` }} />
                      ))}
                    </div>
                    <dl className="mt-3 flex gap-5 text-sm">
                      {breakdown.map((d) => (
                        <div key={d.key} className="flex gap-1.5">
                          <dt className="text-muted">{d.label}</dt>
                          <dd className={`font-semibold ${d.text}`}>{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {profile.highlights.length > 0 && (
                  <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-3">
                    {profile.highlights.map((h) => (
                      <div key={h.label}>
                        <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{h.label}</dt>
                        <dd className="mt-1 font-semibold text-text">{h.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
