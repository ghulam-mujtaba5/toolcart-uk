import type { Metadata, Viewport } from 'next';
import { Manrope, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#2450B8',
};

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toolcart.co.uk'),
  title: 'ToolCart UK | Industrial Hardware & Tools',
  description: 'Supplier-backed UK tools, DIY, and hardware e-commerce platform.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'ToolCart UK | The right tools. The right advice.',
    description: 'Verified UK hardware catalog with honest pack quantities and direct trade specs.',
    url: 'https://toolcart.co.uk',
    siteName: 'ToolCart UK',
    images: [
      {
        url: '/images/og/toolcart-og.webp',
        width: 1200,
        height: 630,
        alt: 'ToolCart UK Hardware Direct',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolCart UK | Industrial Hardware & Tools',
    description: 'Verified UK hardware catalog with honest pack quantities and direct trade specs.',
    images: ['/images/og/toolcart-og.webp'],
  },
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
