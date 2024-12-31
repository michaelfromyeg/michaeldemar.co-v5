import Link from 'next/link'
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MessageSquare,
  History,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="border-t">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:px-6 md:h-auto md:flex-row md:py-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              {`© Michael DeMarco ${year}`}
            </p>
            <Popover>
              <PopoverTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <History className="h-4 w-4" />
                <code>Go back in time</code>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  {[4, 3, 2, 1].map((version) => (
                    <Link
                      key={version}
                      href={`https://michaelfromyeg.github.io/michaeldemar.co-v${version}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      v{version}
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
          <Link
            href="https://github.com/michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://twitter.com/michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://linkedin.com/in/michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://facebook.com/michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link
            href="https://instagram.com/michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link
            href="https://youtube.com/@michaelfromyeg"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
          </Link>
          <Link
            href="https://stackoverflow.com/users/10660585/michael-demarco"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Stack Overflow</span>
          </Link>
          <Link
            href="mailto:michaelfromyeg@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-2 hover:bg-accent"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">E-mail</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
