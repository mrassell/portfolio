/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brutal-lavender': '#c4b5fd',
        'brutal-orange': '#fdba74',
        'brutal-lime': '#bef264',
        'brutal-pink': '#fbcfe8',
        'brutal-yellow': '#fef08a',
        'brutal-purple': '#a78bfa',
        'brutal-blue': '#93c5fd',
        ink: '#141413',
        paper: '#f6f4ef',
        accent: '#e4412b',
        crimson: '#a51c30',
        'nyu-violet': '#57068c',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 45s linear infinite',
      },
      fontFamily: {
        'brutal': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000',
        'brutal-lg': '6px 6px 0px 0px #000',
        'brutal-xl': '8px 8px 0px 0px #000',
      },
    },
  },
  plugins: [],
}

