// Flat illustrations for the intro, drawn in the site palette on a 100×100 grid
const ink = '#141413';
const paper = '#f6f4ef';
const accent = '#e4412b';
const crimson = '#a51c30';
const violet = '#57068c';
const stone = '#78716c';
const stoneLight = '#d6d3d1';

export function Basketball() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="42" fill={accent} stroke={ink} strokeWidth="3.5" />
      <g fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round">
        <path d="M50 8v84" />
        <path d="M8 50h84" />
        <path d="M21 20c14 14 14 46 0 60" />
        <path d="M79 20c-14 14-14 46 0 60" />
      </g>
      <path d="M27 27a30 30 0 0 1 14-9" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function VideoCamera() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <circle cx="30" cy="26" r="13" fill={paper} stroke={ink} strokeWidth="3.5" />
      <circle cx="30" cy="26" r="4" fill={ink} />
      <circle cx="58" cy="26" r="13" fill={paper} stroke={ink} strokeWidth="3.5" />
      <circle cx="58" cy="26" r="4" fill={ink} />
      <rect x="10" y="40" width="58" height="40" rx="7" fill={ink} />
      <path d="M68 52l22-11v38l-22-11z" fill={ink} />
      <circle cx="22" cy="51" r="4" fill={accent} />
      <rect x="30" y="64" width="28" height="6" rx="3" fill={stone} />
    </svg>
  );
}

export function Sneaker() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path
        d="M8 66c0-12 4-26 12-30l14-4c4 8 12 14 22 16 12 2 28 6 34 18z"
        fill={violet}
        stroke={ink}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M38 38l6-3M42 43l6-3M47 47l6-3" stroke={paper} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 58c10-2 22-2 36 2" fill="none" stroke={paper} strokeWidth="4" strokeLinecap="round" />
      <path d="M6 66h86a4 4 0 0 1 0 8H10a4 4 0 0 1-4-4z" fill={paper} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Microphone() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path d="M24 40c0 18 12 28 26 28s26-10 26-28" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="6" width="32" height="48" rx="16" fill={ink} />
      <path d="M38 18h24M36 26h28M36 34h28M38 42h24" stroke={stone} strokeWidth="2" />
      <rect x="44" y="50" width="12" height="6" fill={accent} />
      <path d="M50 68v18" stroke={ink} strokeWidth="4" />
      <path d="M34 90h32" stroke={ink} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Laptop() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <rect x="16" y="18" width="68" height="46" rx="5" fill={ink} />
      <rect x="21" y="23" width="58" height="36" rx="2" fill={paper} />
      <g strokeLinecap="round" strokeWidth="3.5">
        <path d="M27 31h14" stroke={accent} />
        <path d="M27 39h26" stroke={ink} />
        <path d="M33 47h20" stroke={stone} />
        <path d="M27 54h10" stroke={violet} />
      </g>
      <path d="M6 68h88l-6 10H12z" fill={stoneLight} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M42 68h16" stroke={ink} strokeWidth="3" />
    </svg>
  );
}

export function GradCap() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path d="M26 46v16c0 8 48 8 48 0V46" fill={ink} />
      <path d="M50 20l44 18-44 18L6 38z" fill={ink} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 38l30 10v20" fill="none" stroke={crimson} strokeWidth="3" strokeLinecap="round" />
      <path d="M76 66h8l-1 12h-6z" fill={crimson} />
      <circle cx="50" cy="38" r="3.5" fill={crimson} />
    </svg>
  );
}
