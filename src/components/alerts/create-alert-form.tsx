"use client";

import { useState } from "react";

interface CreateAlertFormProps {
  symbol: string;
  onSubmit: (direction: "above" | "below", target: number) => void;
  onCancel: () => void;
}

export function CreateAlertForm({ symbol, onSubmit, onCancel }: CreateAlertFormProps) {
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [target, setTarget] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const numeric = Number(target);
        if (!Number.isFinite(numeric)) {
          setError("請輸入有效數值");
          return;
        }
        setError(null);
        onSubmit(direction, numeric);
      }}
    >
      <p className="text-sm text-slate-300">為 {symbol} 建立告警規則。</p>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            name="direction"
            value="above"
            checked={direction === "above"}
            onChange={() => setDirection("above")}
            className="h-4 w-4"
          />
          價格高於
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="radio"
            name="direction"
            value="below"
            checked={direction === "below"}
            onChange={() => setDirection("below")}
            className="h-4 w-4"
          />
          價格低於
        </label>
      </div>
      <div>
        <input
          type="number"
          step="0.01"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:border-accent focus:outline-none"
          placeholder="輸入目標價格"
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          取消
        </button>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          建立
        </button>
      </div>
    </form>
  );
}
