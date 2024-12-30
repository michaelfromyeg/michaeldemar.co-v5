// src/app/subdomains/page.tsx
import { promises as fs } from 'fs'
import path from 'path'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe } from 'lucide-react'

interface SubdomainInfo {
  name: string
  type: string
  active: boolean
  proxied: boolean
  target?: string
  lastChecked: string
}

interface SubdomainsData {
  domain: string
  subdomains: SubdomainInfo[]
  generatedAt: string
}

export const metadata = {
  title: 'Subdomains | Michael DeMar',
  description: 'Active subdomains under michaeldemar.co',
}

async function getSubdomains(): Promise<SubdomainsData> {
  const filePath = path.join(process.cwd(), 'src/data/subdomains.json')
  const rawData = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(rawData)
}

export default async function SubdomainsPage() {
  const { domain, subdomains, generatedAt } = await getSubdomains()

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Subdomains</h1>
          <p className="text-muted-foreground">
            Showing {subdomains.length} subdomains under {domain}
          </p>
        </div>

        <div className="grid gap-4">
          {subdomains.map((subdomain) => (
            <Card key={subdomain.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {subdomain.name === '@'
                    ? domain
                    : `${subdomain.name}.${domain}`}
                  <div className="flex gap-2">
                    <Badge variant="secondary">{subdomain.type}</Badge>
                    {subdomain.proxied ? (
                      <Badge className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Proxied
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Direct
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Last checked:{' '}
                  {new Date(subdomain.lastChecked).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Points to:{' '}
                  <code className="rounded bg-muted px-2 py-1">
                    {subdomain.target}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(generatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
