'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'
import { SearchModal } from '@/components/search-modal'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'blog', href: '/blog' },
  { name: 'design', href: '/design' },
  { name: 'travel', href: '/travel' },
  { name: 'about', href: '/about' },
] as const

const EMOJIS = ['🤠', '🐢', '👾', '🤖', '⚡', '🦅', '🦕', '🐧'] as const

export default function Header() {
  const [emoji, setEmoji] = useState<string>('👋')
  const pathname = usePathname()

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:text-primary"
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
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-foreground',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  [{item.name}]
                </Link>
              ))}
            </div>
            <SearchModal />
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
