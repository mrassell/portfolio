'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { hackathons, type Hackathon } from '@/app/data/hackathons';
import ProjectShot from './ProjectShot';

const ease = [0.22, 1, 0.36, 1] as const;

// Soft stand-ins for projects without a screenshot yet
const fallbackTints: Record<string, [string, string]> = {
  'grazing-goat': ['#dff2e8', '#52ad85'],
  'story-generation': ['#ebe5fa', '#8d77d4'],
};

function Preview({ project }: { project: Hackathon }) {
  if (project.image) {
    return <img src={project.image.src} alt={project.image.alt} className="absolute inset-0 h-full w-full object-cover" />;
  }
  const [bg, fg] = fallbackTints[project.id] ?? ['#f3eee4', '#78716c'];
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-8" style={{ background: bg }}>
      <span className="text-sm font-semibold" style={{ color: fg }}>
        {project.awardShort}
      </span>
      <span className="mt-1 text-4xl font-semibold tracking-tight text-ink">{project.name}</span>
      <span className="mt-2 text-sm text-stone-600">{project.event}</span>
    </div>
  );
}

export default function HackathonShowcase() {
  const [activeId, setActiveId] = useState(hackathons[0].id);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const hovering = useRef(false);

  // The row crossing the middle band of the viewport drives the preview while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        if (hovering.current) return;
        const hit = items.find((e) => e.isIntersecting);
        if (hit) setActiveId((hit.target as HTMLElement).dataset.id!);
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Object.values(rowRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const active = hackathons.find((h) => h.id === activeId) ?? hackathons[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
      <ul
        className="border-t border-ink"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        {hackathons.map((h, i) => {
          const isActive = h.id === active.id;
          return (
            <motion.li
              key={h.id}
              ref={(el) => {
                rowRefs.current[h.id] = el;
              }}
              data-id={h.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease, delay: i * 0.05 }}
              className="border-b border-stone-300"
              onMouseEnter={() => setActiveId(h.id)}
            >
              <Link
                href={`/projects#${h.id}`}
                onFocus={() => setActiveId(h.id)}
                className="group grid gap-x-6 gap-y-2 py-6 md:grid-cols-[8.5rem_minmax(0,1fr)] md:items-baseline md:py-8"
              >
                <span className="text-sm font-semibold text-accent">{h.awardShort}</span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'flex items-baseline justify-between gap-4 text-2xl font-semibold tracking-tight transition-colors duration-300 md:text-3xl',
                      isActive ? 'text-ink' : 'text-ink lg:text-stone-400',
                    )}
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{h.name}</span>
                    <span aria-hidden className="text-lg text-ink transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                  <span className="mt-2 block max-w-xl leading-relaxed text-stone-600">{h.tagline}</span>
                  <span className="mt-3 block text-sm text-stone-500">
                    {h.event} · <span className="text-stone-400">{h.award}</span>
                  </span>
                  {h.image && <ProjectShot src={h.image.src} alt={h.image.alt} className="mt-6 max-w-[34rem] lg:hidden" />}
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* Desktop: sticky preview that follows the list */}
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[3/2] max-w-[34rem] overflow-hidden rounded-2xl bg-stone-200 shadow-[0_24px_48px_-24px_rgba(20,20,19,0.35)] ring-1 ring-ink/5">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease }}
              >
                <Preview project={active} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex max-w-[34rem] items-center justify-between text-sm">
            <span className="text-stone-500">{active.event}</span>
            <span className="flex gap-1.5" aria-hidden>
              {hackathons.map((h) => (
                <span
                  key={h.id}
                  className={cn('h-1.5 rounded-full transition-all duration-300', h.id === active.id ? 'w-5 bg-ink' : 'w-1.5 bg-stone-300')}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
