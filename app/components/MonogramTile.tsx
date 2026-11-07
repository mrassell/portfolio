/** The small coloured initials tile that stands in for a logo in the LinkedIn-style lists. */
export default function MonogramTile({ mark, tint }: { mark: string; tint: [string, string] }) {
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tracking-tight"
      style={{ background: tint[0], color: tint[1] }}
    >
      {mark}
    </span>
  );
}
