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
import type { searchSite, SearchItem } from '@/lib/search'
import { TagList } from '@/components/content/content-card'
import { useMediaQuery } from '@/hooks/use-media-query'

type SearchFn = typeof searchSite

const GROUPS: { type: SearchItem['type']; heading: string }[] = [
  { type: 'page', heading: 'Pages' },
  { type: 'blog', heading: 'Blog' },
  { type: 'design', heading: 'Design' },
  { type: 'travel', heading: 'Travel' },
]

const SearchButton = ({
  onClick,
  shortcutHint,
}: {
  onClick: () => void
  shortcutHint: string
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-9 w-9 sm:w-auto sm:px-2"
    onClick={onClick}
    aria-label="Open search"
  >
    <Search className="h-4 w-4" />
    <kbd className="bg-muted text-muted-foreground pointer-events-none hidden rounded border px-1.5 font-mono text-[10px] font-medium sm:inline-block">
      {shortcutHint}
    </kbd>
  </Button>
)

const SearchResult = ({
  item,
  onSelect,
}: {
  item: SearchItem
  onSelect: (item: SearchItem) => void
}) => (
  <CommandItem
    value={item.id}
    onSelect={() => onSelect(item)}
    className="text-muted-foreground flex flex-col items-start py-3"
  >
    <span className="text-foreground font-medium">{item.title}</span>
    {item.description && (
      <span className="line-clamp-1 text-xs">{item.description}</span>
    )}
    {(item.tags?.length || item.date) && (
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {item.tags && item.tags.length > 0 && <TagList tags={item.tags} />}
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
  const [searchFn, setSearchFn] = useState<SearchFn | null>(null)
  const [isMac, setIsMac] = useState(true)

  const toggleSearch = useCallback(() => {
    setOpen((prev) => !prev)
    setSearch('')
  }, [])

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform))
    // Clean up the cache left behind by the removed SearchProvider; this can
    // be deleted in a later release.
    try {
      localStorage.removeItem('search-data-cache')
    } catch {}
  }, [])

  // The search module bundles the content index, so load it only once the
  // modal is first opened instead of shipping it with every page.
  useEffect(() => {
    if (open && !searchFn) {
      import('@/lib/search').then((mod) => setSearchFn(() => mod.searchSite))
    }
  }, [open, searchFn])

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
    if (!query || !searchFn) return []

    const results = searchFn(query)
    return GROUPS.map((group) => ({
      ...group,
      items: results.filter((item) => item.type === group.type),
    })).filter((group) => group.items.length > 0)
  }, [search, searchFn])

  const navigate = useCallback(
    (item: SearchItem) => {
      setOpen(false)
      if (item.external) {
        window.location.href = item.href
      } else {
        router.push(item.href)
      }
    },
    [router]
  )

  return (
    <>
      <SearchButton
        onClick={toggleSearch}
        shortcutHint={isMac ? '⌘K' : 'Ctrl K'}
      />
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
