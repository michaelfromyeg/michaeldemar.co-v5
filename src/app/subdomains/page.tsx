import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe, ExternalLink, Maximize2 } from 'lucide-react'
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
  preview?: string // HTML content for non-API endpoints
}

export const metadata = {
  title: 'Subdomains | Michael DeMarco',
  description: 'Active subdomains under michaeldemar.co',
}

async function checkEndpoint(
  url: string,
  isApi: boolean
): Promise<EndpointStatus> {
  let endpoint = ''
  try {
    // For API endpoints, try root path first, then /status if root fails
    if (isApi) {
      try {
        // Try root path first
        endpoint = `https://${url}`
        const rootResponse = await fetch(`https://${url}`, {
          next: { revalidate: 60 },
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HealthCheck/1.0)',
          },
        })

        if (rootResponse.ok) {
          const data = await rootResponse.json()
          return {
            status: JSON.stringify(data, null, 2),
            statusCode: rootResponse.status,
            isUp: true,
          }
        }
      } catch (rootError) {
        // Root path failed, try /status
        console.log(`Root path failed for ${url}, trying /status`, rootError)
      }

      // Try /status endpoint
      endpoint = `https://${url}/status`
      const statusResponse = await fetch(`https://${url}/status`, {
        next: { revalidate: 60 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HealthCheck/1.0)',
        },
      })

      const statusCode = statusResponse.status
      const isUp = statusCode >= 200 && statusCode < 400

      if (!statusResponse.ok) {
        return {
          error: `HTTP ${statusCode}`,
          statusCode,
          isUp,
        }
      }

      const data = await statusResponse.json()
      return {
        status: JSON.stringify(data, null, 2),
        statusCode,
        isUp,
      }
    }

    // For non-API endpoints, just check the root path
    endpoint = `https://${url}`
    const response = await fetch(`https://${url}`, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HealthCheck/1.0)',
      },
    })

    const statusCode = response.status
    const isUp = statusCode >= 200 && statusCode < 400

    // For non-API endpoints, just return the status code and indicate it's a webpage
    return {
      statusCode,
      isUp,
      status: `HTTP ${statusCode} ${response.statusText}`,
      preview: endpoint, // Store the URL for iframe preview
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

  const sortedSubdomains = [...subdomains].sort((a, b) => {
    const isApiA = a.name.startsWith('api')
    const isApiB = b.name.startsWith('api')
    if (isApiA === isApiB) return 0
    return isApiA ? 1 : -1
  })

  // Pre-fetch statuses for all subdomains
  const endpointStatuses = await Promise.all(
    sortedSubdomains.map(async (subdomain) => {
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
          {sortedSubdomains.map((subdomain: SubdomainInfo) => {
            const fullDomain =
              subdomain.name === '@' ? domain : `${subdomain.name}.${domain}`
            const status = getEndpointStatus(fullDomain)
            const isApi = subdomain.name.startsWith('api')

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
                    {status && status.isUp && (
                      <div className="text-sm">
                        <div className="mb-2 font-medium">Preview:</div>
                        {isApi ? (
                          // Show API response for API endpoints
                          <pre className="overflow-auto rounded bg-muted p-4">
                            {status.status}
                          </pre>
                        ) : (
                          // Show iframe preview for non-API endpoints
                          <div className="relative">
                            <div className="overflow-hidden rounded border border-border">
                              <iframe
                                src={status.preview}
                                className="h-96 w-full"
                                sandbox="allow-same-origin allow-scripts"
                                loading="lazy"
                              />
                            </div>
                            <a
                              href={status.preview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-2 top-2 rounded-full bg-background/80 p-2 shadow-sm hover:bg-background"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {status && !status.isUp && (
                      <div className="text-sm">
                        <div className="mb-2 font-medium">Status:</div>
                        <pre className="overflow-auto rounded bg-muted p-4">
                          <span className="text-destructive">
                            {status.error || status.status}
                          </span>
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
