import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

import './globals.css'

export const metadata: Metadata = {
  title: 'Michael DeMarco',
  description: 'Software engineer, teacher, and perpetual learner.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col antialiased`}
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
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
