'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'

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
      <>
        {/* Previous CommandItem but with updated styling */}
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
              <Badge
                key={tag}
                variant="secondary"
                className="bg-muted/40 text-xs transition-colors hover:bg-muted"
              >
                {tag}
              </Badge>
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
      </>
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

  const toggleSearch = useCallback(() => {
    setOpen((prev) => !prev)
    setSearch('')
  }, [])

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
        <DialogContent className="fixed left-[50%] top-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] overflow-hidden p-0 sm:max-w-[550px]">
          <DialogTitle className="sr-only">Search content</DialogTitle>
          <Command className="grid grid-rows-[auto_1fr]">
            <div className="sticky top-0 z-50 border-b bg-background">
              <CommandInput
                placeholder="Search pages and content..."
                value={search}
                onValueChange={setSearch}
                className="border-0"
              />
            </div>
            <CommandList className="scrollbar-thin max-h-[300px] min-h-[300px] overflow-y-auto">
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
