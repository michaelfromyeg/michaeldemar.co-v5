// components/layout/footer.tsx
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
} from 'lucide-react'
import { useMemo } from 'react'

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="border-t">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:px-6 md:h-24 md:flex-row md:py-0 lg:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {`© Michael DeMarco ${year}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
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
