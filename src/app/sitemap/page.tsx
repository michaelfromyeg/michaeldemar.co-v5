// src/app/sitemap/page.tsx
import { readdir } from 'fs/promises'
import path from 'path'
import { Card, CardContent } from '@/components/ui/card'
import { Folder, File, FileText, Map, Palette } from 'lucide-react'
import blog from '@/data/blog.json'
import design from '@/data/design.json'
import travel from '@/data/travel.json'

interface RouteNode {
  name: string
  path: string
  children: RouteNode[]
  isBlogPost?: boolean
  isDesignProject?: boolean
  isTravelPost?: boolean
  description?: string
  date?: string
}

async function getRoutes(
  dir: string,
  basePath: string = ''
): Promise<RouteNode[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const routes: RouteNode[] = []

  // Add root route first if we're at the top level
  if (basePath === '') {
    routes.push({
      name: 'root',
      path: '/',
      children: [],
    })
  }

  for (const entry of entries) {
    // Skip private folders and non-route items
    if (
      entry.name.startsWith('_') ||
      entry.name.startsWith('.') ||
      entry.name === 'api' ||
      entry.name === 'sitemap' ||
      entry.name.endsWith('.css') ||
      entry.name === 'favicon.ico' ||
      entry.name === '[slug]'
    ) {
      continue
    }

    const fullPath = path.join(dir, entry.name)
    const routePath = path.join(basePath, entry.isDirectory() ? entry.name : '')
    const normalizedPath = ('/' + routePath)
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/\/page$/, '')

    if (entry.isDirectory()) {
      const children = await getRoutes(fullPath, routePath)

      // Special handling for blog directory
      if (entry.name === 'blog') {
        // Find [slug] directory and get its path
        const slugFolderPath = path.join(fullPath, '[slug]')
        try {
          await readdir(slugFolderPath)
          // Add blog posts under the dynamic route folder structure
          const blogPosts = blog.posts
            .filter((post) => post.status === 'Published')
            .map((post) => ({
              name: post.title,
              path: `/blog/${post.slug}`,
              children: [],
              isBlogPost: true,
              description: post.description,
              date: post.publishedDate,
            }))
            .sort(
              (a, b) =>
                new Date(b.date || '').getTime() -
                new Date(a.date || '').getTime()
            )

          // Add the [slug] directory with blog posts as children
          children.push({
            name: 'Posts',
            path: '/blog/[slug]',
            children: blogPosts,
          })
        } catch (e) {
          console.error(e)
          // [slug] directory doesn't exist, skip
        }
      }

      // Special handling for design directory
      if (entry.name === 'design') {
        const slugFolderPath = path.join(fullPath, '[slug]')
        try {
          await readdir(slugFolderPath)
          const designProjects = design.projects
            .filter((project) => project.status === 'Done')
            .map((project) => ({
              name: project.title,
              path: `/design/${project.slug}`,
              children: [],
              isDesignProject: true,
              description: project.content,
              date: project.publishedDate,
            }))
            .sort(
              (a, b) =>
                new Date(b.date || '').getTime() -
                new Date(a.date || '').getTime()
            )

          children.push({
            name: 'Projects',
            path: '/design/[slug]',
            children: designProjects,
          })
        } catch (e) {
          console.error(e)
          // [slug] directory doesn't exist, skip
        }
      }

      // Special handling for travel directory
      if (entry.name === 'travel') {
        const slugFolderPath = path.join(fullPath, '[slug]')
        try {
          await readdir(slugFolderPath)
          const travelPosts = travel.itineraries
            .filter((trip) => trip.status === 'Completed')
            .map((trip) => ({
              name: trip.title,
              path: `/travel/${trip.slug}`,
              children: [],
              isTravelPost: true,
              description: trip.description,
              date: trip.startDate,
            }))
            .sort(
              (a, b) =>
                new Date(b.date || '').getTime() -
                new Date(a.date || '').getTime()
            )

          children.push({
            name: 'Itineraries',
            path: '/travel/[slug]',
            children: travelPosts,
          })
        } catch (e) {
          console.error(e)
          // [slug] directory doesn't exist, skip
        }
      }

      if (children.length > 0) {
        routes.push({
          name: entry.name,
          path: normalizedPath,
          children: children.sort((a, b) => {
            if (a.path.includes('[slug]')) return 1
            if (b.path.includes('[slug]')) return -1
            return a.path.localeCompare(b.path)
          }),
        })
      }
    } else if (entry.name === 'page.tsx' && basePath !== '') {
      // Only add page.tsx routes if not in root (since we already added root)
      routes.push({
        name: path.basename(dir),
        path: normalizedPath,
        children: [],
      })
    }
  }

  // For top-level routes, ensure specific sort order
  if (basePath === '') {
    return routes.sort((a, b) => {
      if (a.path === '/') return -1
      if (b.path === '/') return 1
      return a.path.localeCompare(b.path)
    })
  }

  return routes
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
              ) : route.isBlogPost ? (
                <FileText className="h-4 w-4" />
              ) : route.isDesignProject ? (
                <Palette className="h-4 w-4" />
              ) : route.isTravelPost ? (
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
              {(route.isBlogPost ||
                route.isDesignProject ||
                route.isTravelPost) &&
                route.description && (
                  <p className="mt-1 font-sans text-sm text-muted-foreground">
                    {route.description}
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
  const appDir = path.join(process.cwd(), 'src', 'app')
  const routes = await getRoutes(appDir)

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
