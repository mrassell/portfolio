'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { categoryLabels, entries, type Entry } from '@/app/data/experience';

type Filter = 'all' | 'now' | Entry['category'];

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'now', label: 'Now' },
  { id: 'work', label: 'Work' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'hackathon', label: 'Hackathons' },
];

function matches(entry: Entry, filter: Filter) {
  if (filter === 'all') return true;
  if (filter === 'now') return Boolean(entry.current);
  return entry.category === filter;
}

function Details({ entry }: { entry: Entry }) {
  return (
    <div className="space-y-5">
      {entry.stat && (
        <div className="flex items-baseline gap-4 border-b border-stone-300 pb-5">
          <span className="text-5xl font-semibold tracking-tight text-accent tabular-nums md:text-6xl">
            {entry.stat.value}
          </span>
          <span className="max-w-[16rem] text-sm leading-snug text-stone-500">{entry.stat.label}</span>
        </div>
      )}
      <p className="text-base leading-relaxed text-stone-700">{entry.summary}</p>
      {entry.href && (
        <Link href={entry.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent">
          <span className="border-b border-ink/30 pb-0.5">Read the full write-up</span>
          <span aria-hidden>→</span>
        </Link>
      )}
      {entry.stack && (
        <ul className="flex flex-wrap gap-2">
          {entry.stack.map((tool) => (
            <li key={tool} className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600">
              {tool}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ExperienceIndex() {
  const [filter, setFilter] = useState<Filter>('all');
  const [activeId, setActiveId] = useState(entries[0].id);
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => entries.filter((e) => matches(e, filter)), [filter]);
  const active = visible.find((e) => e.id === activeId) ?? visible[0];
  const activeIndex = entries.indexOf(active);

  const selectFilter = (next: Filter) => {
    setFilter(next);
    setOpenId(null);
    const first = entries.find((e) => matches(e, next));
    if (first) setActiveId(first.id);
  };

  return (
    <div>
      {/* Filters */}
      <div role="tablist" aria-label="Filter experience" className="-mx-1 mb-8 flex flex-wrap gap-x-1 gap-y-2">
        {filters.map((f) => {
          const count = entries.filter((e) => matches(e, f.id)).length;
          const selected = filter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={selected}
              onClick={() => selectFilter(f.id)}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selected ? 'text-paper' : 'text-stone-500 hover:text-stone-900',
              )}
            >
              {selected && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">
                {f.label}
                <sup className="ml-1 text-[0.65em] tabular-nums opacity-60">{count}</sup>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Index list */}
        <ul className="group/list border-t border-ink">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((entry) => {
              const isActive = entry.id === active.id;
              const isOpen = entry.id === openId;
              return (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  className="border-b border-stone-300"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onMouseEnter={() => setActiveId(entry.id)}
                    onFocus={() => setActiveId(entry.id)}
                    onClick={() => {
                      setActiveId(entry.id);
                      setOpenId(isOpen ? null : entry.id);
                    }}
                    className={cn(
                      'grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-4 text-left transition-colors duration-200 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:py-5',
                      isActive ? 'text-ink' : 'text-ink lg:group-hover/list:text-stone-300',
                    )}
                  >
                    <span className="text-sm tabular-nums text-stone-400">{entry.year}</span>
                    <span className="min-w-0">
                      <span className="block text-lg font-semibold leading-tight tracking-tight md:text-2xl">
                        {entry.role}
                      </span>
                      <span className="mt-1 block text-sm text-stone-500">{entry.org}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-400">
                      {entry.current && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Current" />}
                      <span className="hidden sm:inline">{categoryLabels[entry.category]}</span>
                      <span
                        aria-hidden
                        className={cn(
                          'text-base transition-transform duration-300 lg:hidden',
                          isOpen && 'rotate-45',
                        )}
                      >
                        +
                      </span>
                    </span>
                  </button>

                  {/* Mobile / tablet: details expand inline */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="pb-6 pl-[4.25rem] md:pl-[5.5rem]">
                          {(entry.date || entry.location) && (
                            <p className="mb-4 text-sm text-stone-500">
                              {[entry.date, entry.location].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <Details entry={entry} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Desktop: sticky detail panel follows the hovered row */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-6 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-stone-400">
              <span className="tabular-nums">
                {String(activeIndex + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}
              </span>
              <span>{categoryLabels[active.category]}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-8">
                  <p className="text-sm text-stone-500">{active.org}</p>
                  <h3 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-ink">{active.role}</h3>
                  {(active.date || active.location) && (
                    <p className="mt-2 text-sm text-stone-500">
                      {[active.date, active.location].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Details entry={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
