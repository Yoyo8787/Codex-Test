"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import { sanitizeSymbols, validateSymbol } from "@/lib/symbols";

const STORAGE_KEY = "watchlist-symbols";

export function useWatchlist(initialSymbols: string[]) {
  const sanitizedInitial = useMemo(() => sanitizeSymbols(initialSymbols), [initialSymbols]);
  const [persisted, setPersisted] = useLocalStorage<string[]>(STORAGE_KEY, sanitizedInitial);
  const [symbols, setSymbols] = useState<string[]>(() =>
    Array.from(new Set([...(sanitizedInitial ?? []), ...(persisted ?? [])]))
  );

  useEffect(() => {
    setSymbols((prev) => Array.from(new Set([...(prev ?? []), ...sanitizedInitial])));
  }, [sanitizedInitial]);

  useEffect(() => {
    setPersisted(symbols);
  }, [setPersisted, symbols]);

  const addSymbol = useCallback((symbol: string) => {
    const upper = symbol.trim().toUpperCase();
    if (!validateSymbol(upper)) {
      throw new Error("Invalid symbol format");
    }
    setSymbols((prev) => Array.from(new Set([...prev, upper])));
  }, []);

  const removeSymbol = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase();
    setSymbols((prev) => prev.filter((item) => item !== upper));
  }, []);

  const clear = useCallback(() => {
    setSymbols([]);
  }, []);

  return { symbols, addSymbol, removeSymbol, clear } as const;
}
