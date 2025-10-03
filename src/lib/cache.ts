export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set<T>(key: string, value: T, ttlMs: number): CacheEntry<T> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
    };
    this.store.set(key, entry);
    return entry;
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __MEMORY_CACHE__: MemoryCache | undefined;
}

const cache = globalThis.__MEMORY_CACHE__ ?? new MemoryCache();
if (!globalThis.__MEMORY_CACHE__) {
  globalThis.__MEMORY_CACHE__ = cache;
}

export default cache;
