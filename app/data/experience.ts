export interface Role {
  title: string;
  org: string;
  /** Short mark shown in the logo tile. */
  mark: string;
  /** Tile colours: background and text. */
  tint: [string, string];
  /** e.g. Full-time, Part-time, Internship */
  type?: string;
  /** Months as "YYYY-MM"; no end means present. */
  start?: string;
  end?: string;
  /** Free-text dates when there are no exact months. */
  dates?: string;
  location?: string;
  description?: string;
  website?: { label: string; href: string };
}

// Mirrors the Experience section on LinkedIn, in the same order
export const experience: Role[] = [
  {
    title: 'Founding Engineer',
    org: 'Amoeba',
    mark: 'A',
    tint: ['#e3ebfa', '#4f6fb5'],
    start: '2026-06',
    description: 'multiplayer AI IDE for teams',
    website: { label: 'useamoeba.com', href: 'https://useamoeba.com' },
  },
  {
    title: 'Chief Technology Officer',
    org: 'Zen Cube Wellness Technologies Inc.',
    mark: 'ZC',
    tint: ['#dff2e8', '#3f8f6c'],
    start: '2026-10',
    description: 'wellness technology: a multisensory, portable sanctuary for calm',
    website: { label: 'zencube.co', href: 'https://zencube.co' },
  },
  {
    title: 'Graduate Research Assistant',
    org: 'Harvard Graduate School of Education',
    mark: 'H',
    tint: ['#f8dfe4', '#a51c30'],
    start: '2026-09',
    description: 'ai & learning initiative',
  },
  {
    title: 'Back End Developer',
    org: 'Human Flourishing Program at Harvard',
    mark: 'HF',
    tint: ['#f8dfe4', '#a51c30'],
    start: '2026-09',
    description: 'building a platform for schools at scale',
  },
  {
    title: 'Instructor',
    org: 'City Tech, CUNY',
    mark: 'CT',
    tint: ['#e3ebfa', '#2f5b9a'],
    type: 'Part-time',
    start: '2025-07',
    end: '2025-08',
    location: 'New York · On-site',
    description: 'ai/ml bootcamp funded by the Tsai Social Justice Fund',
  },
  {
    title: 'Software Engineer',
    org: 'Lexor Strategies',
    mark: 'L',
    tint: ['#ece9e3', '#141413'],
    type: 'Full-time',
    start: '2025-05',
    end: '2025-08',
    location: 'New York · On-site',
    description: 'leading product strategy for clients + building internal automation tools',
  },
  {
    title: 'Software Engineer',
    org: 'Passengers United',
    mark: 'PU',
    tint: ['#fbf0d6', '#a8771f'],
    start: '2025-02',
    end: '2025-05',
    location: 'New York · Remote',
    description: 'public transit safety app for the MTA, interviewed by journalism agencies like BBC and Columbia Journalism',
  },
  {
    title: 'Mentor',
    org: 'Tech@NYU',
    mark: '@',
    tint: ['#ebe5fa', '#57068c'],
    type: 'Part-time',
    start: '2024-09',
    end: '2025-05',
    location: 'New York · On-site',
    description: 'dismantling imposter syndrome and helping my community build more',
  },
  {
    title: 'Full-stack Developer',
    org: 'Simply Friendly Inc.',
    mark: 'SF',
    tint: ['#fde4ef', '#b23a7a'],
    type: 'Full-time',
    start: '2025-01',
    end: '2025-04',
    location: 'New York · Remote',
    description: 'social networking app to connect student orgs - realtime matchmaking and messaging',
  },
  {
    title: 'Web Developer',
    org: 'Aurangzeb',
    mark: 'A',
    tint: ['#ece9e3', '#57534e'],
    start: '2024-09',
    end: '2024-12',
    location: 'New York · On-site',
    description: 'interactive e-commerce platform (Next.js, AWS, SST, Stripe API) + React-Three-Fiber for 3D clothing models',
  },
  {
    title: 'Office Assistant',
    org: "Dunkin'",
    mark: 'D',
    tint: ['#fde4da', '#d4572f'],
    start: '2021-03',
    end: '2024-09',
    location: 'New York',
    description: 'reconciling sales reports of customer transactions daily on Oracle + Excel',
  },
  {
    title: 'Software Developer',
    org: 'buildspace',
    mark: 'b',
    tint: ['#ece9e3', '#141413'],
    start: '2024-06',
    end: '2024-08',
    location: 'Remote',
    description: 'neural network model from scratch (just NumPy) to classify handwritten digits from the MNIST dataset, achieving 85% accuracy',
  },
  {
    title: 'Web Design Intern',
    org: 'Verste',
    mark: 'V',
    tint: ['#dff2e8', '#3f8f6c'],
    type: 'Internship',
    start: '2022-06',
    end: '2022-08',
    location: 'Online · Remote',
    description: 'non-profit platform simplifying research for high schoolers',
  },
];

export const leadership: Role[] = [
  {
    title: 'Co-President',
    org: 'HGSE Venture Capital & Entrepreneurship Club',
    mark: 'VC',
    tint: ['#f8dfe4', '#a51c30'],
    dates: 'Present',
    description: "starting the school's own student venture fund + founder and investor events for 80+ people",
  },
  {
    title: 'Organization Director',
    org: 'iCreate (Harvard)',
    mark: 'iC',
    tint: ['#fde4da', '#d4572f'],
    dates: 'Present',
    description: 'bringing influencers, celebrities and speakers to give talks at Harvard',
  },
  {
    title: 'Head Developer',
    org: 'Google Developer Group',
    mark: 'G',
    tint: ['#e3ebfa', '#2f5b9a'],
    start: '2025-09',
    description: 'leading a team of 5 building an NFL outcome prediction app',
  },
];

export const projects = [
  {
    name: 'Aurangzeb',
    short: '3D clothing storefront with Stripe checkout and an admin dashboard',
    mark: 'A',
    tint: ['#ece9e3', '#57534e'] as [string, string],
    kind: 'E-commerce',
    summary:
      'Storefront on Next.js, PostgreSQL and Prisma with Stripe payments, webhook-driven order flows, React-Three-Fiber 3D apparel previews, and an admin dashboard for drops and inventory.',
  },
  {
    name: 'Kalendar',
    short: 'shared calendar for friends, with a 50-person waitlist before launch',
    mark: 'K',
    tint: ['#fde4da', '#d4572f'] as [string, string],
    kind: 'Social calendar',
    summary:
      'A shared calendar for friends built on Next.js and Postgres Realtime. Drew a 50-person waitlist before launch.',
  },
  {
    name: 'Inventory Manager',
    short: 'pantry tracker with real-time sync that works offline',
    mark: 'IM',
    tint: ['#dff2e8', '#3f8f6c'] as [string, string],
    kind: 'Web app',
    summary:
      'Pantry and storage tracker with full CRUD, Firebase real-time sync, and Firestore offline caching.',
  },
  {
    name: 'AI Chatbot',
    short: 'GPT-4 chatbot tuned for clear, respectful answers',
    mark: 'AI',
    tint: ['#ebe5fa', '#57068c'] as [string, string],
    kind: 'LLM',
    summary: 'A GPT-4 chatbot with system prompts tuned for clear, respectful, accurate answers.',
  },
];
