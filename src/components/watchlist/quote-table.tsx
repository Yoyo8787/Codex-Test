"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  TrashIcon,
} from "@/components/icons";
import clsx from "clsx";
import { formatChange, formatPercent, formatPrice, formatTimestamp, getChange } from "@/lib/format";
import type { AlertRule, Quote } from "@/lib/types";

interface QuoteTableProps {
  quotes: Quote[];
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onCreateAlert: (symbol: string) => void;
  alerts: Record<string, AlertRule[]>;
}

export function QuoteTable({ quotes, onSelect, onRemove, onCreateAlert, alerts }: QuoteTableProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [flashes, setFlashes] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef(new Map<string, number>());
  const timeoutRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    quotes.forEach((quote) => {
      const prev = prevPrices.current.get(quote.symbol);
      if (Number.isFinite(quote.price) && typeof prev === "number" && prev !== quote.price) {
        const direction = quote.price > prev ? "up" : "down";
        setFlashes((current) => ({ ...current, [quote.symbol]: direction }));
        const timer = setTimeout(() => {
          setFlashes((current) => ({ ...current, [quote.symbol]: null }));
        }, 800);
        const prevTimer = timeoutRef.current.get(quote.symbol);
        if (prevTimer) clearTimeout(prevTimer);
        timeoutRef.current.set(quote.symbol, timer);
      }
      if (Number.isFinite(quote.price)) {
        prevPrices.current.set(quote.symbol, quote.price);
      }
    });
    const removeKeys = Array.from(prevPrices.current.keys()).filter(
      (key) => !quotes.some((q) => q.symbol === key)
    );
    removeKeys.forEach((key) => {
      prevPrices.current.delete(key);
      const timer = timeoutRef.current.get(key);
      if (timer) {
        clearTimeout(timer);
        timeoutRef.current.delete(key);
      }
    });
  }, [quotes]);

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (quotes.length === 0) {
      setFocusIndex(0);
    } else if (focusIndex >= quotes.length) {
      setFocusIndex(quotes.length - 1);
    }
  }, [focusIndex, quotes.length]);

  const handleKey = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    if (quotes.length === 0) return;
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "j") {
      event.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, quotes.length - 1));
    } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "k") {
      event.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      onSelect(quotes[focusIndex].symbol);
    }
  };

  const activeSymbol = useMemo(() => quotes[focusIndex]?.symbol, [focusIndex, quotes]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-surface/60">
      <table className="w-full min-w-max table-fixed">
        <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">代號</th>
            <th className="px-4 py-3 text-right">最新價</th>
            <th className="px-4 py-3 text-right">漲跌</th>
            <th className="px-4 py-3 text-center">來源</th>
            <th className="px-4 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody
          className="divide-y divide-slate-800 text-sm"
          tabIndex={0}
          onKeyDown={handleKey}
          aria-label="自選股列表"
        >
          {quotes.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                尚未加入任何股票，請透過上方輸入框新增。
              </td>
            </tr>
          )}
          {quotes.map((quote) => {
            const change = getChange(quote);
            const direction = change.value > 0 ? "up" : change.value < 0 ? "down" : "flat";
            const isFocused = activeSymbol === quote.symbol;
            const flash = flashes[quote.symbol];
            const hasAlerts = (alerts[quote.symbol] ?? []).some((alert) => alert.active);
            return (
              <tr
                key={quote.symbol}
                className={clsx(
                  "cursor-pointer transition-colors focus-within:bg-slate-800/80",
                  flash === "up" && "animate-flashGain",
                  flash === "down" && "animate-flashLoss",
                  direction === "up" && "text-emerald-300",
                  direction === "down" && "text-rose-300"
                )}
                onClick={() => onSelect(quote.symbol)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSelect(quote.symbol);
                  }
                }}
              >
                <td
                  className={clsx("px-4 py-3 text-left", isFocused && "bg-slate-800/40")}
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={isFocused}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{quote.symbol}</span>
                    {hasAlerts && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                        告警
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">更新：{formatTimestamp(quote.ts)}</p>
                </td>
                <td className="px-4 py-3 text-right text-slate-100">
                  {formatPrice(quote.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {direction === "up" && <ArrowTrendingUpIcon className="h-4 w-4" />}
                    {direction === "down" && <ArrowTrendingDownIcon className="h-4 w-4" />}
                    <span>{formatChange(change.value)}</span>
                    <span className="text-xs text-slate-400">{formatPercent(change.pct)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs uppercase text-slate-400">
                  {quote.source}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <button
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs hover:bg-slate-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCreateAlert(quote.symbol);
                      }}
                    >
                      <BellAlertIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs hover:bg-slate-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(quote.symbol);
                      }}
                      aria-label={`移除 ${quote.symbol}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
