import { describe, expect, it } from "vitest";
import { normalizeSymbols, sanitizeSymbols, validateSymbol } from "@/lib/symbols";

describe("symbols", () => {
  it("normalizes comma separated list", () => {
    expect(normalizeSymbols("aapl, Msft ,aapl")).toEqual(["AAPL", "MSFT"]);
  });

  it("sanitizes invalid characters", () => {
    expect(sanitizeSymbols(["AAPL", "BAD#", "MSFT"])).toEqual(["AAPL", "MSFT"]);
  });

  it("validates allowed pattern", () => {
    expect(validateSymbol("TSLA")).toBe(true);
    expect(validateSymbol("$BAD")).toBe(false);
  });
});
