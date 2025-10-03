import { getFinnhubKey } from "./env";
import type { Candle, CandlesResponse, Quote } from "./types";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const YAHOO_QUOTE_ENDPOINT = "https://query1.finance.yahoo.com/v7/finance/quote";
const YAHOO_CHART_ENDPOINT = "https://query1.finance.yahoo.com/v8/finance/chart";

interface FinnhubQuotePayload {
  c: number;
  pc: number;
  t: number;
}

interface YahooQuotePayload {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketTime: number;
}

export async function fetchFinnhubQuote(symbol: string): Promise<Quote | undefined> {
  const key = getFinnhubKey();
  if (!key) return undefined;
  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Finnhub quote failed: ${res.status}`);
  }
  const data = (await res.json()) as FinnhubQuotePayload;
  if (typeof data.c !== "number" || typeof data.pc !== "number") {
    throw new Error("Invalid Finnhub payload");
  }
  return {
    symbol,
    price: data.c,
    prevClose: data.pc,
    ts: (data.t ?? Date.now() / 1000) * 1000,
    source: "finnhub",
    status: "ok",
  };
}

export async function fetchYahooQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const url = `${YAHOO_QUOTE_ENDPOINT}?symbols=${encodeURIComponent(symbols.join(","))}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Yahoo quote failed: ${res.status}`);
  }
  const payload = (await res.json()) as {
    quoteResponse?: { result?: YahooQuotePayload[] };
  };
  const items = payload.quoteResponse?.result ?? [];
  return items
    .filter((item) =>
      typeof item.regularMarketPrice === "number" &&
      typeof item.regularMarketPreviousClose === "number"
    )
    .map((item) => ({
      symbol: item.symbol.toUpperCase(),
      price: item.regularMarketPrice,
      prevClose: item.regularMarketPreviousClose,
      ts: (item.regularMarketTime ?? Date.now() / 1000) * 1000,
      source: "yahoo" as const,
      status: "ok" as const,
    }));
}

interface FinnhubCandlePayload {
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v?: number[];
  s?: string;
}

export async function fetchFinnhubCandles(
  symbol: string,
  range: "1d" | "5d"
): Promise<CandlesResponse | undefined> {
  const key = getFinnhubKey();
  if (!key) return undefined;
  const resolution = range === "1d" ? "1" : "5";
  const now = Math.floor(Date.now() / 1000);
  const from = range === "1d" ? now - 60 * 60 * 24 : now - 60 * 60 * 24 * 5;
  const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(
    symbol
  )}&resolution=${resolution}&from=${from}&to=${now}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Finnhub candle failed: ${res.status}`);
  }
  const data = (await res.json()) as FinnhubCandlePayload;
  if (data.s !== "ok" || !Array.isArray(data.t)) {
    throw new Error("Invalid Finnhub candle payload");
  }
  const candles: Candle[] = data.t.map((timestamp, index) => ({
    t: timestamp * 1000,
    o: data.o[index],
    h: data.h[index],
    l: data.l[index],
    c: data.c[index],
    v: data.v?.[index],
  }));
  return { candles, source: "finnhub" };
}

interface YahooCandlePayload {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: number[];
          high?: number[];
          low?: number[];
          close?: number[];
          volume?: number[];
        }>;
      };
    }>;
  };
}

export async function fetchYahooCandles(
  symbol: string,
  range: "1d" | "5d"
): Promise<CandlesResponse> {
  const interval = range === "1d" ? "1m" : "5m";
  const url = `${YAHOO_CHART_ENDPOINT}/${encodeURIComponent(
    symbol
  )}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Yahoo candle failed: ${res.status}`);
  }
  const data = (await res.json()) as YahooCandlePayload;
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const quotes = result?.indicators?.quote?.[0];
  const candles: Candle[] = timestamps.map((ts, index) => ({
    t: ts * 1000,
    o: quotes?.open?.[index] ?? 0,
    h: quotes?.high?.[index] ?? 0,
    l: quotes?.low?.[index] ?? 0,
    c: quotes?.close?.[index] ?? 0,
    v: quotes?.volume?.[index],
  }));
  return { candles, source: "yahoo" };
}
