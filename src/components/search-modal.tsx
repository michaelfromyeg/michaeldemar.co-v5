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

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { searchItems, isLoading } = useSearch()

  const toggleSearch = useCallback(() => {
    setOpen((prev) => !prev)
    setSearch('')
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggleSearch])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return []

    const searchLower = search.toLowerCase()
    return searchItems
      .filter((item) => item.searchText.includes(searchLower))
      .slice(0, 20) // Limit to 20 results for performance
  }, [searchItems, search])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={toggleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[45%] p-0 sm:max-w-[550px]">
          <DialogTitle className="sr-only">Search content</DialogTitle>
          <Command>
            <div className="fixed-search">
              <CommandInput
                placeholder="Search pages and content..."
                value={search}
                onValueChange={setSearch}
                className="border-0"
              />
            </div>
            <div className="overflow-hidden">
              <CommandList className="scrollbar-thin max-h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </CommandEmpty>
                    {filteredItems.length > 0 && (
                      <CommandGroup>
                        {filteredItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.searchText}
                            onSelect={() => {
                              window.location.href = item.href
                            }}
                            className="flex flex-col items-start py-3 text-muted-foreground hover:text-foreground"
                          >
                            <div className="flex w-full items-center">
                              <span className="font-medium text-foreground">
                                {item.title}
                              </span>
                              <span className="ml-2 text-xs">
                                [{item.type}]
                              </span>
                            </div>
                            {item.description && (
                              <span className="line-clamp-1 text-xs">
                                {item.description}
                              </span>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.tags?.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-muted text-xs hover:bg-muted/80"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {item.date && (
                                <span className="text-xs">
                                  {new Date(item.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </div>
          </Command>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .fixed-search {
          position: relative;
          z-index: 50;
          background-color: var(--background);
          border-bottom: 1px solid var(--border);
        }
      `}</style>
    </>
  )
}
