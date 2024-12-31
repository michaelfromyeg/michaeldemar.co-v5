// src/app/sitemap/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Folder, File, FileText, Map, Palette } from 'lucide-react'
import { XMLParser } from 'fast-xml-parser'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sitemap | Michael DeMar',
  description: 'A visual representation of all pages on michaeldemar.co',
}

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}

interface SitemapData {
  urlset: {
    url: SitemapUrl[]
  }
}

interface RouteNode {
  name: string
  path: string
  children: RouteNode[]
  lastmod?: string
  type?: 'blog' | 'design' | 'travel' | 'page'
}

async function getSitemapData(): Promise<RouteNode[]> {
  // In Next.js, we can fetch the XML directly since it's public
  const response = await fetch('https://michaeldemar.co/sitemap.xml')
  const xmlData = await response.text()

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
  })
  const parsed = parser.parse(xmlData) as SitemapData

  // Create a hierarchical structure from flat URLs
  const root: RouteNode = {
    name: 'root',
    path: '/',
    children: [],
  }

  parsed.urlset.url.forEach((url) => {
    const path = url.loc.replace('https://michaeldemar.co', '')
    if (path === '/') return // Skip root as we already added it

    const segments = path.split('/').filter(Boolean)
    let currentNode = root

    // Determine the type based on the path
    const type = segments[0] as RouteNode['type']

    // For top-level pages, add them directly under root
    if (segments.length === 1) {
      currentNode.children.push({
        name: segments[0],
        path,
        children: [],
        lastmod: url.lastmod,
        type: 'page',
      })
      return
    }

    // For nested pages, create the hierarchy
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1
      const existingNode = currentNode.children.find(
        (child) => child.path === '/' + segments.slice(0, index + 1).join('/')
      )

      if (existingNode) {
        currentNode = existingNode
      } else {
        const newNode: RouteNode = {
          name: segment,
          path: '/' + segments.slice(0, index + 1).join('/'),
          children: [],
          lastmod: isLast ? url.lastmod : undefined,
          type: isLast ? type : undefined,
        }
        currentNode.children.push(newNode)
        currentNode = newNode
      }
    })
  })

  // Sort children
  const sortNodes = (nodes: RouteNode[]) => {
    nodes.sort((a, b) => {
      // Sort by type first (pages before sections)
      if (a.type === 'page' && b.type !== 'page') return -1
      if (a.type !== 'page' && b.type === 'page') return 1
      return a.path.localeCompare(b.path)
    })
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortNodes(node.children)
      }
    })
  }

  sortNodes(root.children)
  return [root]
}

function RouteTree({
  routes,
  level = 0,
}: {
  routes: RouteNode[]
  level?: number
}) {
  return (
    <ul className={`space-y-2 ${level === 0 ? '' : 'ml-6 mt-2'}`}>
      {routes.map((route) => (
        <li key={route.path} className="group">
          <div className="flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-muted/30">
            <span className="mt-1 text-muted-foreground group-hover:text-foreground">
              {route.children.length > 0 ? (
                <Folder className="h-4 w-4" />
              ) : route.type === 'blog' ? (
                <FileText className="h-4 w-4" />
              ) : route.type === 'design' ? (
                <Palette className="h-4 w-4" />
              ) : route.type === 'travel' ? (
                <Map className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
            </span>
            <div className="flex flex-col">
              <a
                href={route.path}
                className="font-mono text-sm text-muted-foreground transition-colors group-hover:text-foreground"
              >
                {route.path}
              </a>
              {route.lastmod && (
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  Last modified: {new Date(route.lastmod).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {route.children.length > 0 && (
            <RouteTree routes={route.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}

export default async function SitemapPage() {
  const routes = await getSitemapData()

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-4xl">Sitemap</h1>
      <Card className="border-gruvbox py-6">
        <CardContent>
          <RouteTree routes={routes} />
        </CardContent>
      </Card>
    </main>
  )
}
