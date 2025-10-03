import cache from "@/lib/cache";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("MemoryCache", () => {
  beforeEach(() => {
    cache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cache.clear();
  });

  it("returns cached value before expiration", () => {
    cache.set("key", { foo: "bar" }, 1000);
    const entry = cache.get<{ foo: string }>("key");
    expect(entry?.value.foo).toBe("bar");
  });

  it("expires after ttl", () => {
    cache.set("key", 42, 1000);
    vi.advanceTimersByTime(1500);
    const entry = cache.get<number>("key");
    expect(entry).toBeUndefined();
  });
});
