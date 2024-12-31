// src/app/subdomains/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe } from 'lucide-react'
import subdomainsData from '@/data/subdomains.json'

interface SubdomainInfo {
  name: string
  type: string
  active: boolean
  proxied: boolean
  target?: string
}

export const metadata = {
  title: 'Subdomains | Michael DeMarco',
  description: 'Active subdomains under michaeldemar.co',
}

export default function SubdomainsPage() {
  const { domain, subdomains } = subdomainsData
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
          {subdomains.map((subdomain: SubdomainInfo) => (
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
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Points to:{` `}
                  <code className="border-gruvbox rounded bg-muted/20 px-2 py-1 font-mono text-foreground">
                    {subdomain.target}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
