'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { MotionConfig, motion } from 'motion/react';
import DancingLetters from '@/components/ui/dancing-letters';
import ExperienceIndex from '@/app/components/ExperienceIndex';
import { entries, projects } from '@/app/data/experience';

const ease = [0.22, 1, 0.36, 1] as const;

const facts: { lead: ReactNode; detail: string }[] = [
  { lead: <span className="text-crimson">Harvard grad student</span>, detail: 'in EdTech' },
  { lead: <span className="text-nyu-violet">NYU CS + Data Science</span>, detail: 'finished in 3 years' },
  { lead: <>Content creator, <span className="text-accent">1M+</span></>, detail: 'impressions and counting' },
];

const links = [
  { label: 'Email', href: 'mailto:maheenrassell@gse.harvard.edu' },
  { label: 'GitHub', href: 'https://github.com/mrassell' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mrassell/' },
];

// Unique orgs, in index order, for the ticker
const orgs = Array.from(new Set(entries.map((e) => e.org)));

function SectionHeading({ index, title, aside }: { index: string; title: string; aside?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease }}
      className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14"
    >
      <div>
        <p className="mb-3 text-sm tabular-nums text-stone-400">({index})</p>
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-6xl">{title}</h2>
      </div>
      {aside}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-paper">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-stone-300/70 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
              Maheen Rassell
            </Link>
            <nav className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-stone-500 sm:gap-x-5 sm:text-sm md:gap-x-7">
              <a href="#experience" className="hidden transition-colors hover:text-ink lg:inline">Experience</a>
              <Link href="/learning-design" className="transition-colors hover:text-ink">Learning Design</Link>
              <Link href="/explore" className="transition-colors hover:text-ink">Explore</Link>
              <span className="hidden h-4 w-px bg-stone-300 sm:block" aria-hidden />
              {links.map((l) => (
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
            </nav>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
            <p className="mb-6 text-center text-sm text-stone-500">Engineer &amp; learning designer — Cambridge, MA</p>

            <h1 className="sr-only">Maheen Rassell</h1>
            <div aria-hidden>
              {['Maheen', 'Rassell.'].map((word) => (
                <DancingLetters
                  key={word}
                  text={word}
                  className="justify-center"
                  letterClassName="text-[24vw] font-semibold leading-[0.88] tracking-tighter text-ink dark:text-ink sm:text-[20vw] lg:text-[11rem] xl:text-[14rem]"
                />
              ))}
            </div>
            <p className="mt-4 hidden text-center text-sm text-stone-400 md:block">(hover the letters)</p>

            <ol className="mt-14 grid border-t border-ink md:mt-20 md:grid-cols-3">
              {facts.map((fact, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.5 + i * 0.1 }}
                  className="border-b border-stone-300 py-5 md:border-b-0 md:border-r md:px-6 md:py-6 md:first:pl-0 md:last:border-r-0"
                >
                  <span className="text-xs tabular-nums text-stone-400">0{i + 1}</span>
                  <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight md:text-[1.65rem]">
                    {fact.lead}
                  </p>
                  <p className="mt-1 text-stone-500">{fact.detail}</p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.85 }}
              className="mt-14 grid gap-6 md:mt-20 md:grid-cols-12"
            >
              <p className="text-sm text-stone-400 md:col-span-3">In short</p>
              <div className="md:col-span-9">
                <p className="text-xl leading-snug tracking-tight text-stone-600 md:text-3xl md:leading-snug">
                  <span className="text-ink">I build agentic workflows and learning tools</span> for the students who
                  go quiet when they feel behind. Right now I&apos;m a research engineer at Harvard&apos;s Graduate
                  School of Education, a backend developer for the Human Flourishing Program, and a software engineer
                  on Zencube&apos;s mental health device. Along the way:{' '}
                  <span className="text-ink">1st at Brown&apos;s 2025 hackathon</span> and{' '}
                  <span className="text-ink">top 5 at NVIDIA x Vercel</span>.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group inline-flex items-center gap-1.5"
                    >
                      <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
                        {l.label}
                      </span>
                      <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Org ticker */}
          <div className="overflow-hidden border-y border-stone-300 py-4" aria-hidden>
            <div className="flex w-max animate-marquee">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center">
                  {orgs.map((org) => (
                    <li key={org} className="flex items-center whitespace-nowrap text-lg font-medium tracking-tight text-stone-400 md:text-xl">
                      <span className="px-6">{org}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Experience & leadership */}
          <section id="experience" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <SectionHeading
              index="01"
              title="Experience & leadership"
              aside={
                <p className="max-w-xs text-sm text-stone-500">
                  Every role, club and hackathon. Filter, then hover a row (or tap it) for the details.
                </p>
              }
            />
            <ExperienceIndex />
          </section>

          {/* Projects */}
          <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
            <SectionHeading index="02" title="Side projects" />
            <ul className="grid border-t border-ink md:grid-cols-2">
              {projects.map((p, i) => (
                <motion.li
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease, delay: (i % 2) * 0.08 }}
                  className="group border-b border-stone-300 py-7 md:odd:border-r md:odd:pr-10 md:even:pl-10"
                >
                  <div className="mb-3 flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                      {p.name}
                    </h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-400">{p.kind}</span>
                  </div>
                  <p className="leading-relaxed text-stone-600">{p.summary}</p>
                </motion.li>
              ))}
            </ul>
          </section>

          {/* Learning design */}
          <section className="border-t border-stone-300">
            <Link href="/learning-design" className="group relative block overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
              />
              <div className="relative mx-auto max-w-7xl px-4 py-16 transition-colors duration-500 sm:px-6 md:py-24 lg:px-8">
                <p className="mb-4 text-sm tabular-nums text-stone-400">(03)</p>
                <div className="flex items-end justify-between gap-6">
                  <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight text-ink transition-colors duration-500 group-hover:text-paper md:text-8xl">
                    Learning design
                  </h2>
                  <span
                    aria-hidden
                    className="text-5xl text-accent transition-transform duration-500 group-hover:translate-x-2 md:text-8xl"
                  >
                    →
                  </span>
                </div>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 transition-colors duration-500 group-hover:text-stone-300">
                  Case studies on the students who disengage quietly: feedback loops, psychological safety, and practice
                  environments that make revision feel normal.
                </p>
              </div>
            </Link>
          </section>
        </main>

        {/* Footer */}
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
              <div className="flex gap-6">
                {links.slice(1).map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                    {l.label}
                  </a>
                ))}
              </div>
              <span>© {new Date().getFullYear()} Maheen Rassell</span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
