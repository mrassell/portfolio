import Link from 'next/link';
import { contactLinks } from '@/app/data/links';

const pages = [
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Learning Design', href: '/learning-design' },
  { label: 'Content', href: '/content' },
  { label: 'Explore', href: '/explore' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6 md:py-4 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
          Maheen Rassell
        </Link>

        {/* Social links sit beside the name on small screens and after the page links on large ones */}
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

        <nav className="flex w-full flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-stone-500 sm:gap-x-5 sm:text-sm lg:ml-auto lg:w-auto lg:gap-x-7 lg:border-r lg:border-stone-300 lg:pr-7">
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className="whitespace-nowrap transition-colors hover:text-ink">
              {p.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
