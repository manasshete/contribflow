interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Tiny in-memory, per-process TTL cache for expensive/rate-limited GitHub API
 * calls that are otherwise re-fetched identically across multiple endpoints
 * within the same short user flow (recommendations, issue analysis, First
 * Contribution Mode).
 */
export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private ttlMs: number) {}

  async getOrCompute(key: string, compute: () => Promise<T>): Promise<T> {
    const entry = this.store.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    const value = await compute();
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
