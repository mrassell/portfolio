/** The home page's switchable sections, in navbar order. The first one shows by default. */
export const homeSections = [
  { id: 'content', label: 'Content' },
  { id: 'experience', label: 'Experience' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'projects', label: 'Projects' },
] as const;

export type HomeSectionId = (typeof homeSections)[number]['id'];

export function sectionFromHash(hash: string): HomeSectionId | null {
  const id = hash.replace(/^#/, '');
  return homeSections.find((s) => s.id === id)?.id ?? null;
}
