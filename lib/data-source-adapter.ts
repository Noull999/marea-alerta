/**
 * Base adapter for all oceanographic data sources
 * Provides centralized retry logic, error handling, timeout, and logging
 */

interface RetryConfig {
  maxAttempts: number
  backoffMs: number
  timeoutMs: number
  jitterFactor: number
}

interface FetchResult<T> {
  success: boolean
  data: T | null
  error: string | null
  source: string
  duration: number
  attempt: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: parseInt(process.env.API_RETRY_MAX_ATTEMPTS || '3'),
  backoffMs: parseInt(process.env.API_RETRY_BACKOFF_MS || '1000'),
  timeoutMs: parseInt(process.env.API_TIMEOUT_MS || '30000'),
  jitterFactor: 0.1
}

export class DataSourceAdapter {
  protected sourceName: string

  constructor(sourceName: string) {
    this.sourceName = sourceName
  }

  /**
   * Fetch with automatic retry, timeout, and exponential backoff
   */
  protected async fetchWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<FetchResult<T>> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
    let lastError: Error | null = null
    const startTime = Date.now()

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeoutMs)

        let data: T
        try {
          data = await Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), finalConfig.timeoutMs)
            )
          ])
        } finally {
          clearTimeout(timeoutId)
        }

        const duration = Date.now() - startTime
        console.log(`[${this.sourceName}] ✅ Success on attempt ${attempt} (${duration}ms)`)

        return {
          success: true,
          data,
          error: null,
          source: this.sourceName,
          duration,
          attempt
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < finalConfig.maxAttempts) {
          const jitter = finalConfig.backoffMs * finalConfig.jitterFactor * Math.random()
          const waitMs = finalConfig.backoffMs * Math.pow(2, attempt - 1) + jitter

          console.warn(
            `[${this.sourceName}] ⚠️ Attempt ${attempt} failed: ${lastError.message}. ` +
            `Retrying in ${Math.round(waitMs)}ms...`
          )

          await new Promise((resolve) => setTimeout(resolve, waitMs))
        } else {
          console.error(
            `[${this.sourceName}] ❌ Failed after ${finalConfig.maxAttempts} attempts: ${lastError.message}`
          )
        }
      }
    }

    const duration = Date.now() - startTime
    return {
      success: false,
      data: null,
      error: lastError?.message || 'Unknown error',
      source: this.sourceName,
      duration,
      attempt: finalConfig.maxAttempts
    }
  }

  /**
   * Fetch JSON with retry logic
   */
  protected async fetchJSON<T>(
    url: string,
    options: RequestInit = {},
    retryConfig?: Partial<RetryConfig>
  ): Promise<FetchResult<T>> {
    return this.fetchWithRetry(async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'MareaAlerta/2.0',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<T>
    }, retryConfig)
  }

  /**
   * Parse and validate response
   */
  protected validateResponse<T>(
    data: unknown,
    requiredFields: string[]
  ): { valid: boolean; error?: string; data?: T } {
    if (!data) {
      return { valid: false, error: 'No data returned' }
    }

    if (typeof data !== 'object') {
      return { valid: false, error: 'Response is not an object' }
    }

    const obj = data as Record<string, unknown>
    const missing = requiredFields.filter((field) => !(field in obj))

    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` }
    }

    return { valid: true, data: data as T }
  }

  /**
   * Parse CSV string to array of objects
   */
  protected parseCSV(csv: string): Record<string, string>[] {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const row: Record<string, string> = {}

      headers.forEach((header, idx) => {
        row[header] = values[idx] || ''
      })

      rows.push(row)
    }

    return rows
  }

  /**
   * Get environment variable with fallback
   */
  protected getEnvVar(varName: string, fallback?: string): string {
    const value = process.env[varName]
    if (!value && !fallback) {
      console.warn(`[${this.sourceName}] ⚠️ Environment variable '${varName}' not set`)
      return ''
    }
    return value || fallback || ''
  }
}

/**
 * Utility to track source availability
 */
export class SourceAvailabilityTracker {
  private available: Set<string> = new Set()
  private unavailable: Set<string> = new Set()

  markAvailable(source: string) {
    this.available.add(source)
    this.unavailable.delete(source)
  }

  markUnavailable(source: string) {
    this.unavailable.add(source)
    this.available.delete(source)
  }

  getAvailable(): string[] {
    return Array.from(this.available)
  }

  getUnavailable(): string[] {
    return Array.from(this.unavailable)
  }

  getConfidencePercentage(sourceWeights: Record<string, number>): number {
    let confidence = 0
    const availableArray = this.getAvailable()

    availableArray.forEach((source) => {
      confidence += (sourceWeights[source] || 0) * 100
    })

    return Math.round(confidence)
  }
}
