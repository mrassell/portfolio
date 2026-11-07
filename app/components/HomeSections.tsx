'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import VideoWall from './VideoWall';
import ChannelCard from './ChannelCard';
import RoleList from './RoleList';
import ProjectList from './ProjectList';
import { experience, leadership } from '@/app/data/experience';
import { homeSections, sectionFromHash, type HomeSectionId } from '@/app/data/sections';

function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
        <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-6xl">{title}</h2>
        {aside}
      </div>
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
          <div className="max-w-4xl">
            <RoleList roles={experience} />
          </div>
        </Panel>
      );
    case 'leadership':
      return (
        <Panel title="Leadership">
          <div className="max-w-4xl">
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
 * The area under the hero. Shows one section at a time, chosen from the navbar
 * (which sets the URL hash, e.g. /#experience), and scrolls it into view.
 */
export default function HomeSections() {
  const [active, setActive] = useState<HomeSectionId>(homeSections[0].id);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const open = () => {
      const id = sectionFromHash(window.location.hash);
      if (!id) return;
      setActive(id);
      requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  const label = homeSections.find((s) => s.id === active)?.label;

  return (
    <section ref={ref} aria-label={label} className="scroll-mt-24 lg:scroll-mt-16">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionBody id={active} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
