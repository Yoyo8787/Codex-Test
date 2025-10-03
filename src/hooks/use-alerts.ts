"use client";

import { useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "./use-local-storage";
import type { AlertRule } from "@/lib/types";

const STORAGE_KEY = "watchlist-alerts";

function ensureUuid() {
  try {
    return uuid();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useLocalStorage<AlertRule[]>(STORAGE_KEY, []);

  const createAlert = useCallback(
    (symbol: string, direction: "above" | "below", target: number) => {
      const rule: AlertRule = {
        id: ensureUuid(),
        symbol: symbol.toUpperCase(),
        direction,
        target,
        active: true,
        createdAt: Date.now(),
      };
      setAlerts([...alerts, rule]);
      return rule;
    },
    [alerts, setAlerts]
  );

  const toggleAlert = useCallback(
    (id: string, active: boolean) => {
      setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, active } : alert)));
    },
    [alerts, setAlerts]
  );

  const markTriggered = useCallback(
    (id: string) => {
      setAlerts(
        alerts.map((alert) =>
          alert.id === id ? { ...alert, triggeredAt: Date.now(), active: false } : alert
        )
      );
    },
    [alerts, setAlerts]
  );

  const removeAlert = useCallback(
    (id: string) => {
      setAlerts(alerts.filter((alert) => alert.id !== id));
    },
    [alerts, setAlerts]
  );

  const bySymbol = useMemo(() => {
    return alerts.reduce<Record<string, AlertRule[]>>((acc, alert) => {
      const key = alert.symbol;
      acc[key] = acc[key] ? [...acc[key], alert] : [alert];
      return acc;
    }, {});
  }, [alerts]);

  return { alerts, createAlert, toggleAlert, markTriggered, removeAlert, bySymbol } as const;
}
