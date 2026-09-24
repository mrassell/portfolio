'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SECTIONS, type Section } from './data';
import { MAX_QUEUED_SHOTS, useInput, type Direction, type InputState } from './input';
import { BOSS_MAX_HP, PLAYER_MAX_HP, type FightEvent, type FightStatus } from './shared';
import { SPAWN, STATIONS, World, WORLD_RADIUS, type Teleport } from './World';

const MOVEMENT_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'Space',
]);

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-stone-700 shadow-[0_2px_0_0_rgb(214,211,209)]">
      {children}
    </kbd>
  );
}

function IntroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 text-center shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-stone-500">Welcome to</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-stone-900">Maheen&apos;s World</h1>
        <p className="mt-4 text-stone-600">
          Walk up to each glowing station to read about my experience, projects, hackathons, and more.
        </p>
        <div className="mt-6 hidden flex-col items-center gap-3 text-sm text-stone-600 md:flex">
          <div className="flex items-center gap-2">
            <Key>↑</Key>
            <Key>↓</Key>
            <Key>←</Key>
            <Key>→</Key>
            <span className="ml-1">or</span>
            <Key>W</Key>
            <Key>A</Key>
            <Key>S</Key>
            <Key>D</Key>
            <span className="ml-1">to move</span>
          </div>
          <div className="flex items-center gap-2">
            <Key>Space</Key>
            <span>to jump — press again mid-air to double jump</span>
          </div>
          <div className="flex items-center gap-2">
            <Key>Shift</Key>
            <span>to run</span>
            <span className="mx-2 text-stone-300">·</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
        <p className="mt-6 text-sm text-stone-600 md:hidden">
          Use the arrow pad to move and the JUMP button to jump (tap twice to double jump).
        </p>
        <p className="mt-4 text-sm font-semibold text-orange-600">Visit all 6 stations for a surprise…</p>
        <button
          onClick={onStart}
          className="mt-8 w-full rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-stone-800"
        >
          Start exploring
        </button>
      </div>
    </div>
  );
}

function SectionPanel({ section, onClose }: { section: Section; onClose?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fadeStyle = prefersReducedMotion
    ? {
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }
    : {
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      };

  return (
    <div
      className="pointer-events-auto relative flex max-h-full flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        ...fadeStyle,
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      }}
    >
      <div className="h-1.5 shrink-0" style={{ backgroundColor: section.color, opacity: 0.8 }} />
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-white/40"
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          ✕
        </button>
      )}
      <div className="overflow-y-auto overscroll-contain p-6">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: section.color }}>
          {section.tagline}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-stone-900">{section.title}</h2>
        {section.intro && <p className="mt-3 leading-relaxed text-stone-700">{section.intro}</p>}

        {section.items.length > 0 && (
          <div className="mt-4 space-y-3">
            {section.items.map((item) => (
              <div
                key={`${item.heading}-${item.org ?? ''}`}
                className="rounded-xl border border-white/40 p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-stone-900">{item.heading}</h3>
                  {item.badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: section.color }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.org && <p className="text-sm font-medium text-stone-600">{item.org}</p>}
                {item.meta && <p className="text-xs text-stone-500">{item.meta}</p>}
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.body}</p>
              </div>
            ))}
          </div>
        )}

        {section.links && (
          <div className="mt-4 flex flex-wrap gap-2">
            {section.links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-white/40"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {link.label}
                </a>
              ) : link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: section.color }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-white/40"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MinimapProps {
  player: { x: number; z: number; heading: number };
  activeId: string | null;
  visited: ReadonlySet<string>;
  onTravel: (index: number) => void;
}

function Minimap({ player, activeId, visited, onTravel }: MinimapProps) {
  const size = 150;
  const scale = size / 2 / (WORLD_RADIUS + 2);
  const toMap = (v: number) => size / 2 + v * scale;

  return (
    <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/80 p-2 shadow-lg backdrop-blur">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Minimap">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="#8fb573" stroke="#6b8f5e" strokeWidth={2} />
        {STATIONS.map((s) => (
          <line
            key={`path-${s.section.id}`}
            x1={size / 2}
            y1={size / 2}
            x2={toMap(s.x)}
            y2={toMap(s.z)}
            stroke="#d6cfc4"
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
        <circle cx={size / 2} cy={size / 2} r={7} fill="#d6cfc4" />
        {STATIONS.map((s, i) => (
          <g
            key={s.section.id}
            onClick={() => onTravel(i)}
            className="cursor-pointer"
            role="button"
            aria-label={`Travel to ${s.section.title}`}
          >
            <title>{`Travel to ${s.section.title}`}</title>
            <circle
              cx={toMap(s.x)}
              cy={toMap(s.z)}
              r={activeId === s.section.id ? 9 : 7}
              fill={visited.has(s.section.id) ? s.section.color : '#ffffff'}
              stroke={s.section.color}
              strokeWidth={3}
            />
          </g>
        ))}
        <g transform={`translate(${toMap(player.x)} ${toMap(player.z)}) rotate(${(-player.heading * 180) / Math.PI})`}>
          <path d="M0 7 L-5 -4 L0 -1.5 L5 -4 Z" fill="#1c1917" stroke="#ffffff" strokeWidth={1.2} />
        </g>
      </svg>
    </div>
  );
}

function DPad({ input }: { input: React.MutableRefObject<InputState> }) {
  const bind = (dir: Direction) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      input.current[dir] = true;
    },
    onPointerUp: () => {
      input.current[dir] = false;
    },
    onPointerCancel: () => {
      input.current[dir] = false;
    },
    onLostPointerCapture: () => {
      input.current[dir] = false;
    },
  });
  const btn =
    'flex h-14 w-14 touch-none select-none items-center justify-center rounded-xl bg-white/85 text-xl font-bold text-stone-700 shadow-lg active:bg-stone-200';

  return (
    <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 md:hidden">
      <button aria-label="Move up" className={`${btn} col-start-2`} {...bind('up')}>
        ↑
      </button>
      <button aria-label="Move left" className={`${btn} col-start-1 row-start-2`} {...bind('left')}>
        ←
      </button>
      <button aria-label="Move right" className={`${btn} col-start-3 row-start-2`} {...bind('right')}>
        →
      </button>
      <button aria-label="Move down" className={`${btn} col-start-2 row-start-3`} {...bind('down')}>
        ↓
      </button>
    </div>
  );
}

function ActionButtons({ input, canFire }: { input: React.MutableRefObject<InputState>; canFire: boolean }) {
  const round =
    'pointer-events-auto flex h-16 w-16 touch-none select-none items-center justify-center rounded-full text-sm font-bold shadow-lg';
  return (
    <div className="flex flex-col items-center gap-2 md:hidden">
      {canFire && (
        <button
          aria-label="Shoot fireball"
          className={`${round} bg-orange-500 text-white active:bg-orange-600`}
          onPointerDown={(e) => {
            e.preventDefault();
            input.current.fireRequests = Math.min(MAX_QUEUED_SHOTS, input.current.fireRequests + 1);
          }}
        >
          FIRE
        </button>
      )}
      <button
        aria-label="Jump"
        className={`${round} bg-white/90 text-stone-800 active:bg-stone-200`}
        onPointerDown={(e) => {
          e.preventDefault();
          input.current.jumpRequests++;
        }}
      >
        JUMP
      </button>
    </div>
  );
}

function Hearts({ hp }: { hp: number }) {
  return (
    <div className="flex gap-1" aria-label={`${hp} of ${PLAYER_MAX_HP} hearts left`}>
      {Array.from({ length: PLAYER_MAX_HP }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-6 w-6 drop-shadow">
          <path
            d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
            fill={i < hp ? '#ef4444' : '#e7e5e4'}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </svg>
      ))}
    </div>
  );
}

function FightHud({ status, bossHp, playerHp }: { status: FightStatus; bossHp: number; playerHp: number }) {
  if (status === 'incoming') {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4">
        <div className="animate-pulse rounded-2xl border-4 border-red-500 bg-red-600/90 px-8 py-4 text-center text-white shadow-2xl">
          <p className="text-3xl font-black tracking-widest sm:text-4xl">WARNING</p>
          <p className="text-sm font-semibold uppercase tracking-widest">A giant mech is dropping in</p>
        </div>
      </div>
    );
  }
  if (status !== 'fighting') return null;

  const pct = (bossHp / BOSS_MAX_HP) * 100;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex flex-col items-center gap-2 px-4 md:top-4">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-stone-900/85 px-4 py-3 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white">
          <span>Mega Mech</span>
          <span className={bossHp <= BOSS_MAX_HP / 2 ? 'text-red-400' : 'text-stone-300'}>
            {bossHp <= BOSS_MAX_HP / 2 ? 'Enraged' : `${bossHp} HP`}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <Hearts hp={playerHp} />
      <p className="hidden rounded-full bg-stone-900/70 px-3 py-1 text-xs font-medium text-white md:block">
        Click (or hold F) to throw fireballs · Space to jump the shockwaves · Dodge the red circles
      </p>
    </div>
  );
}

function ResultOverlay({
  status,
  onRetry,
  onLeave,
}: {
  status: 'won' | 'lost';
  onRetry: () => void;
  onLeave: () => void;
}) {
  const won = status === 'won';
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-stone-500">
          {won ? 'Boss defeated' : 'Game over'}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
          {won ? 'You beat the Mega Mech!' : 'The Mega Mech got you'}
        </h2>
        <p className="mt-3 text-stone-600">
          {won
            ? "Thanks for exploring my portfolio all the way to the end. If you liked what you saw, let's talk."
            : 'Jump over the shockwaves and keep moving to dodge the orbs. You got this.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {won ? (
            <>
              <a
                href="https://mrassell.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-stone-800"
              >
                Get in touch
              </a>
              <button
                onClick={onLeave}
                className="w-full rounded-xl border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition-colors hover:bg-stone-100"
              >
                Keep exploring
              </button>
              <button onClick={onRetry} className="text-sm font-medium text-stone-500 hover:text-stone-900">
                Rematch
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRetry}
                className="w-full rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-stone-800"
              >
                Try again
              </button>
              <button
                onClick={onLeave}
                className="w-full rounded-xl border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition-colors hover:bg-stone-100"
              >
                Back to exploring
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type FightPhase = 'none' | FightStatus;

export default function PortfolioWorld() {
  const input = useInput();
  const zoom = useRef(1);
  const teleport = useRef<Teleport | null>(null);
  const bossTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bossSummoned = useRef(false);
  const [started, setStarted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set());
  const [player, setPlayer] = useState({ x: SPAWN[0], z: SPAWN[1], heading: Math.PI });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fightRun, setFightRun] = useState(0);
  const [fightPhase, setFightPhase] = useState<FightPhase>('none');
  const [resultDismissed, setResultDismissed] = useState(false);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);

  useEffect(() => {
    if (started) return;
    const onKey = (e: KeyboardEvent) => {
      if (MOVEMENT_KEYS.has(e.code)) setStarted(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started]);

  useEffect(() => {
    if (visited.size === SECTIONS.length && !bossSummoned.current) {
      bossSummoned.current = true;
      bossTimer.current = setTimeout(() => setFightRun(1), 2500);
    }
  }, [visited.size]);

  useEffect(
    () => () => {
      if (bossTimer.current) clearTimeout(bossTimer.current);
    },
    [],
  );

  const handleMove = useCallback((x: number, z: number, heading: number) => {
    setPlayer({ x, z, heading });
  }, []);

  const handleActiveChange = useCallback((id: string | null) => {
    setActiveId(id);
    setSheetOpen(false);
    if (id) {
      setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    }
  }, []);

  const handleFightEvent = useCallback((event: FightEvent) => {
    if (event.type === 'bossHp') setBossHp(event.hp);
    else if (event.type === 'playerHp') setPlayerHp(event.hp);
    else {
      setFightPhase(event.status);
      setResultDismissed(false);
    }
  }, []);

  const handleTravel = useCallback((index: number) => {
    const s = STATIONS[index];
    const back = 3.4;
    teleport.current = { x: s.x - Math.cos(s.angle) * back, z: s.z - Math.sin(s.angle) * back };
    setStarted(true);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    zoom.current = Math.min(1.7, Math.max(0.3, zoom.current + e.deltaY * 0.0012));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      input.current.fireRequests = Math.min(MAX_QUEUED_SHOTS, input.current.fireRequests + 1);
    },
    [input],
  );

  const retryFight = useCallback(() => setFightRun((n) => n + 1), []);
  const leaveFight = useCallback(() => {
    if (fightPhase === 'won') {
      setResultDismissed(true);
      return;
    }
    setFightRun(0);
    setFightPhase('none');
  }, [fightPhase]);

  const inFight = fightPhase === 'incoming' || fightPhase === 'fighting' || fightPhase === 'lost';
  const activeSection = inFight ? null : (SECTIONS.find((s) => s.id === activeId) ?? null);
  const allVisited = visited.size === SECTIONS.length;
  const showBanner = fightRun === 0 || fightPhase === 'won';

  let statusLine = `Stations visited: ${visited.size}/${SECTIONS.length}`;
  if (fightPhase === 'won') statusLine = 'Mega Mech defeated — you win!';
  else if (inFight) statusLine = 'Boss fight!';
  else if (allVisited) statusLine = 'Tour complete — something is coming…';

  return (
    <div className="relative h-[100dvh] w-full select-none overflow-hidden bg-[#cfe0ea]">
      <div
        className={`absolute inset-0 ${fightPhase === 'fighting' ? 'cursor-crosshair' : ''}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
      >
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ fov: 50, near: 0.1, far: 600, position: [SPAWN[0], 8, SPAWN[1] + 13] }}
          fallback={
            <div className="flex h-full items-center justify-center p-6 text-center text-stone-700">
              Your browser doesn&apos;t support WebGL.{' '}
              <Link href="/" className="ml-1 underline">
                View the classic portfolio instead.
              </Link>
            </div>
          }
        >
          <World
            input={input}
            zoom={zoom}
            teleport={teleport}
            activeId={activeId}
            visited={visited}
            fightRun={fightRun}
            showBanner={showBanner}
            onMove={handleMove}
            onActiveChange={handleActiveChange}
            onFightEvent={handleFightEvent}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg backdrop-blur">
            <Link href="/" className="text-xs font-medium text-stone-500 transition-colors hover:text-stone-900">
              ← Classic portfolio
            </Link>
            <p className="text-lg font-bold text-stone-900">Maheen&apos;s World</p>
            <p className="text-xs text-stone-600">{statusLine}</p>
            {fightPhase === 'won' && resultDismissed && (
              <button
                onClick={retryFight}
                className="mt-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Rematch the boss →
              </button>
            )}
            {fightPhase === 'none' && fightRun === 0 && bossSummoned.current && (
              <button
                onClick={retryFight}
                className="mt-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Summon the boss →
              </button>
            )}
          </div>
          <div className="hidden md:block">
            <Minimap player={player} activeId={activeId} visited={visited} onTravel={handleTravel} />
            <p className="mt-1 text-center text-[11px] font-medium text-stone-700/80">Click a dot to fast travel</p>
          </div>
        </div>

        <div className="relative mt-4 min-h-0 flex-1">
          {activeSection && (
            <div className="absolute bottom-0 right-0 top-0 hidden w-[400px] md:block">
              <SectionPanel key={activeSection.id} section={activeSection} />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <DPad input={input} />
          {activeSection && (
            <button
              onClick={() => setSheetOpen(true)}
              className="pointer-events-auto min-w-0 flex-1 rounded-2xl border border-white/50 p-4 text-left shadow-xl md:hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: activeSection.color }}>
                {activeSection.tagline}
              </p>
              <p className="truncate text-lg font-bold text-stone-900">{activeSection.title}</p>
              <p className="text-sm font-medium text-stone-600">Tap to read →</p>
            </button>
          )}
          <ActionButtons input={input} canFire={fightPhase === 'fighting'} />
          <div className="pointer-events-auto hidden items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-xs text-stone-600 shadow-lg backdrop-blur md:flex">
            <Key>↑</Key>
            <Key>↓</Key>
            <Key>←</Key>
            <Key>→</Key>
            <span>move</span>
            <span className="text-stone-300">·</span>
            <Key>Space</Key>
            <span>jump (×2 to flip)</span>
            <span className="text-stone-300">·</span>
            <Key>Shift</Key>
            <span>run</span>
          </div>
        </div>
      </div>

      {(fightPhase === 'incoming' || fightPhase === 'fighting') && (
        <FightHud status={fightPhase} bossHp={bossHp} playerHp={playerHp} />
      )}

      {sheetOpen && activeSection && (
        <div className="absolute inset-0 z-20 flex flex-col bg-stone-900/30 p-4 backdrop-blur-sm md:hidden">
          <SectionPanel key={activeSection.id} section={activeSection} onClose={() => setSheetOpen(false)} />
        </div>
      )}

      {(fightPhase === 'lost' || (fightPhase === 'won' && !resultDismissed)) && (
        <ResultOverlay status={fightPhase} onRetry={retryFight} onLeave={leaveFight} />
      )}

      {!started && <IntroOverlay onStart={() => setStarted(true)} />}
    </div>
  );
}
