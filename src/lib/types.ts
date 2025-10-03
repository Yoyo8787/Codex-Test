export type QuoteSource = "finnhub" | "yahoo" | "cache";
export type QuoteStatus = "ok" | "stale" | "error";

export interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  ts: number;
  source: QuoteSource;
  status: QuoteStatus;
}

export interface QuotesResponse {
  quotes: Quote[];
  ts: number;
  cached: boolean;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

export interface CandlesResponse {
  candles: Candle[];
  source: Exclude<QuoteSource, "cache"> | "none";
}

export interface AlertRule {
  id: string;
  symbol: string;
  direction: "above" | "below";
  target: number;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}
