import type { ComponentType } from 'react';

// Soft, rounded glyphs for the intro. Each one sits on a pastel tile and is drawn
// in a single deeper tone of that tile's hue on a 100×100 grid.

export interface IntroIcon {
  name: string;
  tile: string;
  tone: string;
  Glyph: ComponentType<{ tone: string; tile: string }>;
}

function Basketball({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="40" fill={tone} />
      <g fill="none" stroke={tile} strokeWidth="5" strokeLinecap="round">
        <path d="M50 12v76" />
        <path d="M12 50h76" />
        <path d="M24 22c13 14 13 42 0 56" />
        <path d="M76 22c-13 14-13 42 0 56" />
      </g>
    </svg>
  );
}

function VideoCamera({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <rect x="8" y="28" width="60" height="46" rx="14" fill={tone} />
      <path d="M72 44l18-10v34l-18-10z" fill={tone} stroke={tone} strokeWidth="8" strokeLinejoin="round" />
      <circle cx="24" cy="42" r="5" fill={tile} />
    </svg>
  );
}

function Sneaker({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path
        d="M12 64c0-14 4-28 12-32 5-2 10-1 13 3 5 7 11 11 20 12 14 2 26 7 30 17z"
        fill={tone}
        stroke={tone}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect x="8" y="64" width="84" height="12" rx="6" fill={tone} opacity="0.55" />
      <circle cx="42" cy="46" r="3.5" fill={tile} />
      <circle cx="50" cy="50" r="3.5" fill={tile} />
    </svg>
  );
}

function Microphone({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <rect x="34" y="8" width="32" height="50" rx="16" fill={tone} />
      <path d="M38 26h24M38 36h24" stroke={tile} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M24 44c0 17 12 26 26 26s26-9 26-26" fill="none" stroke={tone} strokeWidth="6" strokeLinecap="round" />
      <path d="M50 70v16M36 88h28" stroke={tone} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function Laptop({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <rect x="16" y="20" width="68" height="46" rx="10" fill={tone} />
      <rect x="23" y="27" width="54" height="32" rx="5" fill={tile} opacity="0.85" />
      <path d="M31 38h14M31 47h24" stroke={tone} strokeWidth="5" strokeLinecap="round" />
      <rect x="6" y="70" width="88" height="10" rx="5" fill={tone} />
    </svg>
  );
}

function GradCap({ tone, tile }: { tone: string; tile: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path d="M28 50v12c0 9 44 9 44 0V50" fill={tone} opacity="0.7" />
      <path d="M50 22l40 17-40 17-40-17z" fill={tone} stroke={tone} strokeWidth="8" strokeLinejoin="round" />
      <circle cx="50" cy="39" r="4" fill={tile} />
      <path d="M78 45v20" stroke={tone} strokeWidth="5" strokeLinecap="round" />
      <circle cx="78" cy="69" r="5" fill={tone} />
    </svg>
  );
}

export const introIcons: IntroIcon[] = [
  { name: 'basketball', tile: '#fde4da', tone: '#ee8262', Glyph: Basketball },
  { name: 'laptop', tile: '#e3ebfa', tone: '#7092d6', Glyph: Laptop },
  { name: 'grad cap', tile: '#f8dfe4', tone: '#c65d72', Glyph: GradCap },
  { name: 'video camera', tile: '#ebe5fa', tone: '#8d77d4', Glyph: VideoCamera },
  { name: 'sneaker', tile: '#dff2e8', tone: '#52ad85', Glyph: Sneaker },
  { name: 'microphone', tile: '#fbf0d6', tone: '#dca33e', Glyph: Microphone },
];
