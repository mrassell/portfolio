import '../styles/globals.css';

export const metadata = {
  title: 'Portfolio - mrassell',
  description: 'Learning Design & EdTech Portfolio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

