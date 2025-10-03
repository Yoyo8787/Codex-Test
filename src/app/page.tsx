import { normalizeSymbols } from "@/lib/symbols";
import { WatchlistDashboard } from "@/components/watchlist/watchlist-dashboard";

interface PageProps {
  searchParams: { symbols?: string };
}

export default function Page({ searchParams }: PageProps) {
  const initialSymbols = searchParams.symbols
    ? normalizeSymbols(searchParams.symbols)
    : ["AAPL", "MSFT", "TSLA"];
  return <WatchlistDashboard initialSymbols={initialSymbols} />;
}
