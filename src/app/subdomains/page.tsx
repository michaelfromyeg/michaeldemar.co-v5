// src/app/subdomains/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe, ExternalLink } from 'lucide-react'
import subdomainsData from '@/data/subdomains.json'

interface SubdomainInfo {
  name: string
  type: string
  active: boolean
  proxied: boolean
  target?: string
}

interface EndpointStatus {
  status?: string
  error?: string
  statusCode?: number
  isUp?: boolean
}

export const metadata = {
  title: 'Subdomains | Michael DeMarco',
  description: 'Active subdomains under michaeldemar.co',
}

async function checkEndpoint(
  url: string,
  isApi: boolean
): Promise<EndpointStatus> {
  try {
    const endpoint = `https://${url}${isApi ? '/status' : ''}`
    const response = await fetch(endpoint, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HealthCheck/1.0)',
      },
    })

    const statusCode = response.status
    const isUp = statusCode >= 200 && statusCode < 400

    if (isApi) {
      if (!response.ok) {
        return {
          error: `HTTP ${statusCode}`,
          statusCode,
          isUp,
        }
      }
      const data = await response.json()
      return {
        status: JSON.stringify(data, null, 2),
        statusCode,
        isUp,
      }
    }

    // For non-API endpoints, just return the status code
    return {
      statusCode,
      isUp,
      status: `HTTP ${statusCode} ${response.statusText}`,
    }
  } catch (error) {
    console.error(error)
    return {
      error: 'Failed to fetch',
      isUp: false,
    }
  }
}

export default async function SubdomainsPage() {
  const { domain, subdomains } = subdomainsData

  // Pre-fetch statuses for all subdomains
  const endpointStatuses = await Promise.all(
    subdomains.map(async (subdomain) => {
      const fullDomain =
        subdomain.name === '@' ? domain : `${subdomain.name}.${domain}`
      const isApi = subdomain.name.startsWith('api')
      return {
        domain: fullDomain,
        status: await checkEndpoint(fullDomain, isApi),
      }
    })
  )

  const getEndpointStatus = (domain: string) =>
    endpointStatuses.find((status) => status?.domain === domain)?.status

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
          {subdomains.map((subdomain: SubdomainInfo) => {
            const fullDomain =
              subdomain.name === '@' ? domain : `${subdomain.name}.${domain}`
            const status = getEndpointStatus(fullDomain)
            return (
              <Card key={subdomain.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <a
                      href={`https://${fullDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      {fullDomain}
                      <ExternalLink className="h-4 w-4" />
                    </a>
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
                      {status && (
                        <Badge
                          variant={status.isUp ? 'default' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          {status.isUp ? '✓ Up' : '⨯ Down'}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Points to:{' '}
                      <code className="rounded bg-muted/20 px-2 py-1 font-mono text-foreground">
                        {subdomain.target}
                      </code>
                    </div>
                    {status && (
                      <div className="text-sm">
                        <div className="mb-2 font-medium">Status:</div>
                        <pre className="overflow-auto rounded bg-muted p-4">
                          {status.error ? (
                            <span className="text-destructive">
                              {status.error}
                            </span>
                          ) : status.isUp ? (
                            status.status
                          ) : (
                            <span className="text-destructive">
                              {status.status}
                            </span>
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
