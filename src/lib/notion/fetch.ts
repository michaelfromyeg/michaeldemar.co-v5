// src/lib/notion/fetch.ts
interface RetryOptions {
  maxRetries?: number
  timeout?: number
  backoff?: {
    initial: number
    max: number
    factor: number
  }
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  backoff: {
    initial: 1000, // Start with 1 second
    max: 10000, // Max 10 seconds
    factor: 2, // Double the delay each time
  },
}

export class FetchError extends Error {
  constructor(
    message: string,
    public response?: Response,
    public attempt?: number,
    public cause?: Error
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

export async function fetchWithRetry(
  url: string,
  options?: RetryOptions
): Promise<Response> {
  const opts = { ...defaultOptions, ...options }
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= opts.maxRetries!; attempt++) {
    // Bound time-to-response (headers) only; clear the timer once fetch()
    // resolves so a slow body read in fetchBuffer isn't aborted mid-download.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), opts.timeout)

    try {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MichaelDemarcoBot/1.0)',
          },
        })

        if (!response.ok) {
          throw new FetchError(
            `HTTP error! status: ${response.status}`,
            response,
            attempt
          )
        }

        return response
      } finally {
        clearTimeout(timeout)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry if we've hit the max attempts
      if (attempt === opts.maxRetries) {
        break
      }

      // Calculate backoff delay
      const delay = Math.min(
        opts.backoff!.initial * Math.pow(opts.backoff!.factor, attempt - 1),
        opts.backoff!.max
      )

      console.warn(
        `Fetch attempt ${attempt} failed for ${url}. Retrying in ${delay}ms...`,
        lastError.message
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new FetchError(
    `Failed to fetch ${url} after ${opts.maxRetries} attempts`,
    undefined,
    opts.maxRetries,
    lastError
  )
}

export async function fetchBuffer(
  url: string,
  options?: RetryOptions
): Promise<Buffer> {
  const response = await fetchWithRetry(url, options)
  return Buffer.from(await response.arrayBuffer())
}
