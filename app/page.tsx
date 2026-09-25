'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import BasketballGame from './components/BasketballGame';

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-brutal rounded-2xl overflow-hidden bg-white shadow-brutal">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left bg-brutal-lavender hover:bg-brutal-purple transition-colors border-b-brutal"
      >
        <h3 className="text-2xl font-bold text-black">{title}</h3>
        <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

interface ExperienceCardProps {
  title: string;
  company: string;
  date?: string;
  location?: string;
  children: ReactNode;
}

function ExperienceCard({ title, company, date, location, children }: ExperienceCardProps) {
  return (
    <div className="bg-brutal-yellow rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
        <div>
          <h4 className="text-xl font-bold text-black">{title}</h4>
          <p className="text-black font-semibold text-base mt-1">{company}</p>
        </div>
        <div className="text-right">
          <span className="text-black text-sm font-medium">{date}</span>
          {location && <p className="text-black/70 text-sm mt-1">{location}</p>}
        </div>
      </div>
      <p className="text-black text-base leading-relaxed">{children}</p>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  children: ReactNode;
}

function ProjectCard({ title, children }: ProjectCardProps) {
  return (
    <div className="bg-brutal-lime rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
      <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
      <p className="text-black text-base leading-relaxed">{children}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brutal-lavender">
      {/* Header */}
      <header className="border-b-brutal bg-brutal-orange backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-5 flex items-center justify-between">
          <span className="font-bold text-black text-lg md:text-2xl">mrassell.com</span>
          <nav className="flex gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base font-bold">
            <Link href="/" className="text-black hover:underline hover:decoration-4 transition-all">Home</Link>
            <Link href="/learning-design" className="text-black hover:underline hover:decoration-4 transition-all whitespace-nowrap">Portfolio</Link>
            <Link href="/explore" className="text-black hover:underline hover:decoration-4 transition-all whitespace-nowrap">Explore</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <section className="relative overflow-hidden rounded-2xl border-brutal-thick shadow-brutal-xl bg-brutal-pink">
            {/* Mobile layout: game on top */}
            <div className="lg:hidden">
              <div className="flex items-center justify-center py-6 border-b-brutal">
                <BasketballGame />
              </div>
              <div className="p-6 space-y-4">
                <h1 className="text-4xl font-black text-black tracking-tight leading-none">
                  Hi, I'm Maheen
                </h1>
                <p className="text-base text-black leading-relaxed font-semibold">
                  I build things at the intersection of code and learning. Master's student in Learning Design, Innovation and Technology at Harvard, with a BA in Computer Science and Data Science from NYU.
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-bold text-black">
                  <a href="mailto:maheenrassell@gse.harvard.edu" className="hover:underline hover:decoration-4 transition-all">Email</a>
                  <a href="https://github.com/mrassell" target="_blank" rel="noopener noreferrer" className="hover:underline hover:decoration-4 transition-all">GitHub</a>
                  <a href="https://www.linkedin.com/in/mrassell/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:decoration-4 transition-all">LinkedIn</a>
                </div>
              </div>
            </div>
            
            {/* Desktop layout: side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center min-h-[560px] p-12">
              <div className="space-y-6 z-10">
                <h1 className="text-6xl sm:text-7xl font-black text-black tracking-tight leading-none">
                  Hi, I'm Maheen
                </h1>
                <p className="text-xl sm:text-2xl text-black leading-relaxed font-semibold">
                  I build things at the intersection of code and learning. Master's student in Learning Design, Innovation and Technology at Harvard, with a BA in Computer Science and Data Science from NYU,
                  but really I'm just someone who gets excited about making technology that helps people learn better—especially
                  those who tend to go quiet when they feel behind.
                </p>
                <div className="flex flex-wrap gap-4 text-base font-bold text-black">
                  <a href="mailto:maheenrassell@gse.harvard.edu" className="hover:underline hover:decoration-4 transition-all">maheenrassell@gse.harvard.edu</a>
                  <a href="https://mrassell.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:decoration-4 transition-all">mrassell.com</a>
                  <a href="https://github.com/mrassell" target="_blank" rel="noopener noreferrer" className="hover:underline hover:decoration-4 transition-all">GitHub</a>
                  <a href="https://www.linkedin.com/in/mrassell/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:decoration-4 transition-all">LinkedIn</a>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <BasketballGame />
              </div>
            </div>
          </section>

          {/* Work Experience */}
          <AccordionSection title="Where I've Built" defaultOpen={true}>
            <div className="space-y-4">
              <ExperienceCard
                title="Graduate Research Engineer"
                company="Harvard Graduate School of Education"
                date="Present"
                location="Cambridge, MA"
              >
                Graduate research engineering at the Harvard Graduate School of Education.
              </ExperienceCard>

              <ExperienceCard
                title="Backend Developer"
                company="Human Flourishing Program at Harvard"
                date="Present"
                location="Cambridge, MA"
              >
                Backend development for the Human Flourishing Program at Harvard.
              </ExperienceCard>

              <ExperienceCard
                title="Software Engineer (Part-time)"
                company="Zencube"
                date="Present"
              >
                Software engineering on a physical mental health device.
              </ExperienceCard>

              <ExperienceCard
                title="Data Engineering Intern"
                company="Lexor Strategies"
                date="May 2025 - Aug 2025"
                location="New York, NY"
              >
                Built end-to-end data pipelines using Supabase and SQL to automate client reporting workflows for real-estate 
                and marketing teams, cutting delivery time from ~2 days to same-day. 
                Designed and deployed ETL automation scripts in Python that <span className="font-semibold text-stone-900">improved 
                data processing speed by ~100%</span> and reduced manual errors in deliverables. 
                Eliminated <span className="font-semibold text-stone-900">20+ hours/week of manual data work</span> by engineering 
                LLM-powered automation tools (Claude Cowork) to handle repetitive data extraction and formatting tasks.
              </ExperienceCard>

              <ExperienceCard
                title="Teaching Assistant"
                company="City Tech College"
                date="Jul 2025 - Aug 2025"
                location="New York, NY"
              >
                Instructed <span className="font-semibold text-stone-900">50+ students</span> on AI/ML fundamentals 
                funded by the Tsai Social Justice Fund. Facilitated coding labs across 10 intensive sessions, maintaining 
                consistent participation and positive evaluations. Presented student projects (natural language processing, 
                computer vision) for nonprofit leaders.
              </ExperienceCard>

              <ExperienceCard
                title="Fullstack Developer"
                company="Simply Friendly, Inc."
                date="Jan 2025 - Apr 2025"
                location="New York, NY"
              >
                Increased relevance of student club recommendations by analyzing <span className="font-semibold text-stone-900">5,000+ 
                interaction records</span> on an AI-driven matchmaking platform built with Next.js, React Native, and AWS Amplify. 
                Boosted real-time engagement across student organizations by implementing WebSocket chat for 100+ beta users, 
                reliably supporting <span className="font-semibold text-stone-900">30+ concurrent testers</span> without downtime.
              </ExperienceCard>

              <ExperienceCard
                title="Software Engineering Intern"
                company="Passengers United"
                date="May 2024 - Present"
                location="New York, NY"
              >
                Designing a React Native app to enhance safety and provide convenience for NYC public transit users. 
                Aggregating live traffic and safety updates from the MTA and crowd-sourced data into a 
                <span className="font-semibold text-stone-900"> real-time delays dashboard</span>.
              </ExperienceCard>

              <ExperienceCard
                title="Software Developer"
                company="Buildspace"
                date="Jun 2024 - Jul 2024"
                location="Remote"
              >
                Developed a neural network model from scratch (no TensorFlow or PyTorch) using NumPy to classify 
                handwritten digits from the MNIST dataset, achieving <span className="font-semibold text-stone-900">85% accuracy</span>. 
                Preprocessed and normalized dataset of 60,000 training images and 10,000 testing images with pandas. 
                Implemented ReLU and softmax activation functions and fine-tuned hyperparameters to optimize model performance.
              </ExperienceCard>

              <ExperienceCard
                title="Web Development and Graphic Design Intern"
                company="Verste"
              >
                Developed infographics and flyers to increase interaction on social media for a non-profit. 
                Collaborated with team to edit and draft website in HTML, CSS, and JavaScript. 
                Simplified over <span className="font-semibold text-stone-900">15 research articles</span> for website content.
              </ExperienceCard>
            </div>
          </AccordionSection>

          {/* Leadership */}
          <AccordionSection title="Leading & Mentoring">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-brutal-blue rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
                <h4 className="text-xl font-bold text-black mb-2">Co-President</h4>
                <p className="text-black font-semibold text-base mb-1">HGSE Venture Capital & Entrepreneurship Club</p>
                <p className="text-black/70 text-sm mb-3">Present</p>
                <p className="text-black text-base leading-relaxed">
                  Starting the school's own student venture fund, and hosting founder and investor networking events for 
                  <span className="font-black text-black"> 80+ people</span>.
                </p>
              </div>

              <div className="bg-brutal-purple rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
                <h4 className="text-xl font-bold text-black mb-2">Organization Director</h4>
                <p className="text-black font-semibold text-base mb-1">iCreate (Harvard)</p>
                <p className="text-black/70 text-sm mb-3">Present</p>
                <p className="text-black text-base leading-relaxed">
                  Bringing influencers, celebrities, and speakers to give talks at Harvard.
                </p>
              </div>

              <div className="bg-brutal-blue rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
                <h4 className="text-xl font-bold text-black mb-2">Head Developer</h4>
                <p className="text-black font-semibold text-base mb-1">Google Developer Group</p>
                <p className="text-black/70 text-sm mb-3">Sep 2025 - Present</p>
                <p className="text-black text-base leading-relaxed">
                  Leading a team of 5 to build an NFL outcome prediction app, engineering data pipelines to ingest and transform 
                  historical game stats via public APIs into BigQuery for downstream model training. Built Python ETL scripts to 
                  clean and aggregate player and team metrics across <span className="font-black text-black">10+ seasons</span>, 
                  enabling feature engineering for an XGBoost classification model with real-time prediction output.
                </p>
              </div>

              <div className="bg-brutal-purple rounded-xl border-brutal p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200">
                <h4 className="text-xl font-bold text-black mb-2">Mentor</h4>
                <p className="text-black font-semibold text-base mb-1">Tech @ NYU</p>
                <p className="text-black/70 text-sm mb-3">Sep 2024 - May 2025</p>
                <p className="text-black text-base leading-relaxed">
                  Mentored <span className="font-black text-black">30+ students</span> on SWE fundamentals and Git workflows 
                  through weekly office hours, increasing attendance by <span className="font-black text-black">~50%</span> over 
                  the academic year. Led an introductory SQL workshop covering query writing, data filtering, and aggregation 
                  fundamentals for students with no prior database experience.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* Projects */}
          <AccordionSection title="Projects">
            <div className="space-y-4">
              <ProjectCard title="Aurangzeb — E-Commerce Website">
                Developed an interactive online storefront with Next.js, using PostgreSQL and Prisma for database management 
                to handle product listings, secure order workflows through Webhook endpoints, and payment processing with Stripe. 
                Integrated <span className="font-semibold text-stone-900">React-Three-Fiber for 3D apparel previews</span> and built 
                a comprehensive admin dashboard styled with Tailwind CSS to streamline product drops and inventory customization.
              </ProjectCard>

              <ProjectCard title="Kalendar">
                Developed an app with Next.js using Postgres Realtime features to create a unique calendar experience for friends. 
                Generated <span className="font-semibold text-stone-900">high demand with a 50-person waitlist</span> due to popularity.
              </ProjectCard>

              <ProjectCard title="Inventory Manager Web App">
                Built a web application for managing pantry and storage items using Next.js and Majuro UI components, 
                incorporating full CRUD (Create, Read, Update, Delete) functionalities to enhance inventory management. 
                Integrated Firebase for real-time data synchronization and persistent local caching with Firestore, ensuring 
                reliable performance and offline accessibility.
              </ProjectCard>

              <ProjectCard title="AI Chatbot">
                Developed an AI chatbot integrated with OpenAI's GPT-4, implementing system prompts for clear and respectful 
                user interactions and accurate answers.
              </ProjectCard>
            </div>
          </AccordionSection>

          {/* Hackathon Wins */}
          <AccordionSection title="Hackathon Wins" defaultOpen={true}>
            <div className="space-y-4">
              <div className="bg-brutal-orange rounded-xl border-brutal-thick p-6 shadow-brutal-lg">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h4 className="text-xl font-bold text-black">Realtime AI Debate Platform</h4>
                  <span className="px-4 py-2 bg-black text-white text-sm font-black rounded-full border-brutal">🏆 WINNER</span>
                </div>
                <p className="text-black font-bold text-sm mb-3">Brown University Hackathon 2025</p>
                <p className="text-black text-base leading-relaxed">
                  Built a Vite-based AI debate platform that used OpenAI GPT to analyze arguments, select winners, and stream 
                  real-time feedback via MongoDB. Implemented custom Express.js routes to handle livestreams transcribing debates.
                </p>
              </div>

              <div className="bg-brutal-blue rounded-xl border-brutal-thick p-6 shadow-brutal-lg">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h4 className="text-xl font-bold text-black">Story Generation Web App</h4>
                  <span className="px-4 py-2 bg-black text-white text-sm font-black rounded-full border-brutal">⭐ TOP 5</span>
                </div>
                <p className="text-black font-bold text-sm mb-3">NVIDIA x Vercel Hackathon 2025</p>
                <p className="text-black text-base leading-relaxed">
                  Built a Next.js 15 story-generation app with React 19 and Tailwind UI to create personalized children's comics 
                  from user prompts. Orchestrated multi-step AI pipelines using NVIDIA NIM VLMs (Llama 3.3, Consistency NIM), 
                  with TypeScript APIs and image-validation middleware for robust error handling.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* Learning Design Portfolio */}
          <section className="bg-brutal-lime rounded-2xl border-brutal-thick p-8 shadow-brutal-xl">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-black">Learning Design Work</h2>
              <p className="text-black text-lg leading-relaxed font-semibold">
                I also spend a lot of time thinking about how people learn—especially students who disengage quietly. 
                My learning design portfolio explores feedback loops, psychological safety, and practice environments 
                that make revision feel normal.
              </p>
              <Link 
                href="/learning-design"
                className="inline-block bg-black text-white px-8 py-4 rounded-xl font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-brutal transition-all duration-200 border-brutal"
              >
                View Learning Design Portfolio →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-brutal mt-20 bg-black">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-lg font-bold text-white">
          © {new Date().getFullYear()} Maheen Rassell
        </div>
      </footer>
    </div>
  );
}
