'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
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
import { useSearch } from '@/contexts/search-context'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/use-media-query'

interface SearchItem {
  id: string
  title: string
  type: string
  description?: string
  searchText: string
  href: string
  tags?: string[]
  date?: string
}

const SEARCH_RESULTS_LIMIT = 20
const LOADING_SKELETON_COUNT = 3

const SearchButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-9 w-9"
    onClick={onClick}
    aria-label="Open search"
  >
    <Search className="h-4 w-4" />
  </Button>
)

const SearchResults = ({ items }: { items: SearchItem[] }) => (
  <CommandGroup>
    {items.map((item) => (
      <CommandItem
        key={item.id}
        value={item.searchText}
        onSelect={() => {
          window.location.href = item.href
        }}
        className="flex flex-col items-start py-3 text-muted-foreground"
      >
        <div className="flex w-full items-center justify-between">
          <span className="font-medium text-foreground">{item.title}</span>
          <span className="text-xs text-muted-foreground opacity-80">
            [{item.type}]
          </span>
        </div>
        {item.description && (
          <span className="line-clamp-1 text-xs">{item.description}</span>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
          {item.date && (
            <time
              dateTime={item.date}
              className="text-xs text-muted-foreground/80"
            >
              {new Date(item.date).toLocaleDateString()}
            </time>
          )}
        </div>
      </CommandItem>
    ))}
  </CommandGroup>
)

const LoadingSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: LOADING_SKELETON_COUNT }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 w-${i === 0 ? 'full' : i === 1 ? '3/4' : '1/2'}`}
      />
    ))}
  </div>
)

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { searchItems, isLoading } = useSearch()
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
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleSearch])

  const filteredItems = useMemo(() => {
    const searchTerm = search.trim()
    if (!searchTerm) return []

    return searchItems
      .filter((item) =>
        item.searchText.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, SEARCH_RESULTS_LIMIT)
  }, [searchItems, search])

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
          <Command className="grid h-full grid-rows-[auto_1fr]">
            <div className="sticky top-0 z-50 border-b bg-background">
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
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-full">
                  {filteredItems.length === 0 && (
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </CommandEmpty>
                  )}
                  {filteredItems.length > 0 && (
                    <SearchResults items={filteredItems} />
                  )}
                </div>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
