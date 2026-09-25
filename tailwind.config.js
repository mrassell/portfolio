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
        'neu-base': '#e8ecf0',
        'neu-accent': '#667eea',
        'neu-accent-light': '#8b9cf6',
        'neu-text': '#2d3748',
        'neu-text-light': '#4a5568',
      },
      fontFamily: {
        'brutal': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000',
        'brutal-lg': '6px 6px 0px 0px #000',
        'brutal-xl': '8px 8px 0px 0px #000',
        'neu-raised': '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
        'neu-inset': 'inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.5)',
        'neu-flat': '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.4)',
      },
    },
  },
  plugins: [],
}

