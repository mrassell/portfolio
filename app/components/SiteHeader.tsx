'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { contactLinks } from '@/app/data/links';
import { homeSections, sectionFromHash, type HomeSectionId } from '@/app/data/sections';

// Standalone pages that mirror a home section, so its nav item reads as current there too
const pageSection: Record<string, HomeSectionId> = { '/content': 'content', '/projects': 'projects' };

export default function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [hashSection, setHashSection] = useState<HomeSectionId | null>(null);

  useEffect(() => {
    const sync = () => setHashSection(sectionFromHash(window.location.hash));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const current = onHome ? (hashSection ?? homeSections[0].id) : pageSection[pathname];

  // On the home page, switch sections in place; elsewhere the link opens the home page at that section
  const open = (id: HomeSectionId) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) return;
    e.preventDefault();
    // Re-clicking the current section just scrolls back to it, without a duplicate history entry
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6 md:py-4 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
          Maheen Rassell
        </Link>

        {/* Social links sit beside the name on small screens and after the section links on large ones */}
        <div className="flex items-center gap-x-3.5 text-[13px] sm:gap-x-5 sm:text-sm lg:order-last">
          {contactLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="font-medium text-ink transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </div>

        <nav className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-[13px] sm:gap-x-5 sm:text-sm lg:ml-auto lg:w-auto lg:gap-x-7 lg:border-r lg:border-stone-300 lg:pr-7">
          {homeSections.map((s) => {
            const isCurrent = s.id === current;
            return (
              <a
                key={s.id}
                href={`/#${s.id}`}
                onClick={open(s.id)}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'relative whitespace-nowrap py-1 transition-colors',
                  isCurrent ? 'font-medium text-ink' : 'text-stone-500 hover:text-ink',
                )}
              >
                {s.label}
                {isCurrent && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
