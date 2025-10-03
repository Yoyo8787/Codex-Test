import type { Quote } from "./types";

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getChange(quote: Quote): { value: number; pct: number } {
  if (!Number.isFinite(quote.price) || !Number.isFinite(quote.prevClose)) {
    return { value: NaN, pct: NaN };
  }
  const value = quote.price - quote.prevClose;
  const pct = quote.prevClose === 0 ? 0 : (value / quote.prevClose) * 100;
  return { value, pct };
}

export function formatChange(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimestamp(ts: number): string {
  if (!Number.isFinite(ts)) return "-";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
