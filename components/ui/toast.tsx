"use client";

import * as React from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "info" }),
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pb-safe">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border bg-white shadow-pop px-4 py-3 flex items-start gap-3 animate-fade-in",
            t.variant === "success" && "border-success/20",
            t.variant === "error" && "border-danger/20",
            t.variant === "info" && "border-line",
          )}
        >
          <div className="mt-0.5 shrink-0">
            {t.variant === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : t.variant === "error" ? (
              <AlertCircle className="h-4 w-4 text-danger" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-ink-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">{t.title}</p>
            {t.description ? (
              <p className="text-xs text-ink-muted mt-0.5">{t.description}</p>
            ) : null}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-ink-faint hover:text-ink-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
