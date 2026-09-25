export interface SectionItem {
  heading: string;
  org?: string;
  meta?: string;
  badge?: string;
  body: string;
}

export interface SectionLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Section {
  id: string;
  title: string;
  tagline: string;
  color: string;
  intro?: string;
  items: SectionItem[];
  links?: SectionLink[];
}

export const SECTIONS: Section[] = [
  {
    id: 'about',
    title: 'About Me',
    tagline: 'Code × learning',
    color: '#e07a5f',
    intro:
      "I build things at the intersection of code and learning. Master's student in Learning Design, Innovation and Technology at Harvard, but really I'm just someone who gets excited about making technology that helps people learn better—especially those who tend to go quiet when they feel behind.",
    items: [],
    links: [
      { label: 'maheenrassell@gse.harvard.edu', href: 'mailto:maheenrassell@gse.harvard.edu' },
      { label: 'GitHub', href: 'https://github.com/mrassell', external: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mrassell/', external: true },
    ],
  },
  {
    id: 'experience',
    title: 'Experience',
    tagline: "Where I've built",
    color: '#3d5a80',
    items: [
      {
        heading: 'Graduate Research Engineer',
        org: 'Harvard Graduate School of Education',
        meta: 'Present · Cambridge, MA',
        body: 'Graduate research engineering at the Harvard Graduate School of Education.',
      },
      {
        heading: 'Backend Developer',
        org: 'Human Flourishing Program at Harvard',
        meta: 'Present · Cambridge, MA',
        body: 'Backend development for the Human Flourishing Program at Harvard.',
      },
      {
        heading: 'Software Engineer (Part-time)',
        org: 'Zencube',
        meta: 'Present',
        body: 'Software engineering on a physical mental health device.',
      },
      {
        heading: 'Data Engineering Intern',
        org: 'Lexor Strategies',
        meta: 'May 2025 – Aug 2025 · New York, NY',
        body: 'Built end-to-end data pipelines using Supabase and SQL to automate client reporting workflows, cutting delivery time from ~2 days to same-day. Designed ETL automation scripts in Python that improved data processing speed by ~100% and eliminated 20+ hours/week of manual data work with LLM-powered automation tools.',
      },
      {
        heading: 'Teaching Assistant',
        org: 'City Tech College',
        meta: 'Jul 2025 – Aug 2025 · New York, NY',
        body: 'Instructed 50+ students on AI/ML fundamentals funded by the Tsai Social Justice Fund across 10 intensive lab sessions, and presented student NLP and computer vision projects to nonprofit leaders.',
      },
      {
        heading: 'Fullstack Developer',
        org: 'Simply Friendly, Inc.',
        meta: 'Jan 2025 – Apr 2025 · New York, NY',
        body: 'Increased relevance of student club recommendations by analyzing 5,000+ interaction records on an AI-driven matchmaking platform built with Next.js, React Native, and AWS Amplify. Implemented WebSocket chat for 100+ beta users, reliably supporting 30+ concurrent testers without downtime.',
      },
      {
        heading: 'Software Engineering Intern',
        org: 'Passengers United',
        meta: 'May 2024 – Present · New York, NY',
        body: 'Designing a React Native app for NYC transit safety, aggregating live MTA and crowd-sourced data into a real-time delays dashboard.',
      },
      {
        heading: 'Software Developer',
        org: 'Buildspace',
        meta: 'Jun 2024 – Jul 2024 · Remote',
        body: 'Built a neural network from scratch in NumPy (no TensorFlow/PyTorch) to classify MNIST digits at 85% accuracy, with custom ReLU/softmax and hyperparameter tuning.',
      },
      {
        heading: 'Web Development & Graphic Design Intern',
        org: 'Verste',
        body: 'Designed infographics and flyers for a nonprofit, built site pages in HTML/CSS/JS, and simplified 15+ research articles for web content.',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    tagline: 'Things I made',
    color: '#5b8e7d',
    items: [
      {
        heading: 'Aurangzeb — E-Commerce',
        body: 'Next.js storefront with PostgreSQL + Prisma, Stripe payments, webhook order workflows, React-Three-Fiber 3D apparel previews, and a Tailwind admin dashboard.',
      },
      {
        heading: 'Kalendar',
        body: 'A social calendar for friends built on Next.js and Postgres Realtime. Built up a 50-person waitlist.',
      },
      {
        heading: 'Inventory Manager',
        body: 'Pantry/storage manager in Next.js with full CRUD, Firebase real-time sync, and offline Firestore caching.',
      },
      {
        heading: 'AI Chatbot',
        body: "GPT-4 chatbot with system prompts tuned for clear, respectful, accurate answers.",
      },
    ],
  },
  {
    id: 'hackathons',
    title: 'Hackathons',
    tagline: 'Wins & podiums',
    color: '#d4a24c',
    items: [
      {
        heading: 'Realtime AI Debate Platform',
        badge: 'Winner',
        meta: 'Brown University Hackathon 2025',
        body: 'Built a Vite-based AI debate platform that used OpenAI GPT to analyze arguments, select winners, and stream real-time feedback via MongoDB. Implemented custom Express.js routes to handle livestreams transcribing debates.',
      },
      {
        heading: 'Story Generation Web App',
        badge: 'Top 5',
        meta: 'NVIDIA × Vercel Hackathon 2025',
        body: "Built a Next.js 15 story-generation app with React 19 and Tailwind UI to create personalized children's comics from user prompts. Orchestrated multi-step AI pipelines using NVIDIA NIM VLMs (Llama 3.3, Consistency NIM), with TypeScript APIs and image-validation middleware for robust error handling.",
      },
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership',
    tagline: 'Leading & mentoring',
    color: '#7b5e8a',
    items: [
      {
        heading: 'Co-President',
        org: 'HGSE Venture Capital & Entrepreneurship Club',
        meta: 'Present',
        body: "Starting the school's own student venture fund, and hosting founder and investor networking events for 80+ people.",
      },
      {
        heading: 'Organization Director',
        org: 'iCreate (Harvard)',
        meta: 'Present',
        body: 'Bringing influencers, celebrities, and speakers to give talks at Harvard.',
      },
      {
        heading: 'Head Developer',
        org: 'Google Developer Group',
        meta: 'Sep 2025 – Present',
        body: 'Leading a team of 5 to build an NFL outcome prediction app, engineering data pipelines to ingest and transform historical game stats via public APIs into BigQuery for downstream model training. Built Python ETL scripts to clean and aggregate player and team metrics across 10+ seasons, enabling feature engineering for an XGBoost classification model with real-time prediction output.',
      },
      {
        heading: 'Mentor',
        org: 'Tech @ NYU',
        meta: 'Sep 2024 – May 2025',
        body: 'Mentored 30+ students on SWE fundamentals and Git workflows through weekly office hours, increasing attendance by ~50% over the academic year. Led an introductory SQL workshop covering query writing, data filtering, and aggregation fundamentals for students with no prior database experience.',
      },
    ],
  },
  {
    id: 'learning',
    title: 'Learning Design',
    tagline: 'How people learn',
    color: '#3f8f9f',
    intro:
      'I spend a lot of time thinking about how people learn—especially students who disengage quietly. My learning design portfolio explores feedback loops, psychological safety, and practice environments that make revision feel normal.',
    items: [],
    links: [{ label: 'Open the Learning Design portfolio →', href: '/learning-design' }],
  },
];

export const STATION_RADIUS = 16;

export function stationPosition(index: number, total = SECTIONS.length): [number, number] {
  // Offset half a step from north so no station sits between the follow camera and the plaza.
  const angle = -Math.PI / 2 + ((index + 0.5) / total) * Math.PI * 2;
  return [Math.cos(angle) * STATION_RADIUS, Math.sin(angle) * STATION_RADIUS];
}
