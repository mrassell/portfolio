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
      "I build things at the intersection of code and learning. Currently a CS & Data Science student at NYU, but really I'm just someone who gets excited about making technology that helps people learn better—especially those who tend to go quiet when they feel behind.",
    items: [],
    links: [
      { label: 'mr6761@nyu.edu', href: 'mailto:mr6761@nyu.edu' },
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
        heading: 'Software Engineering Intern',
        org: 'Lexor Strategies',
        meta: 'May 2025 – Aug 2025 · New York, NY',
        body: 'Built full-stack web apps with React, Tailwind CSS, and Supabase. Deployed automation pipelines that accelerated reporting turnaround by 100%, and LLM-powered internal tools that saved 20+ hours of team effort each week.',
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
        body: 'Built an AI-driven matchmaking platform on AWS Amplify (Next.js + React Native) analyzing 5,000+ interaction records, plus WebSocket chat for 100+ beta users.',
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
        body: 'Vite web app for student debates using GPT to analyze talking points, pick winners, and give live feedback, streaming via MongoDB and custom Express routes.',
      },
      {
        heading: 'Story Generation Web App',
        badge: 'Top 5',
        meta: 'NVIDIA × Vercel Hackathon 2025',
        body: "Next.js 15 + React 19 app generating personalized children's comics with NVIDIA NIM vision-language models and multi-step Llama 3.3 pipelines.",
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
        heading: 'Head Developer',
        org: 'Google Developer Group',
        meta: 'Sep 2025 – Present',
        body: 'Leading a team of 5 building a React app with custom ML pipelines to predict NFL outcomes. Selected from thousands of NYU applicants.',
      },
      {
        heading: 'Mentor',
        org: 'Tech @ NYU',
        meta: 'Sep 2024 – May 2025',
        body: 'Held office hours for 30+ students on SWE fundamentals and version control, and led networking workshops that boosted club engagement by 50%.',
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
