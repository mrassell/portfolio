'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { hackathons, type Hackathon } from '@/app/data/hackathons';
import { projects } from '@/app/data/experience';
import MonogramTile from './MonogramTile';

const ease = [0.22, 1, 0.36, 1] as const;

const hackathonTiles: Record<string, { mark: string; tint: [string, string] }> = {
  lockdown: { mark: 'L', tint: ['#ece9e3', '#141413'] },
  'raise-the-bar': { mark: 'R', tint: ['#ebe5fa', '#57068c'] },
  'grazing-goat': { mark: 'GG', tint: ['#dff2e8', '#3f8f6c'] },
  'paw-and-order': { mark: 'P', tint: ['#fbf0d6', '#a8771f'] },
  'story-generation': { mark: 'S', tint: ['#e3ebfa', '#2f5b9a'] },
};

const reveal = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease, delay: Math.min(index, 4) * 0.04 },
});

function HackathonRow({ h, index }: { h: Hackathon; index: number }) {
  const tile = hackathonTiles[h.id] ?? { mark: h.name[0], tint: ['#ece9e3', '#57534e'] as [string, string] };
  const writeUp = `/projects#${h.id}`;
  // Some event names already carry the year
  const event = h.event.includes(h.year) ? h.event : `${h.event} · ${h.year}`;
  return (
    <motion.li {...reveal(index)} className="flex gap-4 border-b border-stone-300 py-5">
      <MonogramTile mark={tile.mark} tint={tile.tint} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">
          <Link href={writeUp} className="transition-colors hover:text-accent">
            {h.name}
          </Link>
        </h3>
        <p className="text-sm font-medium text-accent">{h.award}</p>
        <p className="text-sm text-stone-500">{event}</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{h.tagline}</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          {h.image && (
            <Link
              href={writeUp}
              className="block w-36 overflow-hidden rounded-lg ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <img src={h.image.src} alt={h.image.alt} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            </Link>
          )}
          <Link href={writeUp} className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent">
            <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-accent">Read the write-up</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </motion.li>
  );
}

export default function ProjectList() {
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-8">
        <p className="mb-4 text-sm text-stone-400">Hackathons</p>
        <ul className="border-t border-ink">
          {hackathons.map((h, i) => (
            <HackathonRow key={h.id} h={h} index={i} />
          ))}
        </ul>
      </div>
      <div className="lg:col-span-4">
        <p className="mb-4 text-sm text-stone-400">Side projects</p>
        <ul className="border-t border-ink">
          {projects.map((p, i) => (
            <motion.li key={p.name} {...reveal(i)} className="flex gap-4 border-b border-stone-300 py-5">
              <MonogramTile mark={p.mark} tint={p.tint} />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{p.name}</h3>
                <p className="text-sm text-stone-500">{p.kind}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.short}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
