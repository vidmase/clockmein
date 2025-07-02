import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: async (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0]
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1])
        return { success: true }
      }
      
      if (tokenCount[0] >= limit) {
        return { success: false, error: 'Rate limit exceeded' }
      }

      tokenCount[0] += 1
      tokenCache.set(token, tokenCount)
      return { success: true }
    }
  }
} //Comment: Rate limiting implementation using LRU cache 