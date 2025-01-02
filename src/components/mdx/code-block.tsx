'use client'

import React from 'react'
import { Check, Copy, WrapText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

const CodeBlock = ({ children, className, language }: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false)
  const [wrap, setWrap] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const onCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.textContent || ''
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="group relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 hover:bg-muted-foreground/10"
                onClick={() => setWrap(!wrap)}
              >
                <WrapText className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground"
            >
              Toggle word wrap
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 hover:bg-muted-foreground/10"
                onClick={onCopy}
                aria-label="Copy code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-muted-foreground hover:text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground"
            >
              Copy code
            </TooltipContent>
          </Tooltip>
        </div>
        {language && (
          <div className="absolute right-24 top-4 text-xs text-muted-foreground">
            {language}
          </div>
        )}
        <pre
          ref={preRef}
          className={cn(
            'mb-4 mt-6 overflow-x-auto rounded-lg bg-muted px-4 py-4',
            'border border-muted-foreground/20',
            wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre',
            className
          )}
        >
          <code className={cn('grid')}>{children}</code>
        </pre>
      </div>
    </TooltipProvider>
  )
}

export default CodeBlock
