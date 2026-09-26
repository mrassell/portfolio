import { contactLinks, socialLinks } from '@/app/data/links';

const footerLinks = [...contactLinks.slice(1), socialLinks.youtube, socialLinks.tiktok];

export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <p className="text-sm text-stone-400">Say hello</p>
        <a
          href="mailto:maheenrassell@gse.harvard.edu"
          className="mt-3 inline-block break-all text-2xl font-semibold tracking-tight transition-colors hover:text-accent sm:text-4xl md:text-5xl"
        >
          maheenrassell@gse.harvard.edu
        </a>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {l.label}
              </a>
            ))}
          </div>
          <span>© {new Date().getFullYear()} Maheen Rassell</span>
        </div>
      </div>
    </footer>
  );
}
