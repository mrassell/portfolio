import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import ProjectShot from '@/app/components/ProjectShot';
import { hackathons, type Hackathon } from '@/app/data/hackathons';
import { projects } from '@/app/data/experience';

export const metadata: Metadata = {
  title: 'Projects - Maheen Rassell',
  description: 'Hackathon wins and side projects by Maheen Rassell, with how each was built.',
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-stone-300 py-6 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
      <h3 className="text-sm text-stone-400">{label}</h3>
      <div className="text-lg leading-relaxed text-stone-700">{children}</div>
    </div>
  );
}

function ProjectSection({ project, index }: { project: Hackathon; index: number }) {
  return (
    <section id={project.id} className="scroll-mt-24 border-t border-ink py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Meta column */}
        <aside className="order-last lg:order-none lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-28">
            <p className="hidden text-sm tabular-nums text-stone-400 lg:block">({String(index + 1).padStart(2, '0')})</p>
            <div className="hidden lg:block">
              <p className="text-2xl font-semibold tracking-tight text-accent">{project.award}</p>
              <p className="mt-1 text-stone-500">
                {project.event} · {project.year}
              </p>
            </div>
            {project.team && (
              <div>
                <p className="mb-1 text-sm text-stone-400">Team</p>
                <p className="text-sm text-stone-600">{project.team.join(', ')}</p>
              </div>
            )}
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tool) => (
                <li key={tool} className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600">
                  {tool}
                </li>
              ))}
            </ul>
            {project.links.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                {project.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1">
                      <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
                        {l.label}
                      </span>
                      <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Story column */}
        <div className="lg:col-span-8">
          {/* On small screens the meta column drops below, so lead with the award here */}
          <p className="mb-4 text-sm lg:hidden">
            <span className="tabular-nums text-stone-400">({String(index + 1).padStart(2, '0')})</span>{' '}
            <span className="font-semibold text-accent">{project.award}</span>
            <span className="block text-stone-500">
              {project.event} · {project.year}
            </span>
          </p>
          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-7xl">{project.name}</h2>
          <p className="mb-10 mt-5 max-w-2xl text-xl leading-snug tracking-tight text-stone-600 md:text-2xl">
            {project.tagline}
          </p>
          {project.image && (
            <ProjectShot src={project.image.src} alt={project.image.alt} className="mb-12 max-w-[34rem]" />
          )}
          <Detail label="What it does">{project.what}</Detail>
          <Detail label="How it’s built">{project.how}</Detail>
          {project.hardest && <Detail label="Hardest part">{project.hardest}</Detail>}
          {project.myRole && (
            <Detail label="My part">
              <span className="text-ink">{project.myRole}</span>
            </Detail>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent selection:text-paper">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="pb-16 pt-14 md:pb-24 md:pt-20">
          <p className="mb-4 text-sm text-stone-500">Projects</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            Things I built in a weekend.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
            Five hackathon awards and a top 5, from AI security systems to rap battles and goats. Here&apos;s what each
            one does and how we built it.
          </p>

          <ol className="mt-14 border-t border-ink">
            {hackathons.map((h, i) => (
              <li key={h.id} className="border-b border-stone-300">
                <a
                  href={`#${h.id}`}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-4 md:grid-cols-[3.5rem_minmax(0,1fr)_16rem]"
                >
                  <span className="text-sm tabular-nums text-stone-400">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1 md:text-2xl">
                    {h.name}
                  </span>
                  <span className="text-right text-sm text-stone-500">
                    <span className="font-medium text-accent">{h.awardShort}</span>
                    <span className="hidden md:inline"> · {h.event}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        {hackathons.map((h, i) => (
          <ProjectSection key={h.id} project={h} index={i} />
        ))}

        <section className="border-t border-ink py-14 md:py-20">
          <h2 className="mb-10 text-4xl font-semibold tracking-tight md:text-6xl">Also built</h2>
          <ul className="grid border-t border-stone-300 md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.name} className="border-b border-stone-300 py-7 md:odd:border-r md:odd:pr-10 md:even:pl-10">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-400">{p.kind}</span>
                </div>
                <p className="leading-relaxed text-stone-600">{p.summary}</p>
              </li>
            ))}
          </ul>
          <Link href="/#experience" className="group mt-12 inline-flex items-center gap-1.5 text-sm font-medium">
            <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
              See experience &amp; leadership
            </span>
            <span aria-hidden>→</span>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
