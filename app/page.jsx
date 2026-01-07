'use client';

import Link from 'next/link';
import { useState } from 'react';

function AccordionSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group"
      >
        <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
        <svg
          className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function ExperienceCard({ title, company, date, location, children }) {
  return (
    <div className="bg-gradient-to-br from-stone-50 to-white rounded-lg border border-stone-200 p-5 hover:border-stone-300 transition-all duration-200">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
        <div>
          <h4 className="text-lg font-semibold text-stone-900">{title}</h4>
          <p className="text-stone-600 font-medium text-sm">{company}</p>
        </div>
        <div className="text-right">
          <span className="text-stone-500 text-xs">{date}</span>
          {location && <p className="text-stone-400 text-xs mt-1">{location}</p>}
        </div>
      </div>
      <p className="text-stone-700 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function ProjectCard({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-stone-50 to-white rounded-lg border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all duration-200">
      <h4 className="text-lg font-semibold text-stone-900 mb-3">{title}</h4>
      <p className="text-stone-700 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-stone-900 text-lg">mrassell.com</span>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">Home</Link>
            <Link href="/learning-design" className="text-stone-600 hover:text-stone-900 transition-colors">Portfolio</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-semibold text-stone-900 tracking-tight bg-gradient-to-r from-stone-900 to-stone-600 bg-clip-text text-transparent">
                Hey, I'm Maheen
              </h1>
              <p className="text-xl text-stone-600 leading-relaxed max-w-3xl">
                I build things at the intersection of code and learning. Currently a CS & Data Science student at NYU, 
                but really I'm just someone who gets excited about making technology that helps people learn better—especially 
                those who tend to go quiet when they feel behind.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                <a href="mailto:mr6761@nyu.edu" className="hover:text-stone-900 hover:underline transition-colors">mr6761@nyu.edu</a>
                <a href="https://mrassell.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 hover:underline transition-colors">mrassell.com</a>
                <a href="https://github.com/mrassell" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 hover:underline transition-colors">GitHub</a>
                <a href="https://www.linkedin.com/in/mrassell/" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 hover:underline transition-colors">LinkedIn</a>
              </div>
            </div>
          </section>

          {/* Work Experience */}
          <AccordionSection title="Where I've Built" defaultOpen={true}>
            <div className="space-y-4">
              <ExperienceCard
                title="Software Engineering Intern"
                company="Lexor Strategies"
                date="May 2025 - Aug 2025"
                location="New York, NY"
              >
                Built full-stack web applications to optimize client workflows using React, Tailwind CSS, and Supabase. 
                Led real-estate and marketing client consultations, scoping system architectures and deploying automation 
                pipelines that <span className="font-semibold text-stone-900">accelerated reporting turnaround by 100%</span>. 
                Designed internal tools and automation workflows using custom LLM integrations that 
                <span className="font-semibold text-stone-900"> saved over 20 hours of team effort each week</span>, 
                saving significant engineering hire costs.
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
                Developed an AI-driven matchmaking platform on AWS Amplify in Next.js and React Native that analyzed 
                <span className="font-semibold text-stone-900"> 5,000+ interaction records</span> to provide more relevant 
                club recommendations for students. Implemented WebSocket-based chat for over 100 beta users, enabling 
                real-time messaging for 30 concurrent testers and improving engagement in student organizations.
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
              <div className="bg-gradient-to-br from-stone-50 to-white rounded-lg border border-stone-200 p-5 hover:border-stone-300 transition-all duration-200">
                <h4 className="text-lg font-semibold text-stone-900 mb-2">Head Developer</h4>
                <p className="text-stone-600 font-medium text-sm mb-1">Google Developer Group</p>
                <p className="text-stone-500 text-xs mb-3">Sep 2025 - Present</p>
                <p className="text-stone-700 text-sm leading-relaxed">
                  Leading a team of 5 to build a React web application integrating custom ML pipelines to predict NFL outcomes. 
                  Selected among thousands of applicants to participate in this program focused on professional/leadership 
                  development at NYU.
                </p>
              </div>

              <div className="bg-gradient-to-br from-stone-50 to-white rounded-lg border border-stone-200 p-5 hover:border-stone-300 transition-all duration-200">
                <h4 className="text-lg font-semibold text-stone-900 mb-2">Mentor</h4>
                <p className="text-stone-600 font-medium text-sm mb-1">Tech @ NYU</p>
                <p className="text-stone-500 text-xs mb-3">Sep 2024 - May 2025</p>
                <p className="text-stone-700 text-sm leading-relaxed">
                  Held office hours and assisted over <span className="font-semibold text-stone-900">30 students</span> on 
                  SWE fundamentals and version control during the week, and led networking workshops that 
                  <span className="font-semibold text-stone-900"> boosted club engagement by 50%</span>.
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
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border-2 border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-stone-900">Realtime AI Debate Platform</h4>
                  <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs font-semibold rounded-full">Winner</span>
                </div>
                <p className="text-stone-600 text-xs mb-3">Brown University Hackathon 2025</p>
                <p className="text-stone-700 text-sm leading-relaxed">
                  Leveraged Vite to rapidly develop a web app facilitating student debates, integrating OpenAI's GPT API to 
                  analyze talking points, determine winners, and provide real-time feedback while streaming data via MongoDB. 
                  Orchestrated backend data handling by creating custom Express.js routes for live streams, ensuring seamless 
                  server–client communication, and driving effective team collaboration.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-2 border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-stone-900">Story Generation Web App</h4>
                  <span className="px-2 py-1 bg-blue-200 text-blue-900 text-xs font-semibold rounded-full">Top 5</span>
                </div>
                <p className="text-stone-600 text-xs mb-3">NVIDIA x Vercel Hackathon 2025</p>
                <p className="text-stone-700 text-sm leading-relaxed">
                  Architected a Next.js 15 full-stack app using React 19 and Tailwind/Radix UI to generate personalized 
                  children's comics, integrating NVIDIA NIM vision-language models for image analysis and story generation. 
                  Built TypeScript API routes with custom image-validation middleware and orchestrated multi-step AI pipelines 
                  using NVIDIA Llama 3.3 and Consistency NIM models with robust error handling.
                </p>
              </div>
            </div>
          </AccordionSection>

          {/* Learning Design Portfolio */}
          <section className="bg-gradient-to-br from-stone-50 to-white rounded-xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-stone-900">Learning Design Work</h2>
              <p className="text-stone-600 leading-relaxed">
                I also spend a lot of time thinking about how people learn—especially students who disengage quietly. 
                My learning design portfolio explores feedback loops, psychological safety, and practice environments 
                that make revision feel normal.
              </p>
              <Link 
                href="/learning-design"
                className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-sm hover:shadow-md"
              >
                View Learning Design Portfolio →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-stone-400">
          © {new Date().getFullYear()} Maheen Rassell
        </div>
      </footer>
    </div>
  );
}
