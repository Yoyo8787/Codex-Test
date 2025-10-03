import cache from "./cache";
import { getAllowlist, getCacheTtl } from "./env";
import { sanitizeSymbols } from "./symbols";
import { fetchFinnhubQuote, fetchYahooQuotes } from "./sources";
import type { Quote, QuotesResponse } from "./types";

const MAX_SYMBOLS = 50;

export async function getQuotes(symbols: string[]): Promise<QuotesResponse> {
  const allowedSymbols = filterAllowlist(symbols);
  if (allowedSymbols.length === 0) {
    return { quotes: [], ts: Date.now(), cached: false };
  }
  if (allowedSymbols.length > MAX_SYMBOLS) {
    throw new Error(`Too many symbols. Maximum is ${MAX_SYMBOLS}.`);
  }
  const normalized = sanitizeSymbols(allowedSymbols);
  const cacheKey = `quotes:${normalized.join(",")}`;
  const ttl = getCacheTtl();
  const cached = cache.get<QuotesResponse>(cacheKey);
  if (cached) {
    return { ...cached.value, cached: true };
  }

  const quotes: Quote[] = [];
  const errors: string[] = [];
  const missing = new Set(normalized);
  try {
    const keyAvailable = Boolean(process.env.FINNHUB_API_KEY);
    if (keyAvailable) {
      await Promise.all(
        normalized.map(async (symbol) => {
          try {
            const quote = await fetchFinnhubQuote(symbol);
            if (quote) {
              quotes.push(quote);
              missing.delete(symbol);
            }
          } catch (err) {
            errors.push(`${symbol}: ${(err as Error).message}`);
          }
        })
      );
    }
  } catch (err) {
    errors.push((err as Error).message);
  }

  if (missing.size > 0) {
    try {
      const yahooQuotes = await fetchYahooQuotes(Array.from(missing));
      yahooQuotes.forEach((quote) => {
        quotes.push(quote);
        missing.delete(quote.symbol);
      });
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  const now = Date.now();
  const result: QuotesResponse = {
    quotes: normalized.map((symbol) => {
      const quote = quotes.find((item) => item.symbol === symbol);
      if (!quote) {
        return {
          symbol,
          price: NaN,
          prevClose: NaN,
          ts: now,
          source: errors.length > 0 ? "cache" : "yahoo",
          status: "error" as const,
        };
      }
      return quote;
    }),
    ts: now,
    cached: false,
  };

  cache.set(cacheKey, result, ttl);
  return result;
}

function filterAllowlist(symbols: string[]): string[] {
  const allowlist = getAllowlist();
  if (!allowlist || allowlist.length === 0) return symbols;
  const set = new Set(allowlist);
  return symbols.filter((symbol) => set.has(symbol.toUpperCase()));
}
