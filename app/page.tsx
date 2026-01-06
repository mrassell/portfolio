import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-stone-900 font-medium">mrassell.com</span>
          <nav className="flex gap-6 text-sm">
            <Link href="/learning-design" className="text-stone-600 hover:text-stone-900 transition-colors">
              Learning Design
            </Link>
            <a href="https://github.com/mrassell" target="_blank" className="text-stone-600 hover:text-stone-900 transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/mrassell" target="_blank" className="text-stone-600 hover:text-stone-900 transition-colors">
              LinkedIn
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight">
              Maheen Rassell
            </h1>
            <p className="text-xl text-stone-500 leading-relaxed max-w-2xl">
              Undergraduate Computer Science and Data Science student at NYU. 
              Focused on learning design, educational technology, and building tools 
              that help quieter students stay in the conversation.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/learning-design"
              className="inline-flex items-center px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              View Learning Design Portfolio →
            </Link>
            <a 
              href="mailto:mr6761@nyu.edu"
              className="inline-flex items-center px-6 py-3 border border-stone-300 text-stone-700 rounded-lg font-medium hover:bg-stone-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>

          {/* Quick Links */}
          <div className="pt-12 border-t border-stone-200">
            <h2 className="text-sm uppercase tracking-wide text-stone-400 mb-6 font-medium">Featured Work</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/learning-design#cs-club-workshop"
                className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">CS Club Workshop</h3>
                <p className="text-sm text-stone-500 mt-1">Designing a safer space for students with imposter syndrome</p>
              </Link>
              <Link 
                href="/learning-design#ai-debate-platform"
                className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">AI Debate Platform</h3>
                <p className="text-sm text-stone-500 mt-1">Rubric-based feedback for quieter debaters</p>
              </Link>
              <Link 
                href="/learning-design#revise-resubmit-capstone"
                className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Revise-and-Resubmit Capstone</h3>
                <p className="text-sm text-stone-500 mt-1">Turning feedback into a habit, not a verdict</p>
              </Link>
              <Link 
                href="/learning-design#journaling-analytics"
                className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Journaling Analytics</h3>
                <p className="text-sm text-stone-500 mt-1">Modeling emotional trajectories over five years</p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-stone-400">
            © {new Date().getFullYear()} Maheen Rassell · <a href="mailto:mr6761@nyu.edu" className="hover:text-stone-600 underline">mr6761@nyu.edu</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

