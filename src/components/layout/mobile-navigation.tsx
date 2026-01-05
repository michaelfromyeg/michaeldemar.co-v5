'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileNavProps {
  navigation: readonly {
    name: string
    href: string
  }[]
}

// Animated mobile nav link
function MobileNavLink({
  href,
  name,
  isActive,
  index,
  onClose,
}: {
  href: string
  name: string
  isActive: boolean
  index: number
  onClose: () => void
}) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.075,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={href}
        onClick={onClose}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={cn(
          'group relative flex items-center py-3 text-xl font-medium transition-colors',
          isActive
            ? 'text-foreground'
            : 'text-muted-foreground active:text-primary'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.span
            layoutId="mobile-nav-indicator"
            className="absolute -left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-accent"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Left bracket */}
        <motion.span
          className={cn(
            'transition-colors duration-150',
            isActive && 'text-primary',
            isPressed && 'text-accent'
          )}
          animate={{
            x: isActive || isPressed ? -4 : 0,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          [
        </motion.span>

        {/* Link text */}
        <span>{name}</span>

        {/* Right bracket */}
        <motion.span
          className={cn(
            'transition-colors duration-150',
            isActive && 'text-primary',
            isPressed && 'text-accent'
          )}
          animate={{
            x: isActive || isPressed ? 4 : 0,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          ]
        </motion.span>
      </Link>
    </motion.div>
  )
}

export function MobileNav({ navigation }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-[300px] bg-background/80 backdrop-blur-sm sm:max-w-[400px]"
      >
        <nav className="mt-8 flex flex-col gap-2">
          <AnimatePresence>
            {isOpen &&
              navigation.map((item, index) => (
                <MobileNavLink
                  key={item.name}
                  href={item.href}
                  name={item.name}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/')
                  }
                  index={index}
                  onClose={() => setIsOpen(false)}
                />
              ))}
          </AnimatePresence>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
