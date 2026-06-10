'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NewsletterFormProps {
  title?: string
  description?: string
  className?: string
}

export const NewsletterForm = ({
  title = 'Subscribe to my newsletter',
  description = 'Get updates on my latest posts and projects.',
  className = '',
}: NewsletterFormProps) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Open Buttondown subscription window
      window.open('https://buttondown.com/michaelfromyeg', 'popupwindow')

      // Submit the form
      const form = e.currentTarget
      form.submit()

      // Show success toast
      toast.success('Success!', {
        description:
          'Thanks for subscribing! Please check your email to confirm.',
      })

      // Reset form
      setEmail('')
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong.', {
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={cn(
        'bg-muted/50 mx-auto w-full max-w-lg border-none',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action="https://buttondown.com/api/emails/embed-subscribe/michaelfromyeg"
          method="post"
          target="popupwindow"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="bd-email">Email address</Label>
            <Input
              type="email"
              name="email"
              id="bd-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Powered by{' '}
            <a
              href="https://buttondown.com/refer/michaelfromyeg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Buttondown
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewsletterForm
