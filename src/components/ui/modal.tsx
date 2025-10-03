"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const node = containerRef.current;
    node?.focus({ preventScroll: true });
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="relative z-10 w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left shadow-xl transition-all"
      >
        {title && (
          <div id={titleId} className="text-lg font-semibold text-slate-100">
            {title}
          </div>
        )}
        <div className="mt-4 text-slate-200">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-700/70 p-1 text-slate-200 transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="關閉"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
