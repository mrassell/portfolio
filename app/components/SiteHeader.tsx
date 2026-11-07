import Link from 'next/link';
import { contactLinks } from '@/app/data/links';

// Sections are picked on the home page itself, under the hero; the bar only carries the name and contact links
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6 md:py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
          Maheen Rassell
        </Link>
        <div className="flex items-center gap-x-3.5 text-[13px] sm:gap-x-5 sm:text-sm">
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
      </div>
    </header>
  );
}
