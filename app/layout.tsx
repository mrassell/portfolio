import type { Metadata } from 'next';
import '../styles/globals.css';
import { INTRO_SEEN_CLASS, INTRO_SEEN_KEY } from './components/intro/constants';

export const metadata: Metadata = {
  title: 'Portfolio - mrassell',
  description: 'Learning Design & EdTech Portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script adds a class to <html> before paint, hence suppressHydrationWarning
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('${INTRO_SEEN_KEY}')==='1')document.documentElement.classList.add('${INTRO_SEEN_CLASS}')}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

