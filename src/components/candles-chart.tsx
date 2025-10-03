"use client";

import { useEffect, useRef } from "react";
import type { Candle } from "@/lib/types";

interface CandlesChartProps {
  candles: Candle[];
}

export function CandlesChart({ candles }: CandlesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    if (candles.length === 0) {
      context.fillStyle = "rgba(255,255,255,0.6)";
      context.font = "16px sans-serif";
      context.fillText("暫無資料", width / 2 - 40, height / 2);
      return;
    }
    const values = candles.map((c) => c.c);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    context.lineWidth = 2;
    context.strokeStyle = "#4f83ff";
    context.beginPath();
    candles.forEach((candle, index) => {
      const x = (index / (candles.length - 1)) * (width - 20) + 10;
      const y = height - ((candle.c - min) / range) * (height - 20) - 10;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  }, [candles]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={320}
      className="w-full rounded-lg border border-slate-700 bg-[#0f172a]"
      role="img"
      aria-label="分時走勢圖"
    />
  );
}
