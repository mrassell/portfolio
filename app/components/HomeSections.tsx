'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import VideoWall from './VideoWall';
import ChannelCard from './ChannelCard';
import RoleList from './RoleList';
import ProjectList from './ProjectList';
import { experience, leadership } from '@/app/data/experience';
import { homeSections, sectionFromHash, type HomeSectionId } from '@/app/data/sections';

function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  // The big section name above already labels the panel, so the heading here is for screen readers only
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
      <h2 className="sr-only">{title}</h2>
      {aside && <div className="mb-6 flex justify-end">{aside}</div>}
      {children}
    </div>
  );
}

function SectionBody({ id }: { id: HomeSectionId }) {
  switch (id) {
    case 'content':
      return (
        <>
          <VideoWall headingLevel="h2" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <ChannelCard />
          </div>
        </>
      );
    case 'experience':
      return (
        <Panel title="Experience">
          <div className="mx-auto max-w-4xl">
            <RoleList roles={experience} />
          </div>
        </Panel>
      );
    case 'leadership':
      return (
        <Panel title="Leadership">
          <div className="mx-auto max-w-4xl">
            <RoleList roles={leadership} />
          </div>
        </Panel>
      );
    case 'projects':
      return (
        <Panel
          title="Projects"
          aside={
            <Link href="/projects" className="group inline-flex items-center gap-1.5 text-sm font-medium">
              <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
                Full write-ups
              </span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          }
        >
          <ProjectList />
        </Panel>
      );
  }
}

/**
 * The area under the hero: four large section names (Content, Experience,
 * Leadership, Projects) and, right below them, the one that is picked. The pick
 * is kept in the URL hash, so /#leadership links and back/forward work.
 */
export default function HomeSections() {
  const [active, setActive] = useState<HomeSectionId>(homeSections[0].id);
  const switcher = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = (scroll: boolean) => {
      const id = sectionFromHash(window.location.hash);
      if (!id) return;
      setActive(id);
      // Arriving from a link elsewhere: bring the section names and the panel into view
      if (scroll) requestAnimationFrame(() => switcher.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    fromHash(true);
    const onHash = () => fromHash(false);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Clicking shows the section right underneath, so there is nothing to scroll to
  const pick = (id: HomeSectionId) => {
    setActive(id);
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  };

  // Arrow keys move between the names, as in any tab list
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = homeSections.findIndex((s) => s.id === active);
    const next = homeSections[(i + (e.key === 'ArrowRight' ? 1 : homeSections.length - 1)) % homeSections.length];
    pick(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section aria-label="Sections">
      <div ref={switcher} className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-10 pt-14 sm:px-6 md:pb-14 md:pt-20 lg:scroll-mt-16 lg:px-8">
        <div
          role="tablist"
          aria-label="Sections"
          onKeyDown={onKeyDown}
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:gap-x-12"
        >
          {homeSections.map((s) => {
            const selected = s.id === active;
            return (
              <button
                key={s.id}
                id={`tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="section-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => pick(s.id)}
                className={cn(
                  'relative pb-2 text-2xl font-semibold tracking-tight transition-colors sm:text-3xl md:text-4xl',
                  selected ? 'text-ink' : 'text-stone-400 hover:text-ink',
                )}
              >
                {s.label}
                {selected && (
                  <motion.span
                    layoutId="section-underline"
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div id="section-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionBody id={active} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
