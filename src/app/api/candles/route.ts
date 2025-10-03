import { NextRequest } from "next/server";
import { getCandles } from "@/lib/candles";
import type { CandlesResponse } from "@/lib/types";

const VALID_RANGES = new Set(["1d", "5d"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const range = (searchParams.get("range") ?? "1d").toLowerCase();
  if (!symbol) {
    return Response.json({ error: "symbol parameter is required" }, { status: 400 });
  }
  if (!VALID_RANGES.has(range)) {
    return Response.json({ error: "range must be 1d or 5d" }, { status: 400 });
  }

  try {
    const data = await getCandles(symbol, range as "1d" | "5d");
    return Response.json<CandlesResponse & { cached: boolean }>(data);
  } catch (err) {
    return Response.json(
      {
        candles: [],
        source: "none",
        error: (err as Error).message,
      },
      { status: 502 }
    );
  }
}
