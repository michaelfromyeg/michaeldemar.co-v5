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
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted-foreground/10 h-6 w-6 p-0"
                onClick={() => setWrap(!wrap)}
              >
                <WrapText className="text-muted-foreground hover:text-primary h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs"
            >
              Toggle word wrap
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted-foreground/10 h-6 w-6 p-0"
                onClick={onCopy}
                aria-label="Copy code"
              >
                {copied ? (
                  <Check className="text-muted-foreground hover:text-primary h-4 w-4" />
                ) : (
                  <Copy className="text-muted-foreground hover:text-primary h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-popover text-popover-foreground rounded-md px-3 py-1.5 text-xs"
            >
              Copy code
            </TooltipContent>
          </Tooltip>
        </div>
        {language && (
          <div className="text-muted-foreground absolute top-4 right-24 text-xs">
            {language}
          </div>
        )}
        <pre
          ref={preRef}
          className={cn(
            'bg-muted mt-6 mb-4 overflow-x-auto rounded-lg px-4 py-4',
            'border-muted-foreground/20 border',
            wrap ? 'break-all whitespace-pre-wrap' : 'whitespace-pre',
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
