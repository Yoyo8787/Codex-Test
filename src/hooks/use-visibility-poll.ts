"use client";

import { useEffect, useRef, useState } from "react";

export function useVisibilityAwareInterval(baseInterval: number) {
  const [interval, setIntervalValue] = useState<number | false>(baseInterval);
  const visibilityRef = useRef<typeof document | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    visibilityRef.current = document;
    const handleVisibility = () => {
      if (!visibilityRef.current) return;
      setIntervalValue(visibilityRef.current.hidden ? false : baseInterval);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [baseInterval]);

  return { interval, setInterval: setIntervalValue };
}
