const DEFAULT_CACHE_TTL = 60_000;

export function getFinnhubKey(): string | undefined {
  const key = process.env.FINNHUB_API_KEY?.trim();
  return key ? key : undefined;
}

export function getCacheTtl(): number {
  const raw = process.env.CACHE_TTL_MS;
  if (!raw) return DEFAULT_CACHE_TTL;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CACHE_TTL;
}

export function getAllowlist(): string[] | undefined {
  const raw = process.env.ALLOWLIST_SYMBOLS;
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
