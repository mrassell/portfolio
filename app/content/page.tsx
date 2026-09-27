import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import { socialLinks, youtubeChannel } from '@/app/data/links';

export const metadata: Metadata = {
  title: 'Content - Maheen Rassell',
  description: 'Videos by Maheen Rassell on YouTube and TikTok, with 1M+ impressions.',
};

const channels = [socialLinks.youtube, socialLinks.tiktok];

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
          <p className="mb-4 text-sm text-stone-500">Content</p>
          <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            <span className="text-accent">1M+</span> impressions
            <br />
            and counting.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
            I make videos on YouTube and TikTok. Come say hi.
          </p>
        </section>


        {/* YouTube channel card */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-20 lg:px-8">
          <a
            href={socialLinks.youtube.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-3xl flex-col gap-6 rounded-3xl bg-ink p-6 text-paper shadow-[0_30px_60px_-30px_rgba(20,20,19,0.6)] transition-transform duration-500 hover:-translate-y-1 sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#ef8a6f] text-3xl font-semibold tracking-tight text-[#fff7f2] sm:h-28 sm:w-28">
              MR
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-3xl font-semibold tracking-tight sm:text-4xl">{youtubeChannel.name}</span>
              <span className="mt-2 block text-stone-400">
                <span className="font-medium text-paper">{socialLinks.youtube.handle}</span> · {youtubeChannel.subscribers} ·{' '}
                {youtubeChannel.videos}
              </span>
              <span className="mt-2 block text-stone-400">{youtubeChannel.bio}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors group-hover:bg-accent group-hover:text-paper sm:self-center">
              Watch on YouTube <span aria-hidden>↗</span>
            </span>
          </a>
        </section>

        <ul className="border-t border-ink">
          {channels.map((c, i) => (
            <li key={c.label} className="border-b border-stone-300">
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden">
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                />
                <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
                  <div>
                    <p className="mb-3 text-sm tabular-nums text-stone-400">({String(i + 1).padStart(2, '0')})</p>
                    <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight transition-colors duration-500 group-hover:text-paper md:text-8xl">
                      {c.label}
                    </h2>
                    <p className="mt-3 text-lg text-stone-500 transition-colors duration-500 group-hover:text-stone-300">
                      {c.handle}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-5xl text-accent transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 md:text-8xl"
                  >
                    ↗
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
