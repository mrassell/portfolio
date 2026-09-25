'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, type ReactNode } from 'react';

interface AnimatedTileProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function AnimatedTile({ children, delay = 0, className = '' }: AnimatedTileProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ExperienceItemProps {
  title: string;
  company: string;
  date?: string;
  location?: string;
  children: ReactNode;
}

function ExperienceItem({ title, company, date, location, children }: ExperienceItemProps) {
  return (
    <div className="p-4 mb-3 rounded-xl neu-inset-tile">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
        <div>
          <h4 className="text-base md:text-lg font-bold text-neu-text">{title}</h4>
          <p className="text-neu-text font-semibold text-sm md:text-base">{company}</p>
        </div>
        <div className="text-right text-xs md:text-sm">
          <span className="text-neu-text-light font-medium">{date}</span>
          {location && <p className="text-neu-text-light/70 mt-0.5">{location}</p>}
        </div>
      </div>
      <p className="text-neu-text-light text-sm md:text-base leading-relaxed">{children}</p>
    </div>
  );
}

function HeroNameAnimation() {
  const [isAnimating, setIsAnimating] = useState(true);
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const name = "Hi, I'm Maheen";
  
  if (prefersReducedMotion) {
    return <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-neu-text tracking-tight leading-none">{name}</h1>;
  }

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-neu-text tracking-tight leading-none">
      {name.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: isAnimating ? `fadeInChar 0.6s ease forwards ${i * 0.05}s` : 'none',
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}

export default function HomePage() {
  const [bioVisible, setBioVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => {
      setBioVisible(true);
    }, prefersReducedMotion ? 0 : 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInChar {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="min-h-screen neu-page">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-neu-base/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <span className="font-bold text-neu-text text-lg md:text-xl">mrassell.com</span>
            <nav className="flex gap-4 md:gap-8 text-sm md:text-base font-semibold">
              <Link href="/" className="text-neu-text hover:text-neu-accent transition-colors">Home</Link>
              <Link href="/learning-design" className="text-neu-text hover:text-neu-accent transition-colors">Portfolio</Link>
              <Link href="/explore" className="text-neu-text hover:text-neu-accent transition-colors">Explore</Link>
            </nav>
          </div>
        </header>

        {/* Main Content - Bento Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-auto">
            
            {/* Hero Tile - Large */}
            <div className="lg:col-span-12 neu-tile p-6 md:p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neu-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <HeroNameAnimation />
                <div
                  className={`transition-all duration-1000 ${
                    bioVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p className="text-base sm:text-lg lg:text-xl text-neu-text-light leading-relaxed max-w-4xl">
                    Harvard Master's student in Edtech, who finished a BA in Computer Science + Data Science at NYU in 3 years. Winner of the Brown University Hackathon 2025 and Top 5 at the NVIDIA x Vercel Hackathon 2025. I love building agentic workflows and making technology that helps people learn better—especially those who tend to go quiet when they feel behind.
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-4 mt-6 text-sm md:text-base font-semibold">
                    <a href="mailto:maheenrassell@gse.harvard.edu" className="text-neu-accent hover:text-neu-accent-light transition-colors">maheenrassell@gse.harvard.edu</a>
                    <a href="https://mrassell.com" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors">mrassell.com</a>
                    <a href="https://github.com/mrassell" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors">GitHub</a>
                    <a href="https://www.linkedin.com/in/mrassell/" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors">LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Roles - 3 Cards */}
            <AnimatedTile delay={100} className="lg:col-span-4 neu-tile p-5 md:p-6">
              <div className="h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neu-accent to-neu-accent-light mb-4 flex items-center justify-center text-white font-bold text-xl shadow-neu-flat">
                  🎓
                </div>
                <h3 className="text-lg md:text-xl font-bold text-neu-text mb-2">Graduate Research Engineer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Harvard Graduate School of Education</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present · Cambridge, MA</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed">Graduate research engineering at the Harvard Graduate School of Education.</p>
              </div>
            </AnimatedTile>

            <AnimatedTile delay={200} className="lg:col-span-4 neu-tile p-5 md:p-6">
              <div className="h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neu-accent to-neu-accent-light mb-4 flex items-center justify-center text-white font-bold text-xl shadow-neu-flat">
                  💻
                </div>
                <h3 className="text-lg md:text-xl font-bold text-neu-text mb-2">Backend Developer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Human Flourishing Program at Harvard</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present · Cambridge, MA</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed">Backend development for the Human Flourishing Program at Harvard.</p>
              </div>
            </AnimatedTile>

            <AnimatedTile delay={300} className="lg:col-span-4 neu-tile p-5 md:p-6">
              <div className="h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neu-accent to-neu-accent-light mb-4 flex items-center justify-center text-white font-bold text-xl shadow-neu-flat">
                  🧠
                </div>
                <h3 className="text-lg md:text-xl font-bold text-neu-text mb-2">Software Engineer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Zencube</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present (Part-time)</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed">Software engineering on a physical mental health device.</p>
              </div>
            </AnimatedTile>

            {/* Experience - Tall scrollable tile */}
            <AnimatedTile delay={400} className="lg:col-span-7 neu-tile p-5 md:p-7">
              <h2 className="text-2xl md:text-3xl font-black text-neu-text mb-5 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-neu-accent to-neu-accent-light rounded-full" />
                Where I've Built
              </h2>
              <div className="neu-scroll-tile overflow-y-auto max-h-[600px] pr-2">
                <ExperienceItem
                  title="Data Engineering Intern"
                  company="Lexor Strategies"
                  date="May 2025 - Aug 2025"
                  location="New York, NY"
                >
                  Built end-to-end data pipelines using Supabase and SQL to automate client reporting workflows for real-estate 
                  and marketing teams, cutting delivery time from ~2 days to same-day. 
                  Designed and deployed ETL automation scripts in Python that <span className="font-semibold text-neu-text">improved 
                  data processing speed by ~100%</span> and reduced manual errors in deliverables. 
                  Eliminated <span className="font-semibold text-neu-text">20+ hours/week of manual data work</span> by engineering 
                  LLM-powered automation tools (Claude Cowork) to handle repetitive data extraction and formatting tasks.
                </ExperienceItem>

                <ExperienceItem
                  title="Teaching Assistant"
                  company="City Tech College"
                  date="Jul 2025 - Aug 2025"
                  location="New York, NY"
                >
                  Instructed <span className="font-semibold text-neu-text">50+ students</span> on AI/ML fundamentals 
                  funded by the Tsai Social Justice Fund. Facilitated coding labs across 10 intensive sessions, maintaining 
                  consistent participation and positive evaluations. Presented student projects (natural language processing, 
                  computer vision) for nonprofit leaders.
                </ExperienceItem>

                <ExperienceItem
                  title="Fullstack Developer"
                  company="Simply Friendly, Inc."
                  date="Jan 2025 - Apr 2025"
                  location="New York, NY"
                >
                  Increased relevance of student club recommendations by analyzing <span className="font-semibold text-neu-text">5,000+ 
                  interaction records</span> on an AI-driven matchmaking platform built with Next.js, React Native, and AWS Amplify. 
                  Boosted real-time engagement across student organizations by implementing WebSocket chat for 100+ beta users, 
                  reliably supporting <span className="font-semibold text-neu-text">30+ concurrent testers</span> without downtime.
                </ExperienceItem>

                <ExperienceItem
                  title="Software Engineering Intern"
                  company="Passengers United"
                  date="May 2024 - Present"
                  location="New York, NY"
                >
                  Designing a React Native app to enhance safety and provide convenience for NYC public transit users. 
                  Aggregating live traffic and safety updates from the MTA and crowd-sourced data into a 
                  <span className="font-semibold text-neu-text"> real-time delays dashboard</span>.
                </ExperienceItem>

                <ExperienceItem
                  title="Software Developer"
                  company="Buildspace"
                  date="Jun 2024 - Jul 2024"
                  location="Remote"
                >
                  Developed a neural network model from scratch (no TensorFlow or PyTorch) using NumPy to classify 
                  handwritten digits from the MNIST dataset, achieving <span className="font-semibold text-neu-text">85% accuracy</span>. 
                  Preprocessed and normalized dataset of 60,000 training images and 10,000 testing images with pandas. 
                  Implemented ReLU and softmax activation functions and fine-tuned hyperparameters to optimize model performance.
                </ExperienceItem>

                <ExperienceItem
                  title="Web Development and Graphic Design Intern"
                  company="Verste"
                >
                  Developed infographics and flyers to increase interaction on social media for a non-profit. 
                  Collaborated with team to edit and draft website in HTML, CSS, and JavaScript. 
                  Simplified over <span className="font-semibold text-neu-text">15 research articles</span> for website content.
                </ExperienceItem>
              </div>
            </AnimatedTile>

            {/* Leadership Grid */}
            <AnimatedTile delay={500} className="lg:col-span-5 neu-tile p-5 md:p-7">
              <h2 className="text-2xl md:text-3xl font-black text-neu-text mb-5 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-neu-accent to-neu-accent-light rounded-full" />
                Leading & Mentoring
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-1">Co-President</h4>
                  <p className="text-sm md:text-base font-semibold text-neu-text">HGSE Venture Capital & Entrepreneurship Club</p>
                  <p className="text-xs md:text-sm text-neu-text-light mb-2">Present</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Starting the school's own student venture fund, and hosting founder and investor networking events for 
                    <span className="font-bold text-neu-text"> 80+ people</span>.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-1">Organization Director</h4>
                  <p className="text-sm md:text-base font-semibold text-neu-text">iCreate (Harvard)</p>
                  <p className="text-xs md:text-sm text-neu-text-light mb-2">Present</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Bringing influencers, celebrities, and speakers to give talks at Harvard.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-1">Head Developer</h4>
                  <p className="text-sm md:text-base font-semibold text-neu-text">Google Developer Group</p>
                  <p className="text-xs md:text-sm text-neu-text-light mb-2">Sep 2025 - Present</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Leading a team of 5 to build an NFL outcome prediction app, engineering data pipelines to ingest and transform 
                    historical game stats via public APIs into BigQuery for downstream model training. Built Python ETL scripts to 
                    clean and aggregate player and team metrics across <span className="font-bold text-neu-text">10+ seasons</span>, 
                    enabling feature engineering for an XGBoost classification model with real-time prediction output.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-1">Mentor</h4>
                  <p className="text-sm md:text-base font-semibold text-neu-text">Tech @ NYU</p>
                  <p className="text-xs md:text-sm text-neu-text-light mb-2">Sep 2024 - May 2025</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Mentored <span className="font-bold text-neu-text">30+ students</span> on SWE fundamentals and Git workflows 
                    through weekly office hours, increasing attendance by <span className="font-bold text-neu-text">~50%</span> over 
                    the academic year. Led an introductory SQL workshop covering query writing, data filtering, and aggregation 
                    fundamentals for students with no prior database experience.
                  </p>
                </div>
              </div>
            </AnimatedTile>

            {/* Hackathon Wins - Prominent */}
            <AnimatedTile delay={600} className="lg:col-span-6 neu-tile p-6 md:p-8 bg-gradient-to-br from-neu-base to-neu-accent/5">
              <h2 className="text-2xl md:text-3xl font-black text-neu-text mb-5 flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                Hackathon Wins
              </h2>
              <div className="space-y-5">
                <div className="p-5 rounded-xl neu-inset-tile border-2 border-neu-accent/20">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h4 className="text-lg md:text-xl font-bold text-neu-text">Realtime AI Debate Platform</h4>
                    <span className="px-3 py-1 bg-gradient-to-r from-neu-accent to-neu-accent-light text-white text-xs font-black rounded-full shadow-neu-flat">WINNER</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-neu-accent mb-2">Brown University Hackathon 2025</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Built a Vite-based AI debate platform that used OpenAI GPT to analyze arguments, select winners, and stream 
                    real-time feedback via MongoDB. Implemented custom Express.js routes to handle livestreams transcribing debates.
                  </p>
                </div>

                <div className="p-5 rounded-xl neu-inset-tile border-2 border-neu-accent/20">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h4 className="text-lg md:text-xl font-bold text-neu-text">Story Generation Web App</h4>
                    <span className="px-3 py-1 bg-gradient-to-r from-neu-accent to-neu-accent-light text-white text-xs font-black rounded-full shadow-neu-flat">TOP 5</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-neu-accent mb-2">NVIDIA x Vercel Hackathon 2025</p>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Built a Next.js 15 story-generation app with React 19 and Tailwind UI to create personalized children's comics 
                    from user prompts. Orchestrated multi-step AI pipelines using NVIDIA NIM VLMs (Llama 3.3, Consistency NIM), 
                    with TypeScript APIs and image-validation middleware for robust error handling.
                  </p>
                </div>
              </div>
            </AnimatedTile>

            {/* Projects */}
            <AnimatedTile delay={700} className="lg:col-span-6 neu-tile p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-neu-text mb-5 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-neu-accent to-neu-accent-light rounded-full" />
                Projects
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-2">Aurangzeb — E-Commerce Website</h4>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Developed an interactive online storefront with Next.js, using PostgreSQL and Prisma for database management 
                    to handle product listings, secure order workflows through Webhook endpoints, and payment processing with Stripe. 
                    Integrated <span className="font-semibold text-neu-text">React-Three-Fiber for 3D apparel previews</span> and built 
                    a comprehensive admin dashboard styled with Tailwind CSS to streamline product drops and inventory customization.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-2">Kalendar</h4>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Developed an app with Next.js using Postgres Realtime features to create a unique calendar experience for friends. 
                    Generated <span className="font-semibold text-neu-text">high demand with a 50-person waitlist</span> due to popularity.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-2">Inventory Manager Web App</h4>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Built a web application for managing pantry and storage items using Next.js and Majuro UI components, 
                    incorporating full CRUD (Create, Read, Update, Delete) functionalities to enhance inventory management. 
                    Integrated Firebase for real-time data synchronization and persistent local caching with Firestore, ensuring 
                    reliable performance and offline accessibility.
                  </p>
                </div>

                <div className="p-4 rounded-xl neu-inset-tile">
                  <h4 className="text-base md:text-lg font-bold text-neu-text mb-2">AI Chatbot</h4>
                  <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                    Developed an AI chatbot integrated with OpenAI's GPT-4, implementing system prompts for clear and respectful 
                    user interactions and accurate answers.
                  </p>
                </div>
              </div>
            </AnimatedTile>

            {/* Learning Design CTA - Full width */}
            <AnimatedTile delay={800} className="lg:col-span-12 neu-tile p-8 md:p-10 bg-gradient-to-br from-neu-base via-neu-accent/5 to-neu-base relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-neu-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-black text-neu-text mb-4">Learning Design Work</h2>
                <p className="text-base md:text-lg text-neu-text-light leading-relaxed mb-6">
                  I also spend a lot of time thinking about how people learn—especially students who disengage quietly. 
                  My learning design portfolio explores feedback loops, psychological safety, and practice environments 
                  that make revision feel normal.
                </p>
                <Link 
                  href="/learning-design"
                  className="inline-block neu-button text-white px-6 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg"
                >
                  View Learning Design Portfolio →
                </Link>
              </div>
            </AnimatedTile>

          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 md:mt-20 py-8 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <div className="inline-block neu-tile px-8 py-4">
              <p className="text-neu-text-light font-semibold">
                © {new Date().getFullYear()} Maheen Rassell
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
