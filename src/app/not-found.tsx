import { Button } from '@/components/ui/button'
import { Code2, HomeIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground">
            Looks like you&apos;ve ventured into uncharted territory.
          </p>
        </div>

        <div className="flex justify-center">
          <Code2 className="h-32 w-32 text-muted-foreground opacity-50" />
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="default">
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
