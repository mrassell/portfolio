'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { motion } from 'motion/react';
import { INTRO_SEEN_CLASS, INTRO_SEEN_KEY } from './constants';
import { Basketball, GradCap, Laptop, Microphone, Sneaker, VideoCamera } from './objects';


const EXIT_AT = 3700; // ms after start when the reveal begins
const EXIT_DURATION = 700;
const ease = [0.22, 1, 0.36, 1] as const;
const inOut = [0.65, 0, 0.35, 1] as const;

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

// Where each object lands, as fractions of the available half-width / half-height
const flyers: { Icon: ComponentType; tx: number; ty: number; from: number; to: number }[] = [
  { Icon: Basketball, tx: -0.8, ty: -0.5, from: -120, to: 24 },
  { Icon: Laptop, tx: -0.34, ty: -0.84, from: 20, to: -8 },
  { Icon: GradCap, tx: 0.32, ty: -0.86, from: -30, to: 12 },
  { Icon: VideoCamera, tx: 0.8, ty: -0.52, from: 40, to: -10 },
  { Icon: Sneaker, tx: -0.84, ty: 0.36, from: 60, to: -14 },
  { Icon: Microphone, tx: 0.84, ty: 0.3, from: -50, to: 16 },
];

const particleColors = ['#e4412b', '#141413', '#a51c30', '#57068c'];
const particles = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.35;
  return {
    angle,
    dist: 0.35 + ((i * 37) % 10) / 22,
    size: 5 + (i % 4) * 2,
    round: i % 2 === 0,
    color: particleColors[i % particleColors.length],
  };
});

function measure(): Layout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const min = Math.min(w, h);
  const pageW = Math.round(Math.min(180, Math.max(104, min * 0.3)));
  const objSize = Math.round(Math.min(120, Math.max(64, min * 0.14)));
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

function PageLines({ mirrored = false }: { mirrored?: boolean }) {
  const widths = [78, 92, 64, 88, 70, 90, 52];
  return (
    <div className={`absolute inset-x-[14%] top-[16%] space-y-[9%] ${mirrored ? 'flex flex-col items-end' : ''}`}>
      {widths.map((w, i) => (
        <div key={i} className="h-[3px] rounded-full bg-ink/10" style={{ width: `${w}%` }} />
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

  return (
    <motion.div
      className={`intro-overlay fixed inset-0 z-[100] overflow-hidden bg-paper ${phase === 'idle' ? '' : 'intro-live'}`}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease: 'easeInOut' }}
      onClick={startExit}
    >
      {layout && (
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {/* Light rays and glow behind the book */}
          <motion.div
            className="absolute"
            style={{
              width: layout.stage * 1.2,
              height: layout.stage * 1.2,
              left: -layout.stage * 0.6,
              top: -layout.stage * 0.6 - layout.pageH * 0.08,
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={exiting ? { opacity: 0, scale: 1.4 } : { opacity: 1, scale: 1 }}
            transition={exiting ? { duration: 0.6 } : { delay: 1.15, duration: 1.1, ease }}
          >
            <div
              className="intro-rays absolute inset-0 rounded-full"
              style={{
                background:
                  'repeating-conic-gradient(from 0deg, rgba(228,65,43,0.13) 0deg 5deg, transparent 5deg 16deg)',
                WebkitMaskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
                maskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
              }}
            />
            <div
              className="absolute inset-[22%] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,226,180,0.95) 0%, rgba(255,200,150,0.45) 35%, rgba(228,65,43,0.1) 58%, transparent 72%)',
              }}
            />
          </motion.div>

          {/* The book. The wrapper spans both pages with the spine at its centre. */}
          <motion.div
            className="absolute"
            style={{
              width: layout.pageW * 2,
              height: layout.pageH,
              left: -layout.pageW,
              top: -layout.pageH / 2,
              perspective: 1300,
            }}
            initial={{ opacity: 0, y: 40, scale: 0.88, x: -layout.pageW / 2 }}
            animate={exiting ? { opacity: 1, y: 30, scale: 0.9, x: 0 } : { opacity: 1, y: 0, scale: 1, x: 0 }}
            transition={
              exiting
                ? { duration: 0.6, ease }
                : { default: { duration: 0.7, ease }, x: { delay: 0.7, duration: 1.1, ease: inOut } }
            }
          >
            {/* Contact shadow widens as the book opens */}
            <motion.div
              className="absolute rounded-[50%] bg-ink/20 blur-md"
              style={{ left: 0, width: layout.pageW * 2, height: layout.pageH * 0.14, top: layout.pageH * 0.93 }}
              initial={{ scaleX: 0.5, x: layout.pageW / 2 }}
              animate={{ scaleX: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 1.1, ease: inOut }}
            />

            <div
              className="absolute top-0 h-full"
              style={{ left: layout.pageW, width: layout.pageW, transformStyle: 'preserve-3d', transform: 'rotateX(22deg)' }}
            >
              {/* Right-hand page block */}
              <div
                className="absolute rounded-r-[3px] border border-ink/10"
                style={{
                  left: 0,
                  top: 5,
                  width: layout.pageW - 6,
                  height: layout.pageH - 10,
                  background: 'linear-gradient(to right, #e6e0d2 0%, #fbfaf6 14%, #fbfaf6 100%)',
                  boxShadow: '2px 2px 0 #e7e0d0, 4px 4px 0 #d9d2c2',
                }}
              >
                <PageLines />
              </div>

              {/* Flipping pages: the last one only lifts, the rest settle on the left */}
              {[-174, -168, -162, -18].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: 0,
                    top: 5,
                    width: layout.pageW - 6,
                    height: layout.pageH - 10,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                  }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: i === 3 ? [0, -55, angle] : angle }}
                  transition={{ delay: 0.95 + i * 0.14, duration: i === 3 ? 1.3 : 1, ease: inOut }}
                >
                  <div
                    className="absolute inset-0 rounded-r-[3px] border border-ink/10"
                    style={{
                      transform: `translateZ(${3 - i * 0.5}px)`,
                      background: 'linear-gradient(to right, #e9e3d6 0%, #fdfcf8 16%, #fdfcf8 100%)',
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
                transition={{ delay: 0.75, duration: 1.1, ease: inOut }}
              >
                <div className="absolute inset-0" style={{ transform: 'translateZ(4px)', transformStyle: 'preserve-3d' }}>
                  <div
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-md bg-ink p-[12%] text-paper"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    <div className="absolute inset-y-0 left-0 w-[7%] bg-accent" />
                    <div className="absolute inset-[6%] left-[13%] rounded-sm border border-paper/20" />
                    <span className="relative h-3 w-3 bg-accent" />
                    <span
                      className="relative font-semibold leading-none tracking-tighter"
                      style={{ fontSize: layout.pageW * 0.34 }}
                    >
                      MR
                    </span>
                    <span className="relative text-[10px] uppercase tracking-[0.2em] text-paper/60">Portfolio</span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-l-md"
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'linear-gradient(to right, #d9d1c1 0%, #efe9dc 18%, #efe9dc 100%)',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Confetti */}
          {particles.map((p, i) => {
            const tx = Math.cos(p.angle) * p.dist * layout.ax;
            const ty = Math.sin(p.angle) * p.dist * layout.ay * 0.8 - layout.pageH * 0.2;
            return (
              <motion.span
                key={i}
                className={`absolute ${p.round ? 'rounded-full' : ''}`}
                style={{ width: p.size, height: p.size, left: -p.size / 2, top: -p.size / 2, background: p.color }}
                initial={{ opacity: 0, x: 0, y: -layout.pageH * 0.15, scale: 0.4, rotate: 0 }}
                animate={{ opacity: [0, 1, 0], x: tx, y: ty, scale: 1, rotate: 180 }}
                transition={{ delay: 1.35 + (i % 6) * 0.05, duration: 1.6, ease }}
              />
            );
          })}

          {/* Objects bursting out of the pages */}
          {flyers.map(({ Icon, tx, ty, from, to }, i) => {
            const x = tx * layout.ax;
            const y = ty * layout.ay * (ty > 0 ? layout.lowerSpread : 1);
            const start = -layout.pageH * 0.15;
            const delay = 1.4 + i * 0.09;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ width: layout.objSize, height: layout.objSize, left: -layout.objSize / 2, top: -layout.objSize / 2 }}
                initial={{ opacity: 0, x: 0, y: start, scale: 0.2, rotate: from }}
                animate={
                  exiting
                    ? { opacity: 0, x: x * 1.45, y: y * 1.45, scale: 1.25, rotate: to * 2 }
                    : {
                        opacity: [0, 1, 1],
                        x: [0, x * 0.55, x],
                        y: [start, Math.min(y, start) - layout.objSize * 0.6, y],
                        scale: [0.2, 1.12, 1],
                        rotate: [from, to * 1.6, to],
                      }
                }
                transition={
                  exiting
                    ? { duration: 0.6, ease: 'easeIn' }
                    : { delay, duration: 1.15, ease: 'easeOut', times: [0, 0.55, 1] }
                }
              >
                <div
                  className="intro-float h-full w-full drop-shadow-[0_10px_12px_rgba(20,20,19,0.18)]"
                  style={{ animationDelay: `${delay + 1.15 + i * 0.2}s` }}
                >
                  <Icon />
                </div>
              </motion.div>
            );
          })}

          {/* Caption */}
          <motion.p
            className="absolute w-64 text-center text-xs font-medium uppercase tracking-[0.3em] text-stone-500"
            style={{ left: -128, top: layout.pageH / 2 + layout.pageH * 0.3 }}
            initial={{ opacity: 0, y: 8 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1, y: 0 }}
            transition={{ delay: exiting ? 0 : 0.3, duration: 0.6, ease }}
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
        className="absolute bottom-6 right-6 text-sm font-medium text-stone-500 transition-colors hover:text-ink"
      >
        Skip intro →
      </button>
    </motion.div>
  );
}
