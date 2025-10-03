"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ArrowPathIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { QuoteTable } from "./quote-table";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAlerts } from "@/hooks/use-alerts";
import { useVisibilityAwareInterval } from "@/hooks/use-visibility-poll";
import { useAudioAlert } from "@/hooks/use-audio-alert";
import { Modal } from "@/components/ui/modal";
import { CandlesChart } from "@/components/candles-chart";
import { AlertCenter } from "@/components/alerts/alert-center";
import { CreateAlertForm } from "@/components/alerts/create-alert-form";
import { ToastStack } from "@/components/toast-stack";
import { formatPrice } from "@/lib/format";
import { sanitizeSymbols } from "@/lib/symbols";
import type { CandlesResponse, Quote, QuotesResponse } from "@/lib/types";

interface DashboardProps {
  initialSymbols: string[];
}

interface ToastItem {
  id: string;
  title: string;
  message: string;
}

const DEFAULT_INTERVAL = 60_000;
const MAX_INTERVAL = 180_000;

type SortKey = "symbol" | "price" | "change";

type CandlesRange = "1d" | "5d";

export function WatchlistDashboard({ initialSymbols }: DashboardProps) {
  const { symbols, addSymbol, removeSymbol } = useWatchlist(initialSymbols);
  const sanitizedSymbols = useMemo(() => sanitizeSymbols(symbols), [symbols]);
  const { alerts, createAlert, toggleAlert, markTriggered, removeAlert, bySymbol } = useAlerts();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [inputSymbol, setInputSymbol] = useState("");
  const [pollInterval, setPollInterval] = useState(DEFAULT_INTERVAL);
  const { interval } = useVisibilityAwareInterval(pollInterval);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [range, setRange] = useState<CandlesRange>("1d");
  const [alertSymbol, setAlertSymbol] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [shareLink, setShareLink] = useState<string>("");
  const [isMuted, setMuted] = useState(false);
  const { play } = useAudioAlert();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (sanitizedSymbols.length > 0) {
      url.searchParams.set("symbols", sanitizedSymbols.join(","));
    } else {
      url.searchParams.delete("symbols");
    }
    window.history.replaceState(null, "", url.toString());
    setShareLink(url.toString());
  }, [sanitizedSymbols]);

  const quotesQuery = useQuery<QuotesResponse & { cached: boolean }>(
    {
      queryKey: ["quotes", sanitizedSymbols.join(",")],
      queryFn: async () => {
        if (sanitizedSymbols.length === 0) {
          return { quotes: [], ts: Date.now(), cached: false };
        }
        const response = await fetch(`/api/quotes?symbols=${sanitizedSymbols.join(",")}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch quotes: ${response.status}`);
        }
        return (await response.json()) as QuotesResponse & { cached: boolean };
      },
      enabled: sanitizedSymbols.length > 0,
      refetchInterval: interval === false ? false : interval,
    }
  );

  useEffect(() => {
    if (quotesQuery.isError) {
      setPollInterval((prev) => Math.min(prev + 60_000, MAX_INTERVAL));
    } else if (quotesQuery.isSuccess) {
      setPollInterval(DEFAULT_INTERVAL);
    }
  }, [quotesQuery.isError, quotesQuery.isSuccess]);

  useEffect(() => {
    if (!quotesQuery.data) return;
    quotesQuery.data.quotes.forEach((quote) => {
      const rules = bySymbol[quote.symbol] ?? [];
      rules.forEach((rule) => {
        if (!rule.active) return;
        if (!Number.isFinite(quote.price)) return;
        if (
          (rule.direction === "above" && quote.price >= rule.target) ||
          (rule.direction === "below" && quote.price <= rule.target)
        ) {
          markTriggered(rule.id);
          const id = cryptoRandomId();
          setToasts((prev) => [
            ...prev,
            {
              id,
              title: `${quote.symbol} 告警觸發`,
              message: `現價 ${formatPrice(quote.price)} 已達 ${rule.direction === "above" ? "高於" : "低於"} ${rule.target}`,
            },
          ]);
          if (!isMuted) {
            play();
          }
        }
      });
    });
  }, [bySymbol, isMuted, markTriggered, play, quotesQuery.data]);

  const filteredQuotes = useMemo(() => {
    const dataset = quotesQuery.data?.quotes ?? [];
    const filter = search.trim().toUpperCase();
    const filtered = filter
      ? dataset.filter((quote) => quote.symbol.includes(filter))
      : dataset;
    return [...filtered].sort((a, b) => sortQuotes(a, b, sortKey, sortDir));
  }, [quotesQuery.data?.quotes, search, sortDir, sortKey]);

  useEffect(() => {
    if (selectedSymbol) {
      setRange("1d");
    }
  }, [selectedSymbol]);

  const candlesQuery = useQuery<CandlesResponse & { cached: boolean }>(
    {
      queryKey: ["candles", selectedSymbol, range],
      queryFn: async () => {
        if (!selectedSymbol) {
          return { candles: [], source: "none", cached: false };
        }
        const response = await fetch(
          `/api/candles?symbol=${selectedSymbol}&range=${range}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch candles");
        }
        return (await response.json()) as CandlesResponse & { cached: boolean };
      },
      enabled: Boolean(selectedSymbol),
      refetchOnWindowFocus: false,
    }
  );

  const handleAddSymbol = () => {
    if (!inputSymbol.trim()) return;
    try {
      addSymbol(inputSymbol);
      setInputSymbol("");
    } catch (error) {
      setToasts((prev) => [
        ...prev,
        {
          id: cryptoRandomId(),
          title: "加入失敗",
          message: (error as Error).message,
        },
      ]);
    }
  };

  const handleCreateAlert = (symbol: string) => {
    setAlertSymbol(symbol);
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setToasts((prev) => [
        ...prev,
        {
          id: cryptoRandomId(),
          title: "已複製分享連結",
          message: shareLink,
        },
      ]);
    } catch {
      setToasts((prev) => [
        ...prev,
        {
          id: cryptoRandomId(),
          title: "複製失敗",
          message: "請手動複製網址列。",
        },
      ]);
    }
  };

  const statusBanner = renderStatusBanner(quotesQuery);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <section>
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">自選股儀表板</h1>
            <p className="text-sm text-slate-400">
              透過 Finnhub / Yahoo Finance 來源，每分鐘自動更新。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              onClick={() => quotesQuery.refetch()}
            >
              <ArrowPathIcon className={clsx("h-4 w-4", quotesQuery.isFetching && "animate-spin")}
              />
              立即更新
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              onClick={handleCopyShareLink}
            >
              <LinkIcon className="h-4 w-4" />
              分享連結
            </button>
            <button
              className={clsx(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm",
                isMuted
                  ? "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                  : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              )}
              onClick={() => setMuted((prev) => !prev)}
            >
              {isMuted ? "音效關" : "音效開"}
            </button>
          </div>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-surface/80 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <input
                    value={inputSymbol}
                    onChange={(event) => setInputSymbol(event.target.value.toUpperCase())}
                    placeholder="輸入股票代號"
                    className="w-40 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    onClick={handleAddSymbol}
                  >
                    <PlusIcon className="h-4 w-4" />
                    新增
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400" htmlFor="search">
                    搜尋
                  </label>
                  <input
                    id="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-40 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                排序：
                <button
                  className={clsx(
                    "rounded-md px-2 py-1",
                    sortKey === "symbol" ? "bg-accent/40 text-slate-100" : "hover:bg-slate-700"
                  )}
                  onClick={() => toggleSort("symbol", setSortKey, setSortDir, sortKey, sortDir)}
                >
                  代號
                </button>
                <button
                  className={clsx(
                    "rounded-md px-2 py-1",
                    sortKey === "price" ? "bg-accent/40 text-slate-100" : "hover:bg-slate-700"
                  )}
                  onClick={() => toggleSort("price", setSortKey, setSortDir, sortKey, sortDir)}
                >
                  價格
                </button>
                <button
                  className={clsx(
                    "rounded-md px-2 py-1",
                    sortKey === "change" ? "bg-accent/40 text-slate-100" : "hover:bg-slate-700"
                  )}
                  onClick={() => toggleSort("change", setSortKey, setSortDir, sortKey, sortDir)}
                >
                  漲跌幅
                </button>
              </div>
            </div>
            {statusBanner}
            <QuoteTable
              quotes={filteredQuotes}
              onSelect={setSelectedSymbol}
              onRemove={removeSymbol}
              onCreateAlert={handleCreateAlert}
              alerts={bySymbol}
            />
          </div>
          <AlertCenter
            alerts={alerts}
            onToggle={toggleAlert}
            onRemove={removeAlert}
          />
        </div>
      </section>

      <Modal
        open={Boolean(selectedSymbol)}
        onClose={() => setSelectedSymbol(null)}
        title={selectedSymbol ?? ""}
      >
        <div className="flex items-center gap-2">
          <button
            className={clsx(
              "rounded-md px-3 py-1 text-sm",
              range === "1d" ? "bg-accent text-white" : "bg-slate-700 text-slate-200"
            )}
            onClick={() => setRange("1d")}
          >
            1D
          </button>
          <button
            className={clsx(
              "rounded-md px-3 py-1 text-sm",
              range === "5d" ? "bg-accent text-white" : "bg-slate-700 text-slate-200"
            )}
            onClick={() => setRange("5d")}
          >
            5D
          </button>
        </div>
        <div className="mt-4">
          {candlesQuery.isLoading && <p className="text-sm text-slate-400">載入中...</p>}
          {candlesQuery.isError && (
            <p className="text-sm text-rose-400">暫時無法取得分時資料，請稍後再試。</p>
          )}
          {candlesQuery.data && candlesQuery.data.candles.length > 0 ? (
            <CandlesChart candles={candlesQuery.data.candles} />
          ) : (
            !candlesQuery.isLoading && (
              <p className="rounded-md bg-slate-800/60 p-4 text-sm text-slate-300">
                暫無分時資料。
              </p>
            )
          )}
          {candlesQuery.data && (
            <p className="mt-4 text-xs text-slate-500">
              資料來源：{candlesQuery.data.source}
              {candlesQuery.data.cached && "（快取）"}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(alertSymbol)}
        onClose={() => setAlertSymbol(null)}
        title={alertSymbol ? `${alertSymbol} 告警` : ""}
      >
        {alertSymbol && (
          <CreateAlertForm
            symbol={alertSymbol}
            onSubmit={(direction, target) => {
              const rule = createAlert(alertSymbol, direction, target);
              setToasts((prev) => [
                ...prev,
                {
                  id: cryptoRandomId(),
                  title: "告警建立成功",
                  message: `${rule.symbol} ${rule.direction === "above" ? "高於" : "低於"} ${rule.target}`,
                },
              ]);
              setAlertSymbol(null);
            }}
            onCancel={() => setAlertSymbol(null)}
          />
        )}
      </Modal>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </main>
  );
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function sortQuotes(a: Quote, b: Quote, key: SortKey, dir: "asc" | "desc") {
  const factor = dir === "asc" ? 1 : -1;
  if (key === "symbol") {
    return a.symbol.localeCompare(b.symbol) * factor;
  }
  if (key === "price") {
    return (Number(a.price) - Number(b.price)) * factor;
  }
  const changeA = Number(a.price) - Number(a.prevClose || 0);
  const changeB = Number(b.price) - Number(b.prevClose || 0);
  return (changeA - changeB) * factor;
}

function toggleSort(
  key: SortKey,
  setKey: (key: SortKey) => void,
  setDir: (dir: "asc" | "desc") => void,
  currentKey: SortKey,
  currentDir: "asc" | "desc"
) {
  if (currentKey === key) {
    setDir(currentDir === "asc" ? "desc" : "asc");
  } else {
    setKey(key);
    setDir("asc");
  }
}

function renderStatusBanner(
  quotesQuery: UseQueryResult<QuotesResponse & { cached: boolean }>
) {
  if (quotesQuery.isLoading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
        正在讀取最新報價...
      </div>
    );
  }
  if (quotesQuery.status === "idle") {
    return null;
  }
  if (quotesQuery.isError) {
    return (
      <div className="rounded-lg border border-rose-500/50 bg-rose-900/40 p-4 text-sm text-rose-200">
        資料來源暫時不可用，已暫停自動更新。
      </div>
    );
  }
  const data = quotesQuery.data;
  if (!data) return null;
  const hasError = data.quotes.some((quote) => quote.status === "error");
  if (hasError || data.cached) {
    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-900/30 p-4 text-sm text-amber-200">
        顯示快取資料，時間 {new Date(data.ts).toLocaleTimeString()}。來源可能暫時不穩定。
      </div>
    );
  }
  return null;
}
