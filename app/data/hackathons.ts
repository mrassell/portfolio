export interface Hackathon {
  id: string;
  name: string;
  tagline: string;
  award: string;
  /** Short award label for badges and stats, e.g. "2nd place". */
  awardShort: string;
  event: string;
  year: string;
  what: string;
  how: string;
  hardest?: string;
  myRole?: string;
  team?: string[];
  stack: string[];
  links: { label: string; href: string }[];
  /** Screenshot in /public, roughly 3:2. */
  image?: { src: string; alt: string };
}

export const hackathons: Hackathon[] = [
  {
    id: 'lockdown',
    image: { src: '/projects/lockdown.png', alt: 'LOCKDOWN.cv dashboard labelling two registered people and flagging an unauthorized visitor at a door' },
    name: 'LOCKDOWN.cv',
    tagline: 'Turns existing CCTV into an autonomous security layer that spots boundary breaches and escalates threats.',
    award: 'Winner, Best AI Automation Track',
    awardShort: 'Winner',
    event: 'Tech@NYU × HOF Startup Week Buildathon',
    year: '2026',
    what:
      'Monitors four camera feeds at once with facial recognition, restricted-zone enforcement and door access control, all from one dashboard. When someone unauthorized shows up, a multi-agent pipeline takes over: a Nemotron vision model analyzes the threat, Nemotron Super checks the person’s history in Supabase and picks an escalation level (routine, urgent or critical), and Claude writes a formal incident report rendered to PDF. Security staff get a Twilio SMS and an ElevenLabs voice call at the same time.',
    how:
      'React + Vite dashboard that captures frames every 400ms, with canvas overlays for drawing restricted zones and boundary lines straight onto live feeds. A FastAPI backend handles face recognition (OpenCV DNN + ArcFace embeddings), door detection (YOLOv8) and zone enforcement (ray-casting for polygons, side-tracking for line crossings).',
    hardest:
      'Keeping face recognition reliable across four feeds without lag. We tuned capture intervals and added sticky identity tracking so a label survives when a face leaves the frame but the body is still visible.',
    myRole:
      'Planned the agent orchestration and tool calling for violations, wrote the Supabase logic, and integrated Databricks UDFs and the Genie model.',
    team: ['Alan Wu', 'Talha Gondal', 'Usman Abdullah'],
    stack: ['React', 'FastAPI', 'OpenCV', 'YOLOv8', 'Nemotron', 'Claude', 'Supabase', 'Databricks', 'Twilio', 'ElevenLabs'],
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/lockdown-8c9jpv' },
      { label: 'GitHub', href: 'https://github.com/us-abdullah/facey' },
      { label: 'Tech stack video', href: 'https://youtu.be/37bierR_kTo' },
    ],
  },
  {
    id: 'raise-the-bar',
    image: { src: '/projects/raise-the-bar.png', alt: 'Raise The Bar! battle screen with DJ Dev, a voice waveform and the four battle words' },
    name: 'Raise The Bar!',
    tagline: 'Freestyle rap battles with your friends, live transcription, and an AI DJ who judges your bars.',
    award: 'Winner, Best Beginner + Best Use of Featherless',
    awardShort: '2× winner',
    event: 'DevFest 2026, Columbia',
    year: '2026',
    what:
      'Two players get four words and battle out loud. DJ Dev, an AI judge, scores each verse on its bars and word complexity, gives feedback, and calls the winner.',
    how:
      'A React web app using ElevenLabs for DJ Dev’s voice, Supabase to store verses, and Featherless open-source models plus K2-Think to rate and grade each opponent.',
    hardest:
      'Landing on an idea nobody had done before, then shipping it through flaky model APIs with a team where half of us were at our first hackathon.',
    myRole: 'Spit the bars in the live demo.',
    team: ['Tawhid Zaman', 'Dort T', 'Yazn Alzeghaibi'],
    stack: ['React', 'Vite', 'Supabase', 'ElevenLabs', 'Featherless', 'K2-Think', 'Gemini'],
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/raise-the-bar-u3v7pt' },
      { label: 'Live demo', href: 'https://dev-fest-2026.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/yaznzee/DevFest-2026' },
    ],
  },
  {
    id: 'grazing-goat',
    name: 'Grazing Goat',
    tagline: 'Goats as a service: GPS-tracked goats that graze overgrown land to prevent wildfires.',
    award: '2nd place',
    awardShort: '2nd place',
    event: 'JumboHack 2025, Tufts',
    year: '2025',
    what:
      'California’s controlled burns emit huge amounts of CO2 and leave land dry. Grazing Goat rents GPS-tracked goats to organizations that need vegetation cleared, and tracks the CO2 saved compared with burning.',
    how:
      'A website and tracking dashboard built on WebSim that visualizes wildfire risk, grazing coverage and CO2 impact, backed by a model estimating emissions avoided versus traditional methods. Branding in Illustrator and InDesign.',
    hardest:
      'Staying focused. The idea kept growing into agriculture, fashion and carbon offsets, so we had to scope a sharp wildfire story while leaving room to scale.',
    team: ['Hamid', 'Abdul Mendahawi', 'Muad Khalif', 'Hesham Zia'],
    stack: ['WebSim', 'Illustrator', 'InDesign'],
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/goatgrazer' },
      { label: 'Live site', href: 'https://goatgrazer-government-grazing-services--abdul.on.websim.ai/' },
    ],
  },
  {
    id: 'paw-and-order',
    image: { src: '/projects/paw-and-order.png', alt: 'Paw & Order title screen: a pixel-art Superior Court with Create Court and Join Court buttons' },
    name: 'Paw & Order',
    tagline: 'An LLM-powered courtroom game that helps shy kids build debate and conversation confidence.',
    award: 'Winner, Best Use of MongoDB Atlas',
    awardShort: 'Winner',
    event: 'Hack@Brown 2025',
    year: '2025',
    what:
      'Kids enter a virtual courthouse, get a random stance, and debate another player for one minute. An LLM judges argument strength and quality and picks the winner, so practice feels like a game instead of a performance.',
    how: 'React and TypeScript on the front end, MongoDB on the back end, and the OpenAI API for judging and feedback.',
    hardest:
      'Real-time player-versus-player: getting two people into the same debate room at once. It was also our first time using MongoDB.',
    myRole: 'Built the backend and the AI integration, including the judging prompts.',
    team: ['Hesham Zia', 'Alfardil Alam', 'Abdul Mendahawi'],
    stack: ['React', 'TypeScript', 'MongoDB', 'OpenAI'],
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/paw-order' },
      { label: 'GitHub', href: 'https://github.com/alfardil/Hack-at-Brown-2025' },
    ],
  },
  {
    id: 'story-generation',
    name: 'Story Generation App',
    tagline: 'Personalized children’s comics generated from a single prompt.',
    award: 'Top 5',
    awardShort: 'Top 5',
    event: 'NVIDIA × Vercel Hackathon',
    year: '2025',
    what: 'Turns a prompt into a personalized children’s comic, with consistent characters across panels.',
    how:
      'Next.js 15 and React 19 with Tailwind, orchestrating multi-step AI pipelines on NVIDIA NIM vision-language models (Llama 3.3, Consistency NIM), with TypeScript APIs and image-validation middleware for error handling.',
    stack: ['Next.js', 'React 19', 'NVIDIA NIM', 'TypeScript', 'Tailwind'],
    links: [],
  },
];
