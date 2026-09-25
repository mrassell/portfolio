'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, type ReactNode } from 'react';

interface AnimatedTileProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

function AnimatedTile({ children, delay = 0, className = '', style }: AnimatedTileProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        setTimeout(() => setIsVisible(true), delay);
        return;
      }
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
      { 
        threshold: 0.05,
        rootMargin: '100px 0px'
      }
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
      style={{ ...style, opacity: isVisible ? 1 : 0 }}
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
    return <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-neu-text tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>{name}</h1>;
  }

  return (
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-neu-text tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-neu-base/90 border-b border-neu-accent/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <span className="font-bold text-neu-text text-lg md:text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>mrassell.com</span>
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
            <div className="lg:col-span-12 neu-tile p-6 md:p-10 lg:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-neu-accent/20 via-violet-400/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
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
                    <a href="mailto:maheenrassell@gse.harvard.edu" className="text-neu-accent hover:text-neu-accent-light transition-colors underline decoration-2 underline-offset-4">maheenrassell@gse.harvard.edu</a>
                    <a href="https://mrassell.com" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors underline decoration-2 underline-offset-4">mrassell.com</a>
                    <a href="https://github.com/mrassell" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors underline decoration-2 underline-offset-4">GitHub</a>
                    <a href="https://www.linkedin.com/in/mrassell/" target="_blank" rel="noopener noreferrer" className="text-neu-accent hover:text-neu-accent-light transition-colors underline decoration-2 underline-offset-4">LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Roles - 3 Cards with decorative elements */}
            <AnimatedTile delay={100} className="lg:col-span-5 neu-tile p-5 md:p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-neu-accent/15 to-violet-400/10 rounded-full blur-xl" />
              <div className="relative h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neu-accent to-purple-600 mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-neu-accent/30">
                  🎓
                </div>
                <h3 className="text-xl md:text-2xl font-black text-neu-text mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Graduate Research Engineer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Harvard Graduate School of Education</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present · Cambridge, MA</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed flex-grow">Graduate research engineering at the Harvard Graduate School of Education.</p>
              </div>
            </AnimatedTile>

            <AnimatedTile delay={150} className="lg:col-span-3 neu-tile p-5 md:p-6 relative overflow-hidden">
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-pink-400/15 to-transparent rounded-full blur-xl" />
              <div className="relative h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-500/30">
                  💻
                </div>
                <h3 className="text-xl md:text-2xl font-black text-neu-text mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Backend Developer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Human Flourishing Program at Harvard</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present · Cambridge, MA</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed flex-grow">Backend development for the Human Flourishing Program at Harvard.</p>
              </div>
            </AnimatedTile>

            <AnimatedTile delay={200} className="lg:col-span-4 neu-tile p-5 md:p-6 relative overflow-hidden">
              <div className="absolute top-1/2 right-0 w-28 h-28 bg-gradient-to-bl from-neu-accent/20 to-transparent rounded-full blur-2xl" />
              <div className="relative h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-neu-accent mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                  🧠
                </div>
                <h3 className="text-xl md:text-2xl font-black text-neu-text mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Software Engineer</h3>
                <p className="text-sm md:text-base font-semibold text-neu-text mb-1">Zencube</p>
                <p className="text-xs md:text-sm text-neu-text-light">Present (Part-time)</p>
                <p className="text-sm md:text-base text-neu-text-light mt-3 leading-relaxed flex-grow">Software engineering on a physical mental health device.</p>
              </div>
            </AnimatedTile>

            {/* Experience - Tall scrollable tile */}
            <AnimatedTile delay={250} className="lg:col-span-8 neu-tile p-5 md:p-7 relative overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-neu-accent/10 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-neu-text mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="w-2 h-10 bg-gradient-to-b from-neu-accent via-violet-500 to-purple-600 rounded-full shadow-lg shadow-neu-accent/30" />
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
              </div>
            </AnimatedTile>

            {/* Leadership Grid */}
            <AnimatedTile delay={300} className="lg:col-span-4 neu-tile p-5 md:p-7 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-violet-400/15 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-neu-text mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="w-2 h-10 bg-gradient-to-b from-pink-400 via-violet-500 to-neu-accent rounded-full shadow-lg shadow-pink-400/30" />
                  Leading
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl neu-inset-tile relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-gradient-to-br from-neu-accent/10 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <h4 className="text-base md:text-lg font-bold text-neu-text mb-1">Co-President</h4>
                      <p className="text-sm md:text-base font-semibold text-neu-text">HGSE Venture Capital & Entrepreneurship Club</p>
                      <p className="text-xs md:text-sm text-neu-text-light mb-2">Present</p>
                      <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                        Starting the school's own student venture fund, and hosting founder and investor networking events for 
                        <span className="font-bold text-neu-text"> 80+ people</span>.
                      </p>
                    </div>
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
              </div>
            </AnimatedTile>

            {/* Hackathon Wins - Prominent */}
            <AnimatedTile delay={350} className="lg:col-span-7 neu-tile p-6 md:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8ecf0 0%, #f0e8f5 50%, #e8ecf0 100%)' }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-neu-accent/20 to-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-pink-400/15 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-neu-text mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-4xl">🏆</span>
                  Hackathon Wins
                </h2>
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl neu-inset-tile border-2 border-neu-accent/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neu-accent/10 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h4 className="text-lg md:text-xl font-black text-neu-text" style={{ fontFamily: 'Outfit, sans-serif' }}>Realtime AI Debate Platform</h4>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-neu-accent to-violet-600 text-white text-xs font-black rounded-full shadow-lg shadow-neu-accent/40">WINNER</span>
                      </div>
                      <p className="text-xs md:text-sm font-bold text-neu-accent mb-2">Brown University Hackathon 2025</p>
                      <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                        Built a Vite-based AI debate platform that used OpenAI GPT to analyze arguments, select winners, and stream 
                        real-time feedback via MongoDB. Implemented custom Express.js routes to handle livestreams transcribing debates.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl neu-inset-tile border-2 border-violet-400/30 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-400/10 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h4 className="text-lg md:text-xl font-black text-neu-text" style={{ fontFamily: 'Outfit, sans-serif' }}>Story Generation Web App</h4>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-black rounded-full shadow-lg shadow-violet-500/40">TOP 5</span>
                      </div>
                      <p className="text-xs md:text-sm font-bold text-violet-600 mb-2">NVIDIA x Vercel Hackathon 2025</p>
                      <p className="text-sm md:text-base text-neu-text-light leading-relaxed">
                        Built a Next.js 15 story-generation app with React 19 and Tailwind UI to create personalized children's comics 
                        from user prompts. Orchestrated multi-step AI pipelines using NVIDIA NIM VLMs (Llama 3.3, Consistency NIM), 
                        with TypeScript APIs and image-validation middleware for robust error handling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedTile>

            {/* Projects */}
            <AnimatedTile delay={400} className="lg:col-span-5 neu-tile p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-1/3 right-0 w-48 h-48 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-neu-text mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="w-2 h-10 bg-gradient-to-b from-violet-400 via-neu-accent to-indigo-500 rounded-full shadow-lg shadow-violet-400/30" />
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
              </div>
            </AnimatedTile>

            {/* Learning Design CTA - Full width */}
            <AnimatedTile delay={450} className="lg:col-span-12 neu-tile p-8 md:p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8ecf0 0%, #e8f0f5 25%, #f0e8f5 75%, #e8ecf0 100%)' }}>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-neu-accent/15 via-violet-400/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-black text-neu-text mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>Learning Design Work</h2>
                <p className="text-base md:text-lg text-neu-text-light leading-relaxed mb-8">
                  I also spend a lot of time thinking about how people learn—especially students who disengage quietly. 
                  My learning design portfolio explores feedback loops, psychological safety, and practice environments 
                  that make revision feel normal.
                </p>
                <Link 
                  href="/learning-design"
                  className="inline-block neu-button text-white px-8 md:px-10 py-4 md:py-5 font-black text-base md:text-lg rounded-2xl shadow-xl shadow-neu-accent/30 hover:shadow-2xl hover:shadow-neu-accent/40 transition-all"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  View Learning Design Portfolio →
                </Link>
              </div>
            </AnimatedTile>

          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 py-10 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <div className="inline-block neu-tile px-10 py-5 rounded-2xl">
              <p className="text-neu-text-light font-semibold text-base">
                © {new Date().getFullYear()} Maheen Rassell
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
