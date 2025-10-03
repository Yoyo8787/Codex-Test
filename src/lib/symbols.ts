const SYMBOL_REGEX = /^[A-Z0-9_.-]{1,8}$/;

export function normalizeSymbols(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

export function validateSymbol(symbol: string): boolean {
  return SYMBOL_REGEX.test(symbol.toUpperCase());
}

export function sanitizeSymbols(symbols: string[]): string[] {
  return Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()))).filter(
    (s) => SYMBOL_REGEX.test(s)
  );
}
