export type Category = 'work' | 'leadership' | 'hackathon';

export interface Entry {
  id: string;
  role: string;
  org: string;
  category: Category;
  /** Short label for the year column in the index. */
  year: string;
  date?: string;
  location?: string;
  current?: boolean;
  stat?: { value: string; label: string };
  summary: string;
  stack?: string[];
}

export const categoryLabels: Record<Category, string> = {
  work: 'Work',
  leadership: 'Leadership',
  hackathon: 'Hackathon',
};

export const entries: Entry[] = [
  {
    id: 'harvard-gse',
    role: 'Graduate Research Engineer',
    org: 'Harvard Graduate School of Education',
    category: 'work',
    year: 'Now',
    date: 'Present',
    location: 'Cambridge, MA',
    current: true,
    summary: 'Graduate research engineering at the Harvard Graduate School of Education.',
  },
  {
    id: 'human-flourishing',
    role: 'Backend Developer',
    org: 'Human Flourishing Program at Harvard',
    category: 'work',
    year: 'Now',
    date: 'Present',
    location: 'Cambridge, MA',
    current: true,
    summary: 'Backend development for the Human Flourishing Program at Harvard.',
  },
  {
    id: 'zencube',
    role: 'Software Engineer',
    org: 'Zencube',
    category: 'work',
    year: 'Now',
    date: 'Present · Part-time',
    current: true,
    summary: 'Software engineering on a physical mental health device.',
  },
  {
    id: 'hgse-vc',
    role: 'Co-President',
    org: 'HGSE Venture Capital & Entrepreneurship Club',
    category: 'leadership',
    year: 'Now',
    date: 'Present',
    location: 'Cambridge, MA',
    current: true,
    stat: { value: '80+', label: 'founders and investors at our networking events' },
    summary:
      "Starting the school's own student venture fund, and hosting founder and investor networking events.",
  },
  {
    id: 'icreate',
    role: 'Organization Director',
    org: 'iCreate (Harvard)',
    category: 'leadership',
    year: 'Now',
    date: 'Present',
    location: 'Cambridge, MA',
    current: true,
    summary: 'Bringing influencers, celebrities, and speakers to give talks at Harvard.',
  },
  {
    id: 'gdg',
    role: 'Head Developer',
    org: 'Google Developer Group',
    category: 'leadership',
    year: '2025',
    date: 'Sep 2025 – Present',
    current: true,
    stat: { value: '10+', label: 'seasons of NFL game data in the pipeline' },
    summary:
      'Leading a team of 5 to build an NFL outcome prediction app. Engineered data pipelines that ingest historical game stats from public APIs into BigQuery, and Python ETL scripts that clean and aggregate player and team metrics for an XGBoost classifier with real-time prediction output.',
    stack: ['Python', 'BigQuery', 'XGBoost'],
  },
  {
    id: 'lexor',
    role: 'Data Engineering Intern',
    org: 'Lexor Strategies',
    category: 'work',
    year: '2025',
    date: 'May 2025 – Aug 2025',
    location: 'New York, NY',
    stat: { value: '20+', label: 'hours of manual data work eliminated every week' },
    summary:
      'Built end-to-end data pipelines with Supabase and SQL to automate client reporting for real-estate and marketing teams, cutting delivery from ~2 days to same-day. Python ETL automation roughly doubled processing speed, and LLM-powered tools (Claude Cowork) took over repetitive extraction and formatting.',
    stack: ['Supabase', 'SQL', 'Python', 'Claude'],
  },
  {
    id: 'citytech',
    role: 'Teaching Assistant',
    org: 'City Tech College',
    category: 'work',
    year: '2025',
    date: 'Jul 2025 – Aug 2025',
    location: 'New York, NY',
    stat: { value: '50+', label: 'students taught AI/ML fundamentals' },
    summary:
      'Taught AI/ML fundamentals in a program funded by the Tsai Social Justice Fund. Ran coding labs across 10 intensive sessions and presented student projects in NLP and computer vision to nonprofit leaders.',
  },
  {
    id: 'brown-hack',
    role: 'Winner — Realtime AI Debate Platform',
    org: 'Brown University Hackathon',
    category: 'hackathon',
    year: '2025',
    date: '2025',
    stat: { value: '1st', label: 'place at Brown University Hackathon 2025' },
    summary:
      'A Vite-based debate platform that uses GPT to analyze arguments, pick winners, and stream real-time feedback via MongoDB. Custom Express.js routes handle livestreams that transcribe debates as they happen.',
    stack: ['Vite', 'Express', 'MongoDB', 'OpenAI'],
  },
  {
    id: 'nvidia-hack',
    role: 'Top 5 — Story Generation App',
    org: 'NVIDIA x Vercel Hackathon',
    category: 'hackathon',
    year: '2025',
    date: '2025',
    stat: { value: 'Top 5', label: 'finish at NVIDIA x Vercel Hackathon 2025' },
    summary:
      "A Next.js 15 app that turns prompts into personalized children's comics. Multi-step AI pipelines run on NVIDIA NIM VLMs (Llama 3.3, Consistency NIM), with TypeScript APIs and image-validation middleware for robust error handling.",
    stack: ['Next.js', 'React 19', 'NVIDIA NIM', 'TypeScript'],
  },
  {
    id: 'simply-friendly',
    role: 'Fullstack Developer',
    org: 'Simply Friendly, Inc.',
    category: 'work',
    year: '2025',
    date: 'Jan 2025 – Apr 2025',
    location: 'New York, NY',
    stat: { value: '5,000+', label: 'interaction records analyzed for recommendations' },
    summary:
      'Improved student club recommendations on an AI-driven matchmaking platform. Shipped WebSocket chat for 100+ beta users, holding 30+ concurrent testers without downtime.',
    stack: ['Next.js', 'React Native', 'AWS Amplify', 'WebSockets'],
  },
  {
    id: 'tech-nyu',
    role: 'Mentor',
    org: 'Tech @ NYU',
    category: 'leadership',
    year: '2024',
    date: 'Sep 2024 – May 2025',
    location: 'New York, NY',
    stat: { value: '~50%', label: 'rise in office-hours attendance over the year' },
    summary:
      'Mentored 30+ students on SWE fundamentals and Git workflows through weekly office hours, and led an intro SQL workshop for students with no prior database experience.',
    stack: ['Git', 'SQL'],
  },
  {
    id: 'passengers-united',
    role: 'Software Engineering Intern',
    org: 'Passengers United',
    category: 'work',
    year: '2024',
    date: 'May 2024 – Present',
    location: 'New York, NY',
    summary:
      'Designing a React Native app for safer, more convenient NYC transit. Aggregates live MTA traffic and safety updates with crowd-sourced reports into a real-time delays dashboard.',
    stack: ['React Native'],
  },
  {
    id: 'buildspace',
    role: 'Software Developer',
    org: 'Buildspace',
    category: 'work',
    year: '2024',
    date: 'Jun 2024 – Jul 2024',
    location: 'Remote',
    stat: { value: '85%', label: 'MNIST accuracy from a network written without frameworks' },
    summary:
      'Built a neural network from scratch in NumPy (no TensorFlow or PyTorch) to classify handwritten digits. Preprocessed 70,000 images with pandas, implemented ReLU and softmax, and tuned hyperparameters by hand.',
    stack: ['NumPy', 'pandas'],
  },
  {
    id: 'verste',
    role: 'Web Development & Graphic Design Intern',
    org: 'Verste',
    category: 'work',
    year: '—',
    stat: { value: '15', label: 'research articles rewritten for a general audience' },
    summary:
      'Designed infographics and flyers to grow social engagement for a non-profit, and helped draft its website in HTML, CSS, and JavaScript.',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
];

export const projects = [
  {
    name: 'Aurangzeb',
    kind: 'E-commerce',
    summary:
      'Storefront on Next.js, PostgreSQL and Prisma with Stripe payments, webhook-driven order flows, React-Three-Fiber 3D apparel previews, and an admin dashboard for drops and inventory.',
  },
  {
    name: 'Kalendar',
    kind: 'Social calendar',
    summary:
      'A shared calendar for friends built on Next.js and Postgres Realtime. Drew a 50-person waitlist before launch.',
  },
  {
    name: 'Inventory Manager',
    kind: 'Web app',
    summary:
      'Pantry and storage tracker with full CRUD, Firebase real-time sync, and Firestore offline caching.',
  },
  {
    name: 'AI Chatbot',
    kind: 'LLM',
    summary: 'A GPT-4 chatbot with system prompts tuned for clear, respectful, accurate answers.',
  },
];
