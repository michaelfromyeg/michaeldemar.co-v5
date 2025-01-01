'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query)
      const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
        setMatches(e.matches)
      }

      // Set initial value
      setMatches(media.matches)

      // Listen for changes
      if (media.addEventListener) {
        media.addEventListener('change', updateMatch)
        return () => media.removeEventListener('change', updateMatch)
      } else {
        // Fallback for older browsers
        media.addListener(updateMatch)
        return () => media.removeListener(updateMatch)
      }
    }
    return undefined
  }, [query])

  return matches
}
