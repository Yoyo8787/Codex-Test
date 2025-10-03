import { NextRequest } from "next/server";
import { getQuotes } from "@/lib/quotes";
import { normalizeSymbols } from "@/lib/symbols";
import type { QuotesResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbols = searchParams.get("symbols");
  if (!rawSymbols) {
    return Response.json(
      { error: "symbols parameter is required" },
      { status: 400 }
    );
  }
  const symbols = normalizeSymbols(rawSymbols);
  if (symbols.length === 0) {
    return Response.json(
      { quotes: [], ts: Date.now(), cached: false },
      { status: 200 }
    );
  }

  try {
    const data = await getQuotes(symbols);
    return Response.json<QuotesResponse & { cached: boolean }>({
      ...data,
      cached: data.cached,
    });
  } catch (err) {
    return Response.json(
      {
        error: (err as Error).message,
        quotes: [],
        ts: Date.now(),
        cached: false,
      },
      { status: 400 }
    );
  }
}
