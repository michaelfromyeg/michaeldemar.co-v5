'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  navigation: readonly {
    name: string
    href: string
  }[]
}

export function MobileNav({ navigation }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet>
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
        className="w-full max-w-[300px] sm:max-w-[400px]"
      >
        {/* <SheetHeader>
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader> */}
        <nav className="mt-8 flex flex-col gap-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-lg font-medium transition-colors hover:text-foreground',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              [{item.name}]
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
