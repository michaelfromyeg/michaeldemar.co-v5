import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

import { Montserrat, Ubuntu, Teko } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-ubuntu',
  display: 'swap',
})

const teko = Teko({
  subsets: ['latin'],
  variable: '--font-teko',
  display: 'swap',
})

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Michael DeMarco',
  description: 'Software engineer, teacher, and perpetual learner.',
  metadataBase: new URL('https://michaeldemar.co'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-icon.png',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${ubuntu.variable} ${teko.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="container mx-auto max-w-6xl flex-grow px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
