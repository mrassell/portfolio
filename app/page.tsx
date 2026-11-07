'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { MotionConfig, motion } from 'motion/react';
import DancingLetters from '@/components/ui/dancing-letters';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import IntroBook from '@/app/components/intro/IntroBook';
import HomeSections from '@/app/components/HomeSections';
import { socialLinks } from '@/app/data/links';

const ease = [0.22, 1, 0.36, 1] as const;

const facts: { lead: ReactNode; detail: ReactNode }[] = [
  { lead: <span className="text-crimson">Harvard grad student</span>, detail: 'in EdTech' },
  { lead: <span className="text-nyu-violet">NYU CS + Data Science</span>, detail: 'finished in 3 years' },
  { lead: <>Content creator, <span className="text-accent">1M+</span></>, detail: (
      <>
        impressions on{' '}
        {[socialLinks.youtube, socialLinks.tiktok].map((s, i) => (
          <span key={s.label}>
            {i > 0 && ' and '}
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-stone-300 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {s.label}
            </a>
          </span>
        ))}
      </>
    ),
  },
];

export default function HomePage() {
  // Remounting the hero when the intro lifts replays its entrance animations
  const [introRevealed, setIntroRevealed] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <IntroBook onReveal={() => setIntroRevealed(true)} />
      <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-paper">
        <SiteHeader />

        <main>
          {/* Hero */}
          <section key={introRevealed ? 'revealed' : 'initial'} className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20 lg:px-8">
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
                  <div className="mt-1 text-stone-500">{fact.detail}</div>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* Content, Experience, Leadership or Projects, picked right here */}
          <HomeSections />

          {/* Learning design */}
          <section className="border-t border-stone-300">
            <Link href="/learning-design" className="group relative block overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
              />
              <div className="relative mx-auto max-w-7xl px-4 py-16 transition-colors duration-500 sm:px-6 md:py-24 lg:px-8">
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

        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
