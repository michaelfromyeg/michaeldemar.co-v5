// src/lib/notion/fetch.ts
import fetch, { Response, RequestInit } from 'node-fetch'
import { AbortController } from 'node-abort-controller'

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
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), opts.timeout)

      const fetchOptions: RequestInit = {
        signal: controller.signal as any, // Type assertion needed due to type mismatch
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MichaelDemarcoBot/1.0)',
        },
      }

      try {
        const response = await fetch(url, fetchOptions)

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
    } catch (error: any) {
      lastError = error

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
        error.message
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
