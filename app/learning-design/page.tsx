import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Learning Design & EdTech Portfolio - mrassell',
  description: 'Designing for students who disengage quietly: feedback loops, psychological safety, and practice environments that make revision feel normal.',
};

/* =============================================================================
   REUSABLE FIGURE COMPONENT
   - Handles any image size gracefully
   - Consistent borders, shadows, captions
   - Responsive on mobile
============================================================================= */

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}

function Figure({ src, alt, caption, priority = false }: FigureProps) {
  return (
    <figure className="my-6">
      <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm">
        {/* Container that adapts to image while constraining max size */}
        <div className="relative w-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[500px] object-contain bg-white"
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-stone-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* =============================================================================
   IMAGE GALLERY - For multiple images side by side
============================================================================= */

interface GalleryProps {
  images: { src: string; alt: string; caption?: string }[];
}

function Gallery({ images }: GalleryProps) {
  return (
    <div className={`my-6 grid gap-4 ${images.length === 2 ? 'md:grid-cols-2' : images.length >= 3 ? 'md:grid-cols-3' : ''}`}>
      {images.map((img, i) => (
        <figure key={i} className="m-0">
          <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm aspect-video">
            <img
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {img.caption && (
            <figcaption className="mt-2 text-center text-xs text-stone-400">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

/* =============================================================================
   PLACEHOLDER - Shows where to add images (remove when you add real images)
============================================================================= */

function ImagePlaceholder({ label, aspectRatio = "video" }: { label: string; aspectRatio?: "video" | "square" | "wide" }) {
  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[2/1]"
  }[aspectRatio];
  
  return (
    <div className={`my-6 ${aspectClass} rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center`}>
      <div className="text-center p-4">
        <div className="text-stone-400 text-sm font-medium">{label}</div>
        <div className="text-stone-300 text-xs mt-1">Add image to /public/artifacts/</div>
      </div>
    </div>
  );
}

/* =============================================================================
   MAIN PAGE
============================================================================= */

export default function LearningDesignPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Simple Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">
            ← Back to Home
          </Link>
          <span className="text-stone-400 text-sm">mrassell.com</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Hero / Intro Section */}
        <section className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-stone-900 tracking-tight">
              Learning Design & EdTech Portfolio
            </h1>
            <p className="text-xl text-stone-500 leading-relaxed">
              Designing for students who disengage quietly: feedback loops, psychological safety, and practice environments that make revision feel normal.
            </p>
          </div>

          <div className="text-stone-700 leading-relaxed space-y-4">
            <p>
              I am an undergraduate Computer Science and Data Science student who thinks in learning cycles. Most of the work below was built around students who go quiet when they feel behind. Each project answers three questions:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-stone-600">
              <li>Who was I designing for?</li>
              <li>What changed in the learning experience?</li>
              <li>How would I evaluate or improve it next time?</li>
            </ol>
          </div>

          {/* Table of Contents */}
          <nav className="pt-4 border-t border-stone-200">
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-3 font-medium">Contents</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li>
                <a href="#cs-club-workshop" className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 transition-colors">
                  CS Club Workshop
                </a>
              </li>
              <li>
                <a href="#ai-debate-platform" className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 transition-colors">
                  Realtime AI Debate Platform
                </a>
              </li>
              <li>
                <a href="#revise-resubmit-capstone" className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 transition-colors">
                  Revise-and-Resubmit Capstone
                </a>
              </li>
              <li>
                <a href="#journaling-analytics" className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 transition-colors">
                  Journaling-Based Learning Analytics
                </a>
              </li>
            </ul>
          </nav>
        </section>

        {/* =========================================================================
            PROJECT 1: CS Club Workshop
            Images: 1-2 (attendance chart, optional Q&A form)
        ========================================================================= */}
        <section id="cs-club-workshop" className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-sm scroll-mt-20">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                CS Club Workshop: Imposter Syndrome and Internship Anxiety
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                Designing a safer space so students show up and stay.
              </p>
            </div>

            <div className="space-y-5 text-stone-700">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Context & Learners</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Setting: Tech at NYU CS club, early undergraduates (mostly first- and second-year students).</li>
                  <li>Learners: Students worried about "falling behind" in recruiting and feeling like outsiders in CS.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Problem</h3>
                <p className="text-stone-600">
                  Attendance was shrinking. The students who showed up most were already confident. The ones who needed support the most were drifting away, often saying some version of "I am too behind to even be here."
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Learning Goals</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Help students name imposter feelings instead of hiding them.</li>
                  <li>Replace vague panic with specific next steps (applications, resumes, practice structure).</li>
                  <li>Increase willingness to attend events and ask questions.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Design & Implementation</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Anonymous Q&A form so students could surface real fears without exposing themselves.</li>
                  <li>Small-group discussion prompts that normalized insecurity instead of centering only "star" students.</li>
                  <li>Closing checklist with 3–5 concrete actions (for example: apply to a set number of roles weekly, book one office hour, find one resume buddy).</li>
                </ul>
              </div>

              {/* 
                ┌─────────────────────────────────────────────────────────────┐
                │  WORKSHOP IMAGES - Replace placeholders with real images    │
                │  Recommended: 1 attendance chart + 1 optional Q&A form      │
                └─────────────────────────────────────────────────────────────┘
                
                To add real images:
                1. Save image to /public/artifacts/workshop-attendance.png
                2. Replace ImagePlaceholder with:
                   <Figure 
                     src="/artifacts/workshop-attendance.png" 
                     alt="Attendance growth chart" 
                     caption="Figure 1: Weekly attendance before and after the workshop"
                   />
              */}
              <ImagePlaceholder label="Attendance Chart (before/after)" />

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Evidence / Evaluation</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Informal attendance tracking: single-digit weekly attendance before the workshop increased to around 15 consistent attendees afterward.</li>
                  <li>Qualitative comments from participants:
                    <ul className="list-disc list-outside ml-5 mt-1">
                      <li className="italic">"It helped to see that other people were just as worried as I was."</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">What I Would Change Next Time</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Add a short pre- and post-workshop confidence check (1–5 scale).</li>
                  <li>Follow up with focused micro-sessions on specific topics such as cold emailing and resume review.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                <span className="text-stone-400">Artifacts:</span>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Workshop Outline (coming soon)
                </a>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Slides (coming soon)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECT 2: AI Debate Platform
            Images: 3-4 (main UI, feedback view, before/after example)
        ========================================================================= */}
        <section id="ai-debate-platform" className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-sm scroll-mt-20">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Realtime AI Debate Platform
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                Rubric-based feedback so quieter debaters can practice without performing.
              </p>
            </div>

            <div className="space-y-5 text-stone-700">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Context & Learners</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Setting: Hack@Brown University 2025; prototype web application.</li>
                  <li>Learners: Students practicing basic debate and argumentation who hesitate to speak up in live settings.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Problem</h3>
                <p className="text-stone-600">
                  In traditional debate practice, more extroverted students dominate. Quieter students get less practice and almost no targeted feedback.
                </p>
              </div>

              {/* 
                ┌─────────────────────────────────────────────────────────────┐
                │  DEBATE PLATFORM HERO IMAGE - Main interface screenshot     │
                └─────────────────────────────────────────────────────────────┘
                
                To add:
                <Figure 
                  src="/artifacts/debate-platform-main.png" 
                  alt="AI Debate Platform main interface" 
                  caption="Main interface where students submit their arguments"
                  priority={true}
                />
              */}
              <ImagePlaceholder label="Main Interface Screenshot" />

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Learning Goals</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Give students a low-pressure space to practice arguments.</li>
                  <li>Provide specific feedback on evidence, structure, and rebuttals.</li>
                  <li>Encourage revision instead of one-shot performances.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Design & Implementation</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Students respond to common prompts (for example: chores at home, school uniforms) inside the app.</li>
                  <li>The app uses an AI model to score along rubric dimensions such as evidence quality, clarity, and rebuttal strength, and returns concrete suggestions.</li>
                  <li>The rubric was iterated so comments turned into actions. For example, "Strengthen evidence" became "Add one credible source and connect it to your claim with one sentence of reasoning."</li>
                </ul>
              </div>

              {/* 
                ┌─────────────────────────────────────────────────────────────┐
                │  FEEDBACK VIEW + BEFORE/AFTER - Side by side gallery        │
                └─────────────────────────────────────────────────────────────┘
                
                To add multiple images:
                <Gallery images={[
                  { src: "/artifacts/debate-feedback.png", alt: "Feedback panel", caption: "Rubric-based feedback" },
                  { src: "/artifacts/debate-revision.png", alt: "Before and after", caption: "Response improvement" }
                ]} />
              */}
              <div className="my-6 grid gap-4 md:grid-cols-2">
                <div className="aspect-video rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-stone-400 text-sm font-medium">Feedback Panel</div>
                    <div className="text-stone-300 text-xs mt-1">Shows rubric scores</div>
                  </div>
                </div>
                <div className="aspect-video rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-stone-400 text-sm font-medium">Before/After Example</div>
                    <div className="text-stone-300 text-xs mt-1">Shows improvement</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Evidence / Evaluation</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Early feedback from peers at the hackathon highlighted that the tool made it easier to see what to fix without feeling judged in front of a crowd.</li>
                  <li>If I had more time, I would test it with 10–15 students using pre- and post-prompts scored with the rubric, and brief questions about confidence and usability.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">What I Would Change Next Time</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Add an explicit revise-and-resubmit loop directly into the interface.</li>
                  <li>Include a simple confidence check after each round.</li>
                  <li>Involve a debate coach or teacher to co-design rubrics for specific classes.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                <span className="text-stone-400">Artifacts:</span>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Sample Rubric (coming soon)
                </a>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Live Demo (coming soon)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECT 3: Revise-and-Resubmit Capstone
            Images: 1-2 (flow diagram, worked example)
        ========================================================================= */}
        <section id="revise-resubmit-capstone" className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-sm scroll-mt-20">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Revise-and-Resubmit Feedback Loop for Early CS and Argumentation Learners
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                Turning feedback into a habit, not a verdict.
              </p>
            </div>

            <div className="space-y-5 text-stone-700">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Context & Learners</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Early CS students (explaining code or algorithms) and early argumentation learners (short written arguments).</li>
                  <li>Target group: students who stop asking questions and quietly disengage when they feel behind.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Problem</h3>
                <p className="text-stone-600">
                  Many students receive feedback once, feel judged, and then stop revising. Quiet disengagement is hard for teachers to see and even harder to catch early.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Learning Goals</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Help students treat a first answer as a draft, not a final grade.</li>
                  <li>Practice using feedback to make specific changes.</li>
                  <li>Track confidence and persistence over a short series of practice rounds.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Design & Flow</h3>
                <ol className="list-decimal list-outside ml-5 space-y-2 text-stone-600">
                  <li>Student receives a prompt (for example, "Explain how this loop works" or "Should students have to do chores?").</li>
                  <li>Student submits a short response.</li>
                  <li>The system provides rubric-based feedback on dimensions such as claim, evidence, reasoning, and clarity.</li>
                  <li>Student revises their response.</li>
                  <li>Student writes a brief reflection (1–2 sentences) on what they changed and why.</li>
                </ol>
              </div>

              {/* 
                ┌─────────────────────────────────────────────────────────────┐
                │  FLOW DIAGRAM - Visual of the learning loop                 │
                └─────────────────────────────────────────────────────────────┘
                
                <Figure 
                  src="/artifacts/capstone-flow.png" 
                  alt="Revise-and-resubmit flow diagram" 
                  caption="Figure: The five-step revision loop"
                />
              */}
              <ImagePlaceholder label="Flow Diagram: Prompt → Submit → Feedback → Revise → Reflect" aspectRatio="wide" />

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Rubric Snapshot</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-stone-700 border-b border-stone-200">Criteria</th>
                        <th className="text-center px-4 py-2 font-medium text-stone-700 border-b border-stone-200">Needs Work</th>
                        <th className="text-center px-4 py-2 font-medium text-stone-700 border-b border-stone-200">Developing</th>
                        <th className="text-center px-4 py-2 font-medium text-stone-700 border-b border-stone-200">Strong</th>
                      </tr>
                    </thead>
                    <tbody className="text-stone-600">
                      <tr className="border-b border-stone-100">
                        <td className="px-4 py-2">Claim clarity</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="px-4 py-2">Evidence</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Reasoning</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                        <td className="text-center px-4 py-2">○</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Example (Summarized)</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li><strong>Initial response:</strong> A simple argument with limited evidence.</li>
                  <li><strong>Feedback:</strong> Comments pointing out where evidence was missing and where reasoning was unclear.</li>
                  <li><strong>Revised response:</strong> Now with a specific source and one clear sentence connecting the evidence to the claim.</li>
                  <li><strong>Reflection:</strong> One sentence about what changed and why.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Evaluation Plan</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Small pilot with around 10–15 learners.</li>
                  <li>Pre- and post-practice prompts scored with the rubric.</li>
                  <li>Confidence questions (1–5) before and after.</li>
                  <li>A few short survey items or brief interviews to understand how the feedback felt and what helped.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">What I Learned</h3>
                <p className="text-stone-600">
                  Designing the flow clarified my thinking about what revision actually requires: not just re-doing, but noticing what changed and articulating why. Next time, I would simplify the rubric to three core dimensions and consider adding a peer feedback option so students can see how others approach the same prompt.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                <span className="text-stone-400">Artifacts:</span>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Capstone PDF (coming soon)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECT 4: Journaling-Based Learning Analytics
            Images: 2-3 (mood trajectory, state transitions)
        ========================================================================= */}
        <section id="journaling-analytics" className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-sm scroll-mt-20">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Journaling as Data: Modeling Emotional Trajectories
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                Five years of entries as a lab for motivation and persistence.
              </p>
            </div>

            <div className="space-y-5 text-stone-700">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Context & Learners</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Personal journaling dataset: more than 2,000 entries over five years.</li>
                  <li>Treated as a way to study how motivation, confidence, and mood fluctuate over time.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Problem / Question</h3>
                <p className="text-stone-600">
                  How do motivation and confidence actually change over long periods of study, and what patterns might matter for how we support students?
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Approach</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Applied simple sentiment analysis and sequence modeling (for example, Hidden Markov Models) to track shifts in mood and motivation states.</li>
                  <li>Looked for transitions into "avoidant" or "burnt out" states and which events seemed to precede them.</li>
                </ul>
              </div>

              {/* 
                ┌─────────────────────────────────────────────────────────────┐
                │  JOURNALING VISUALIZATIONS - Data viz images                │
                └─────────────────────────────────────────────────────────────┘
                
                <Gallery images={[
                  { src: "/artifacts/journal-trajectory.png", alt: "Mood over time", caption: "Motivation trajectory over 5 years" },
                  { src: "/artifacts/journal-states.png", alt: "State transitions", caption: "HMM state transition diagram" }
                ]} />
              */}
              <div className="my-6 grid gap-4 md:grid-cols-2">
                <div className="aspect-video rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-stone-400 text-sm font-medium">Mood Trajectory Chart</div>
                    <div className="text-stone-300 text-xs mt-1">Time series over 5 years</div>
                  </div>
                </div>
                <div className="aspect-video rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-stone-400 text-sm font-medium">State Transition Diagram</div>
                    <div className="text-stone-300 text-xs mt-1">HMM visualization</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">What It Taught Me</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-stone-600">
                  <li>Motivation is rarely linear; it moves in cycles.</li>
                  <li>That insight now shapes how I think about learners: I assume fluctuation and design for recovery, not perfection.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                <span className="text-stone-400">Artifacts:</span>
                <a href="#" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                  Write-up & Visualizations (coming soon)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="pt-4 border-t border-stone-200">
          <p className="text-stone-600 leading-relaxed">
            I built these projects as a student trying to keep quieter learners in the conversation, including my past self. Over time, I want to deepen the learning science and evaluation side of this work so I can design and test interventions with more rigor and reach. Until then, this page is my running record of what I am learning about how people stay, or drift, in a learning environment.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-sm text-stone-400">
            © {new Date().getFullYear()} Maheen Rassell · <a href="mailto:mr6761@nyu.edu" className="hover:text-stone-600 underline">mr6761@nyu.edu</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
