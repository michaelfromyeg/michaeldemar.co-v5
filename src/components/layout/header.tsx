'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'
import { SearchModal } from '@/components/search-modal'
import { MobileNav } from '@/components/layout/mobile-navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'blog', href: '/blog' },
  { name: 'design', href: '/design' },
  { name: 'travel', href: '/travel' },
  { name: 'about', href: '/about' },
] as const

const EMOJIS = ['🤠', '🐢', '👾', '🤖', '⚡', '🦅', '🦕', '🐧'] as const

// Animated navigation link component
function NavLink({
  href,
  name,
  isActive,
  index,
}: {
  href: string
  name: string
  isActive: boolean
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.075,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={href}
        className={cn(
          'group relative flex items-center text-sm font-medium transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-primary'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active background pill */}
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 -mx-2 -my-1 rounded-md bg-primary/10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Left bracket */}
        <motion.span
          className={cn(
            'relative transition-colors duration-150',
            isHovered && !isActive && 'text-accent',
            isActive && 'text-primary'
          )}
          animate={{
            x: isHovered || isActive ? -3 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          [
        </motion.span>

        {/* Link text */}
        <span className="relative">{name}</span>

        {/* Right bracket */}
        <motion.span
          className={cn(
            'relative transition-colors duration-150',
            isHovered && !isActive && 'text-accent',
            isActive && 'text-primary'
          )}
          animate={{
            x: isHovered || isActive ? 3 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          ]
        </motion.span>
      </Link>
    </motion.div>
  )
}

export default function Header() {
  const [emoji, setEmoji] = useState<string>('👋')
  const [logoHovered, setLogoHovered] = useState(false)
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
            className="group relative flex items-center gap-2 text-lg font-semibold text-foreground"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            {/* Animated emoji */}
            <motion.span
              animate={{
                scale: logoHovered ? 1.15 : 1,
                rotate: logoHovered ? [0, -5, 5, -5, 0] : 0,
              }}
              transition={{
                scale: { type: 'spring', stiffness: 400, damping: 17 },
                rotate: { duration: 0.4, ease: 'easeInOut' },
              }}
            >
              {emoji}
            </motion.span>

            {/* Site name with animated underline */}
            <span className="relative">
              michaeldemar.co
              <motion.span
                className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left bg-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: logoHovered ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </span>
          </Link>

          <nav className="flex items-center">
            {/* Desktop navigation */}
            <div className="hidden items-center gap-4 md:mr-4 md:flex">
              {navigation.map((item, index) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  name={item.name}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile controls with consistent spacing */}
            <div className="flex items-center">
              <div className="flex h-9 items-center justify-center">
                <SearchModal />
              </div>
              <div className="flex h-9 items-center justify-center px-2">
                <ModeToggle />
              </div>
              <div className="flex h-9 items-center justify-center">
                <MobileNav navigation={navigation} />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
