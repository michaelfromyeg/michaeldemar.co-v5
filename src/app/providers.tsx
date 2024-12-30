import { SearchProvider } from '@/contexts/search-context'

// src/app/providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      {/* Other providers */}
      {children}
    </SearchProvider>
  )
}
