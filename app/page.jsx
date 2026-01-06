import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-stone-900">mrassell.com</span>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-stone-600 hover:text-stone-900">Home</Link>
            <Link href="/learning-design" className="text-stone-600 hover:text-stone-900">Portfolio</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold text-stone-900 tracking-tight">
              Maheen Rassell
            </h1>
            <p className="text-xl text-stone-500 max-w-2xl">
              Undergraduate Computer Science and Data Science student focused on learning design and educational technology.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              href="/learning-design"
              className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              View Learning Design Portfolio →
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-12 grid md:grid-cols-2 gap-6">
            <Link 
              href="/learning-design" 
              className="p-6 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Learning Design Portfolio</h2>
              <p className="text-stone-500 text-sm">
                Designing for students who disengage quietly: feedback loops, psychological safety, and practice environments.
              </p>
            </Link>

            <a 
              href="https://github.com/mrassell" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-2">GitHub</h2>
              <p className="text-stone-500 text-sm">
                View my technical projects and code.
              </p>
            </a>

            <a 
              href="https://www.linkedin.com/in/mrassell/" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-2">LinkedIn</h2>
              <p className="text-stone-500 text-sm">
                Connect with me professionally.
              </p>
            </a>

            <a 
              href="mailto:mr6761@nyu.edu"
              className="p-6 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Contact</h2>
              <p className="text-stone-500 text-sm">
                mr6761@nyu.edu
              </p>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-stone-400">
          © {new Date().getFullYear()} Maheen Rassell
        </div>
      </footer>
    </div>
  );
}

