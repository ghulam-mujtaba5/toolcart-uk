import type { Metadata } from 'next';
import { Manrope, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ToolCart UK | Industrial Hardware & Tools',
  description: 'Supplier-backed UK tools, DIY, and hardware e-commerce platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen bg-tc-canvas font-body text-tc-graphite antialiased">
        {children}
      </body>
    </html>
  );
}
