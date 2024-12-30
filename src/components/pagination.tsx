import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  /**
   * Optional search params to preserve in pagination links
   * Will be merged with the page parameter
   */
  searchParams?: Record<string, string>
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Create URL with preserved search params
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNum.toString())
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex justify-center gap-2', className)}
    >
      <Link
        href={createPageUrl(currentPage - 1)}
        className={cn(
          'inline-flex h-8 items-center justify-center rounded-md px-3',
          'text-sm font-medium ring-offset-background transition-colors',
          'hover:bg-muted hover:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          currentPage <= 1 ? 'pointer-events-none opacity-50' : 'bg-muted'
        )}
        aria-label="Go to previous page"
        aria-disabled={currentPage <= 1}
      >
        Previous
      </Link>

      {/* First page */}
      {currentPage > 2 && (
        <Link
          href={createPageUrl(1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-muted/80"
          aria-label="Go to first page"
        >
          1
        </Link>
      )}

      {/* Ellipsis */}
      {currentPage > 3 && (
        <span className="flex h-8 w-8 items-center justify-center">...</span>
      )}

      {/* Pages around current */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((num) => Math.abs(num - currentPage) <= 1)
        .map((pageNum) => (
          <Link
            key={pageNum}
            href={createPageUrl(pageNum)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md',
              pageNum === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
            aria-label={`Go to page ${pageNum}`}
            aria-current={pageNum === currentPage ? 'page' : undefined}
          >
            {pageNum}
          </Link>
        ))}

      {/* Ellipsis */}
      {currentPage < totalPages - 2 && (
        <span className="flex h-8 w-8 items-center justify-center">...</span>
      )}

      {/* Last page */}
      {currentPage < totalPages - 1 && (
        <Link
          href={createPageUrl(totalPages)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-muted/80"
          aria-label="Go to last page"
        >
          {totalPages}
        </Link>
      )}

      <Link
        href={createPageUrl(currentPage + 1)}
        className={cn(
          'inline-flex h-8 items-center justify-center rounded-md px-3',
          'text-sm font-medium ring-offset-background transition-colors',
          'hover:bg-muted hover:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          currentPage >= totalPages
            ? 'pointer-events-none opacity-50'
            : 'bg-muted'
        )}
        aria-label="Go to next page"
        aria-disabled={currentPage >= totalPages}
      >
        Next
      </Link>
    </nav>
  )
}
