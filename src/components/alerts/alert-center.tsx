"use client";

import { BellAlertIcon, CheckCircleIcon, XMarkIcon } from "@/components/icons";
import clsx from "clsx";
import type { AlertRule } from "@/lib/types";

interface AlertCenterProps {
  alerts: AlertRule[];
  onToggle: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
}

export function AlertCenter({ alerts, onToggle, onRemove }: AlertCenterProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-700 bg-surface/80 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <BellAlertIcon className="h-5 w-5" />
          告警中心
        </div>
        <span className="text-xs text-slate-400">共 {alerts.length} 條規則</span>
      </header>
      <div className="mt-4 space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-slate-400">尚未建立任何告警。</p>
        )}
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={clsx(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
              alert.active
                ? "border-slate-600 bg-slate-800/60"
                : "border-emerald-600/40 bg-emerald-900/30"
            )}
          >
            <div className="flex items-center gap-2">
              {alert.triggeredAt ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
              ) : (
                <BellAlertIcon className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <div className="font-medium text-slate-100">
                  {alert.symbol} {alert.direction === "above" ? "≥" : "≤"} {alert.target}
                </div>
                <div className="text-xs text-slate-400">
                  <span className="block">建立：{new Date(alert.createdAt).toLocaleString()}</span>
                  {alert.triggeredAt && (
                    <span className="block">
                      觸發：{new Date(alert.triggeredAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={clsx(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  alert.active
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-emerald-700 text-emerald-50 hover:bg-emerald-600"
                )}
                onClick={() => onToggle(alert.id, !alert.active)}
              >
                {alert.active ? "停用" : "啟用"}
              </button>
              <button
                className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600"
                onClick={() => onRemove(alert.id)}
                aria-label="移除告警"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
