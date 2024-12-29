'use client'

import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Blog', href: '/blog' },
  { name: 'Design', href: '/design' },
  { name: 'Travel', href: '/travel' },
  { name: 'About', href: '/about' },
] as const

const EMOJIS = ['🤠', '🐢', '👾', '🤖', '⚡', '🦅', '🦕', '🐧'] as const

export default function Header() {
  const [emoji, setEmoji] = useState<string>('👋')

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
          >
            <span>{emoji}</span>
            <span>michaeldemar.co</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-4 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  [{item.name}]
                </Link>
              ))}
            </div>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
