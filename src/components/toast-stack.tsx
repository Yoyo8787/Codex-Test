"use client";

import { useEffect } from "react";

interface Toast {
  id: string;
  title: string;
  message: string;
}

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => onDismiss(toast.id), 4_000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [onDismiss, toasts]);

  return (
    <div className="fixed right-6 top-6 z-50 flex w-72 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl border border-emerald-500/60 bg-slate-900/90 p-4 shadow-lg"
        >
          <h3 className="text-sm font-semibold text-emerald-200">{toast.title}</h3>
          <p className="text-xs text-slate-300">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
