'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

/**
 * Section a cross-page link asked for. Read (and cleared) by the navbar's section tracker
 * once the home page is showing.
 */
let pendingSection: string | null = null;

export function takePendingSection(): string | null {
  const id = pendingSection;
  pendingSection = null;
  return id;
}

/**
 * Link to a home-page section ("/#id") that works from every page.
 *
 * On the home page the browser scrolls natively. From other pages, it navigates to "/"
 * through the router and scrolls once the section has rendered. Passing the hash to the
 * router directly can make it fall back to a full reload that drops the hash when the
 * home page hasn't been prefetched yet. The real href stays on the element, so
 * ctrl/middle-click and no-JS still work.
 */
export function SectionLink({ section, onClick, ...props }: Omit<ComponentProps<'a'>, 'href'> & { section: string }) {
  const router = useRouter();
  const href = `/#${section}`;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.location.pathname === '/') return; // same page: native hash scroll
    e.preventDefault();
    pendingSection = section;
    router.push('/', { scroll: false });
  }

  return <Link href={href} {...props} onClick={handleClick} />;
}
