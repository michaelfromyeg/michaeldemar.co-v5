'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command'
import { searchSite, type SearchItem } from '@/lib/search'
import { useMediaQuery } from '@/hooks/use-media-query'

const GROUPS: { type: SearchItem['type']; heading: string }[] = [
  { type: 'page', heading: 'Pages' },
  { type: 'blog', heading: 'Blog' },
  { type: 'design', heading: 'Design' },
  { type: 'travel', heading: 'Travel' },
]

const SearchButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-9 w-9 sm:w-auto sm:px-2"
    onClick={onClick}
    aria-label="Open search"
  >
    <Search className="h-4 w-4" />
    <kbd className="bg-muted text-muted-foreground pointer-events-none hidden rounded border px-1.5 font-mono text-[10px] font-medium sm:inline-block">
      ⌘K
    </kbd>
  </Button>
)

const SearchResult = ({
  item,
  onSelect,
}: {
  item: SearchItem
  onSelect: (href: string) => void
}) => (
  <CommandItem
    value={item.id}
    onSelect={() => onSelect(item.href)}
    className="text-muted-foreground flex flex-col items-start py-3"
  >
    <span className="text-foreground font-medium">{item.title}</span>
    {item.description && (
      <span className="line-clamp-1 text-xs">{item.description}</span>
    )}
    {(item.tags?.length || item.date) && (
      <div className="mt-1 flex flex-wrap gap-1">
        {item.tags?.map((tag) => (
          <span
            key={tag}
            className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
          >
            {tag}
          </span>
        ))}
        {item.date && (
          <time
            dateTime={item.date}
            className="text-muted-foreground/80 text-xs"
          >
            {new Date(item.date).toLocaleDateString()}
          </time>
        )}
      </div>
    )}
  </CommandItem>
)

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  const toggleSearch = useCallback(() => {
    setOpen((prev) => !prev)
    setSearch('')
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  useEffect(() => {
    // Handle keyboard visibility on mobile
    if (typeof window !== 'undefined' && isMobile) {
      const handleResize = () => {
        const isKeyboard = window.innerHeight < window.outerHeight * 0.75
        setIsKeyboardVisible(isKeyboard)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === '\\') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleSearch])

  const groups = useMemo(() => {
    const query = search.trim()
    if (!query) return []

    const results = searchSite(query)
    return GROUPS.map((group) => ({
      ...group,
      items: results.filter((item) => item.type === group.type),
    })).filter((group) => group.items.length > 0)
  }, [search])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      <SearchButton onClick={toggleSearch} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`fixed ${
            isMobile
              ? isKeyboardVisible
                ? 'top-0 translate-y-0'
                : 'top-[50%] translate-y-[-50%]'
              : 'top-[50%] translate-y-[-50%]'
          } left-[50%] w-[calc(100%-2rem)] translate-x-[-50%] overflow-hidden p-0 sm:max-w-[550px]`}
        >
          <DialogTitle className="sr-only">Search content</DialogTitle>
          <Command
            shouldFilter={false}
            className="grid h-full grid-rows-[auto_1fr]"
          >
            <div className="bg-background sticky top-0 z-50 border-b">
              <CommandInput
                ref={inputRef}
                placeholder="Search pages and content..."
                value={search}
                onValueChange={setSearch}
                className="border-0"
              />
            </div>
            <CommandList
              className={`scrollbar-thin overflow-y-auto ${
                isMobile
                  ? isKeyboardVisible
                    ? 'max-h-[40vh]'
                    : 'max-h-[60vh]'
                  : 'max-h-[300px] min-h-[300px]'
              }`}
            >
              {groups.length === 0 && (
                <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
                  {search.trim() ? 'No results found.' : 'Start typing...'}
                </CommandEmpty>
              )}
              {groups.map((group) => (
                <CommandGroup key={group.type} heading={group.heading}>
                  {group.items.map((item) => (
                    <SearchResult
                      key={item.id}
                      item={item}
                      onSelect={navigate}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
