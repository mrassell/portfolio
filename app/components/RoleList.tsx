'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { Role } from '@/app/data/experience';
import MonogramTile from './MonogramTile';

const ease = [0.22, 1, 0.36, 1] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
}

function formatMonth(ym: string) {
  const { y, m } = parseMonth(ym);
  return `${MONTHS[m - 1]} ${y}`;
}

// Counted like LinkedIn: both the first and last month are included
function formatDuration(start: string, end: { y: number; m: number }) {
  const s = parseMonth(start);
  const months = (end.y - s.y) * 12 + (end.m - s.m) + 1;
  if (months < 1) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ');
}

function useCurrentMonth() {
  // Filled in after mount so the static page and the browser agree on first render
  const [now, setNow] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const d = new Date();
    setNow({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }, []);
  return now;
}

function dateLine(role: Role, now: { y: number; m: number } | null) {
  if (!role.start) return role.dates ?? null;
  const range = `${formatMonth(role.start)} – ${role.end ? formatMonth(role.end) : 'Present'}`;
  const end = role.end ? parseMonth(role.end) : now;
  const duration = end ? formatDuration(role.start, end) : null;
  return duration ? `${range} · ${duration}` : range;
}

function RoleRow({ role, now, index }: { role: Role; now: { y: number; m: number } | null; index: number }) {
  const dates = dateLine(role, now);
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease, delay: Math.min(index, 4) * 0.04 }}
      className="flex gap-4 border-b border-stone-300 py-5"
    >
      <MonogramTile mark={role.mark} tint={role.tint} />
      <div className="min-w-0">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{role.title}</h3>
        <p className="text-sm text-stone-700">
          {role.website ? (
            <a
              href={role.website.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 transition-colors hover:text-accent"
            >
              {role.org}
              <span aria-hidden className="text-xs transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          ) : (
            role.org
          )}
          {role.type && <span className="text-stone-500"> · {role.type}</span>}
        </p>
        {dates && <p className="text-sm text-stone-500">{dates}</p>}
        {role.location && <p className="text-sm text-stone-500">{role.location}</p>}
        {role.description && <p className="mt-2 text-sm leading-relaxed text-stone-600">{role.description}</p>}
      </div>
    </motion.li>
  );
}

/** A LinkedIn-style list of roles: tile, title, company, dates with duration, location and one line. */
export default function RoleList({ roles }: { roles: Role[] }) {
  const now = useCurrentMonth();
  return (
    <ul className="border-t border-ink">
      {roles.map((role, i) => (
        <RoleRow key={`${role.title}-${role.org}`} role={role} now={now} index={i} />
      ))}
    </ul>
  );
}
