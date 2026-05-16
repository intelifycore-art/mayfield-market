"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./chat-panel";

/**
 * Floating chat trigger that opens a panel from the bottom on mobile and a
 * popover-style sheet on desktop.
 */
export function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-30 bottom-20 right-4 sm:bottom-6 sm:right-6",
          "h-12 px-4 rounded-full bg-brand text-white shadow-pop hover:bg-brand-dark",
          "flex items-center gap-2 font-medium text-sm",
          "transition-transform hover:scale-105",
          open && "scale-0",
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Mayfield</span>
        <span className="sm:hidden">Ask</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-ink/30 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-2 pb-1 sm:hidden">
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setOpen(false)}
                className="hidden sm:grid absolute -top-2 -right-2 z-10 h-7 w-7 place-items-center rounded-full bg-ink text-white hover:bg-ink-muted shadow-pop"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <ChatPanel variant="compact" placeholder="Anything else you need?" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
