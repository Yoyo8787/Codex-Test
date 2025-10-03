import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WatchlistDashboard } from "@/components/watchlist/watchlist-dashboard";
import type { QuotesResponse, CandlesResponse } from "@/lib/types";

describe("WatchlistDashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    queryClient = new QueryClient();
    vi.stubGlobal("fetch", createFetchStub());
    vi.stubGlobal("AudioContext", class {
      createOscillator() {
        return { connect: () => {}, start: () => {}, stop: () => {} };
      }
      createGain() {
        return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } };
      }
      get destination() {
        return {};
      }
      get currentTime() {
        return 0;
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("allows adding symbol and opening modal", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WatchlistDashboard initialSymbols={["AAPL"]} />
      </QueryClientProvider>
    );

    expect(await screen.findByText("自選股儀表板")).toBeInTheDocument();
    expect(await screen.findByText("AAPL")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("輸入股票代號"), {
      target: { value: "MSFT" },
    });
    fireEvent.click(screen.getByText("新增"));

    await waitFor(() => expect(screen.getAllByText(/MSFT|AAPL/).length).toBeGreaterThan(1));

    fireEvent.click(screen.getByText("AAPL"));
    expect(await screen.findByText("1D")).toBeInTheDocument();
  });
});

function createFetchStub() {
  return vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/quotes")) {
      const payload: QuotesResponse & { cached: boolean } = {
        quotes: [
          {
            symbol: "AAPL",
            price: 150,
            prevClose: 145,
            ts: Date.now(),
            source: "finnhub",
            status: "ok",
          },
          {
            symbol: "MSFT",
            price: 320,
            prevClose: 310,
            ts: Date.now(),
            source: "finnhub",
            status: "ok",
          },
        ],
        ts: Date.now(),
        cached: false,
      };
      return Promise.resolve({ ok: true, json: async () => payload });
    }
    if (url.includes("/api/candles")) {
      const payload: CandlesResponse & { cached: boolean } = {
        candles: [
          { t: Date.now(), o: 150, h: 151, l: 149, c: 150 },
          { t: Date.now() + 60_000, o: 150, h: 152, l: 148, c: 151 },
        ],
        source: "finnhub",
        cached: false,
      };
      return Promise.resolve({ ok: true, json: async () => payload });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}
