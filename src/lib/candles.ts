import cache from "./cache";
import { getCacheTtl } from "./env";
import { fetchFinnhubCandles, fetchYahooCandles } from "./sources";
import type { CandlesResponse } from "./types";

export async function getCandles(
  symbol: string,
  range: "1d" | "5d"
): Promise<CandlesResponse & { cached: boolean }> {
  const cacheKey = `candles:${symbol}:${range}`;
  const ttl = getCacheTtl();
  const cached = cache.get<CandlesResponse & { cached: boolean }>(cacheKey);
  if (cached) {
    return { ...cached.value, cached: true };
  }

  const result = await fetchCandles(symbol, range);
  cache.set(cacheKey, { ...result, cached: false }, ttl);
  return { ...result, cached: false };
}

async function fetchCandles(
  symbol: string,
  range: "1d" | "5d"
): Promise<CandlesResponse> {
  const errors: string[] = [];
  try {
    const finnhub = await fetchFinnhubCandles(symbol, range);
    if (finnhub && finnhub.candles.length > 0) {
      return finnhub;
    }
  } catch (err) {
    errors.push((err as Error).message);
  }

  try {
    const yahoo = await fetchYahooCandles(symbol, range);
    if (yahoo.candles.length > 0) {
      return yahoo;
    }
  } catch (err) {
    errors.push((err as Error).message);
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  return { candles: [], source: "none" };
}
