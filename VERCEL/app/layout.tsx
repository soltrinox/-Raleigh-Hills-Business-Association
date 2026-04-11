import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: {
    default: 'Raleigh Hills Business Association',
    template: '%s | RHBA',
  },
  description: 'Supporting local businesses and strengthening our community in Raleigh Hills, Oregon. Join our 501(c)(6) non-profit business association.',
  keywords: ['Raleigh Hills', 'business association', 'Oregon', 'Portland', 'networking', 'local business', 'community'],
  authors: [{ name: 'Raleigh Hills Business Association' }],
  generator: 'v0.app',
  openGraph: {
    title: 'Raleigh Hills Business Association',
    description: 'Supporting local businesses and strengthening our community in Raleigh Hills, Oregon.',
    url: 'https://raleighhillsbusiness.com',
    siteName: 'Raleigh Hills Business Association',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raleigh Hills Business Association',
    description: 'Supporting local businesses and strengthening our community in Raleigh Hills, Oregon.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A4C3A' },
    { media: '(prefers-color-scheme: dark)', color: '#1A4C3A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
