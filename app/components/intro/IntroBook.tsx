'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { INTRO_SEEN_CLASS, INTRO_SEEN_KEY } from './constants';
import { introIcons } from './objects';

const EXIT_AT = 4000; // ms after start when the reveal begins
const EXIT_DURATION = 900;
const ease = [0.22, 1, 0.36, 1] as const;
const inOut = [0.65, 0, 0.35, 1] as const;
const coverColor = '#ef8a6f';

type Phase = 'idle' | 'play' | 'exit' | 'done';

interface Layout {
  pageW: number;
  pageH: number;
  objSize: number;
  ax: number;
  ay: number;
  stage: number;
  /** Tall screens have spare room below the book, so the lower objects drop further. */
  lowerSpread: number;
}

// Where each icon lands, as fractions of the available half-width / half-height, and its resting tilt
const landing = [
  { tx: -0.8, ty: -0.5, tilt: -8 },
  { tx: -0.34, ty: -0.84, tilt: 5 },
  { tx: 0.32, ty: -0.86, tilt: -5 },
  { tx: 0.8, ty: -0.52, tilt: 7 },
  { tx: -0.84, ty: 0.36, tilt: 6 },
  { tx: 0.84, ty: 0.3, tilt: -6 },
];

const bubbles = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + (i % 3) * 0.3;
  const icon = introIcons[i % introIcons.length];
  return { angle, dist: 0.4 + ((i * 37) % 10) / 25, size: 6 + (i % 3) * 3, color: icon.tone };
});

function measure(): Layout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const min = Math.min(w, h);
  const pageW = Math.round(Math.min(180, Math.max(104, min * 0.3)));
  const objSize = Math.round(Math.min(112, Math.max(64, min * 0.13)));
  return {
    pageW,
    pageH: Math.round(pageW * 1.36),
    objSize,
    ax: Math.min(w, h * 1.5) / 2 - objSize * 0.6,
    ay: h / 2 - objSize * 0.6,
    stage: min,
    lowerSpread: h > w * 1.2 ? 1.7 : 1,
  };
}

function PageLines() {
  const widths = [78, 92, 64, 88, 70, 52];
  return (
    <div className="absolute inset-x-[16%] top-[18%] space-y-[10%]">
      {widths.map((w, i) => (
        <div key={i} className="h-1 rounded-full bg-[#ece5d8]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export default function IntroBook({ onReveal }: { onReveal: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [layout, setLayout] = useState<Layout | null>(null);
  const timers = useRef<number[]>([]);
  const revealed = useRef(false);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    onRevealRef.current();
  }, []);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {}
    document.documentElement.style.overflow = '';
    document.documentElement.classList.add(INTRO_SEEN_CLASS);
    setPhase('done');
  }, []);

  const startExit = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase('exit');
    reveal();
    timers.current = [window.setTimeout(finish, EXIT_DURATION)];
  }, [finish, reveal]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
    } catch {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      setPhase('done');
      reveal();
      return;
    }

    setLayout(measure());
    setPhase('play');
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    timers.current = [window.setTimeout(startExit, EXIT_AT)];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') startExit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [reveal, startExit]);

  if (phase === 'done') return null;

  const exiting = phase === 'exit';

  const pageStyle = (w: number, h: number) => ({ left: 0, top: 6, width: w - 8, height: h - 12 });

  return (
    <motion.div
      className={`intro-overlay fixed inset-0 z-[100] overflow-hidden bg-paper ${phase === 'idle' ? '' : 'intro-live'}`}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease: 'easeInOut' }}
      onClick={startExit}
    >
      {layout && (
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {/* Soft glow behind the book */}
          {[
            { color: '#fbd3c2', size: 1.1, x: -0.12, y: -0.1, delay: 1.0 },
            { color: '#e3dcfa', size: 0.95, x: 0.14, y: -0.02, delay: 1.15 },
            { color: '#fdeccd', size: 0.8, x: 0, y: -0.2, delay: 1.3 },
          ].map((g, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                width: layout.stage * g.size,
                height: layout.stage * g.size,
                left: -layout.stage * g.size * 0.5 + layout.stage * g.x,
                top: -layout.stage * g.size * 0.5 + layout.stage * g.y,
                background: g.color,
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={exiting ? { opacity: 0, scale: 1.2 } : { opacity: 0.9, scale: 1 }}
              transition={exiting ? { duration: 0.8 } : { delay: g.delay, duration: 1.6, ease }}
            />
          ))}

          {/* The book. The wrapper spans both pages with the spine at its centre. */}
          <motion.div
            className="absolute"
            style={{
              width: layout.pageW * 2,
              height: layout.pageH,
              left: -layout.pageW,
              top: -layout.pageH / 2,
              perspective: 1400,
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9, x: -layout.pageW / 2 }}
            animate={exiting ? { opacity: 1, y: 16, scale: 0.94, x: 0 } : { opacity: 1, y: 0, scale: 1, x: 0 }}
            transition={
              exiting
                ? { duration: 0.8, ease }
                : { default: { type: 'spring', stiffness: 90, damping: 16 }, x: { delay: 0.75, duration: 1.2, ease: inOut } }
            }
          >
            {/* Contact shadow widens as the book opens */}
            <motion.div
              className="absolute rounded-full bg-[#b9a88f]/30 blur-xl"
              style={{ left: 0, width: layout.pageW * 2, height: layout.pageH * 0.16, top: layout.pageH * 0.92 }}
              initial={{ scaleX: 0.5, x: layout.pageW / 2 }}
              animate={{ scaleX: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 1.2, ease: inOut }}
            />

            <div
              className="absolute top-0 h-full"
              style={{ left: layout.pageW, width: layout.pageW, transformStyle: 'preserve-3d', transform: 'rotateX(18deg)' }}
            >
              {/* Right-hand page block */}
              <div
                className="absolute rounded-r-2xl"
                style={{
                  ...pageStyle(layout.pageW, layout.pageH),
                  background: 'linear-gradient(to right, #efe8da 0%, #fffdf8 16%, #fffdf8 100%)',
                  boxShadow: '3px 3px 0 #f1ebdf, 6px 6px 0 #e8e0d0',
                }}
              >
                <PageLines />
              </div>

              {/* Flipping pages: the last one only lifts, the rest settle on the left */}
              {[-174, -168, -162, -16].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ ...pageStyle(layout.pageW, layout.pageH), transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: i === 3 ? [0, -50, angle] : angle }}
                  transition={{ delay: 1.0 + i * 0.16, duration: i === 3 ? 1.5 : 1.2, ease: inOut }}
                >
                  <div
                    className="absolute inset-0 rounded-r-2xl"
                    style={{
                      transform: `translateZ(${3 - i * 0.5}px)`,
                      background: 'linear-gradient(to right, #f1eadd 0%, #fffefa 18%, #fffefa 100%)',
                    }}
                  >
                    <PageLines />
                  </div>
                </motion.div>
              ))}

              {/* Front cover */}
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -170 }}
                transition={{ delay: 0.75, duration: 1.3, ease: inOut }}
              >
                <div className="absolute inset-0" style={{ transform: 'translateZ(4px)', transformStyle: 'preserve-3d' }}>
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-r-3xl rounded-l-lg text-[#fff7f2]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: `linear-gradient(145deg, #f49b82 0%, ${coverColor} 55%, #e67a5e 100%)`,
                      boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)',
                    }}
                  >
                    <span
                      className="font-semibold leading-none tracking-tight"
                      style={{ fontSize: layout.pageW * 0.3 }}
                    >
                      MR
                    </span>
                    <span className="h-1.5 w-8 rounded-full bg-[#fff7f2]/70" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-l-3xl rounded-r-lg"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'linear-gradient(to right, #f3c9b8 0%, #f9dfd3 20%, #f9dfd3 100%)',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Soft bubbles */}
          {bubbles.map((b, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{ width: b.size, height: b.size, left: -b.size / 2, top: -b.size / 2, background: b.color }}
              initial={{ opacity: 0, x: 0, y: -layout.pageH * 0.15, scale: 0.3 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: Math.cos(b.angle) * b.dist * layout.ax,
                y: Math.sin(b.angle) * b.dist * layout.ay * 0.8 - layout.pageH * 0.2,
                scale: 1,
              }}
              transition={{ delay: 1.45 + (i % 4) * 0.08, duration: 2, ease }}
            />
          ))}

          {/* Icons floating up out of the pages */}
          {introIcons.map(({ name, tile, tone, Glyph }, i) => {
            const { tx, ty, tilt } = landing[i];
            const x = tx * layout.ax;
            const y = ty * layout.ay * (ty > 0 ? layout.lowerSpread : 1);
            const delay = 1.5 + i * 0.1;
            return (
              <motion.div
                key={name}
                className="absolute"
                style={{ width: layout.objSize, height: layout.objSize, left: -layout.objSize / 2, top: -layout.objSize / 2 }}
                initial={{ opacity: 0, x: 0, y: -layout.pageH * 0.15, scale: 0.3, rotate: 0 }}
                animate={
                  exiting
                    ? { opacity: 0, x: x * 1.15, y: y * 1.15, scale: 0.9, rotate: tilt }
                    : { opacity: 1, x, y, scale: 1, rotate: tilt }
                }
                transition={
                  exiting
                    ? { duration: 0.7, ease }
                    : {
                        default: { type: 'spring', stiffness: 70, damping: 11, mass: 0.9, delay },
                        opacity: { duration: 0.4, delay },
                      }
                }
              >
                <div
                  className="intro-float flex h-full w-full items-center justify-center rounded-[30%]"
                  style={{
                    animationDelay: `${delay + 1.2 + i * 0.25}s`,
                    background: tile,
                    boxShadow: `0 14px 28px -12px ${tone}99, inset 0 2px 0 rgba(255,255,255,0.8)`,
                  }}
                >
                  <div className="h-[62%] w-[62%]">
                    <Glyph tone={tone} tile={tile} />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Caption */}
          <motion.p
            className="absolute w-64 text-center text-xs font-medium uppercase tracking-[0.3em] text-stone-400"
            style={{ left: -128, top: layout.pageH / 2 + layout.pageH * 0.3 }}
            initial={{ opacity: 0, y: 8 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1, y: 0 }}
            transition={{ delay: exiting ? 0 : 0.3, duration: 0.8, ease }}
          >
            Maheen Rassell
          </motion.p>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          startExit();
        }}
        className="absolute bottom-6 right-6 rounded-full px-4 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
      >
        Skip intro
      </button>
    </motion.div>
  );
}
