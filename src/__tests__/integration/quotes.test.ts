import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getQuotes } from "@/lib/quotes";
import cache from "@/lib/cache";

const FINNHUB_URL = "https://finnhub.io/api/v1/quote";
const YAHOO_URL = "https://query1.finance.yahoo.com/v7/finance/quote";

describe("getQuotes", () => {
  beforeEach(() => {
    cache.clear();
    vi.resetAllMocks();
    delete process.env.FINNHUB_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cache.clear();
  });

  it("falls back to yahoo when finnhub key missing", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith(YAHOO_URL)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            quoteResponse: {
              result: [
                {
                  symbol: "AAPL",
                  regularMarketPrice: 190.1,
                  regularMarketPreviousClose: 188.5,
                  regularMarketTime: 1700000000,
                },
              ],
            },
          }),
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getQuotes(["AAPL"]);
    expect(result.quotes[0].price).toBeCloseTo(190.1);
    expect(result.quotes[0].source).toBe("yahoo");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches repeated requests", async () => {
    process.env.FINNHUB_API_KEY = "test";
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith(FINNHUB_URL)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ c: 10, pc: 9, t: 1700000000, s: "ok" }),
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await getQuotes(["TSLA"]);
    const second = await getQuotes(["TSLA"]);
    expect(first.quotes[0].price).toBe(10);
    expect(second.cached).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
