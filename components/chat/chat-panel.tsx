"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Send, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_SUGGESTIONS, type ChatMessage } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatListings, ChatVendors } from "./chat-results";

export function ChatPanel({
  variant = "hero",
  initialOpen = true,
  placeholder,
  title,
  subtitle,
  emptyPrompt,
  suggestions = CHAT_SUGGESTIONS as unknown as readonly string[],
}: {
  variant?: "hero" | "compact" | "inline";
  initialOpen?: boolean;
  placeholder?: string;
  title?: string;
  subtitle?: string;
  emptyPrompt?: string;
  suggestions?: readonly string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: ChatMessage = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: messages }),
      });
      if (!res.ok) {
        const errText = await res.text();
        setMessages([
          ...next,
          {
            role: "assistant",
            content: `Something went wrong: ${errText}. Try again?`,
          },
        ]);
        setBusy(false);
        return;
      }
      const data = await res.json();
      setFallback(!!data.fallback);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply,
          listings: data.listings,
          vendors: data.vendors,
        },
      ]);
    } catch (e: any) {
      setMessages([
        ...next,
        { role: "assistant", content: `Network error: ${e.message}` },
      ]);
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  function reset() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  const empty = messages.length === 0;

  const heightClass =
    variant === "hero"
      ? "min-h-[440px]"
      : variant === "inline"
      ? "min-h-[200px]"
      : "min-h-[280px]";

  const finalTitle = title ?? "How can I help today?";
  const finalSubtitle = subtitle ?? "Find vendors, products, and services on your block";
  const finalPlaceholder =
    placeholder ?? "What are you looking for today?";
  const finalEmptyPrompt =
    emptyPrompt ??
    (variant === "hero"
      ? "Ask in plain English. I'll find vendors and products that fit."
      : "Try one of these to start:");

  return (
    <div
      className={cn(
        "flex flex-col bg-white border border-line rounded-2xl shadow-card overflow-hidden",
        heightClass,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 border-b border-line bg-gradient-to-b from-brand-tint/40 to-transparent",
          variant === "hero" ? "py-3.5" : "py-2.5",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "rounded-md bg-brand text-white grid place-items-center shrink-0",
              variant === "hero" ? "h-8 w-8" : "h-6 w-6",
            )}
          >
            <Sparkles className={variant === "hero" ? "h-4 w-4" : "h-3.5 w-3.5"} />
          </div>
          <div>
            <p
              className={cn(
                "font-semibold leading-tight",
                variant === "hero" ? "display text-lg" : "text-sm",
              )}
            >
              {finalTitle}
            </p>
            <p
              className={cn(
                "text-ink-soft",
                variant === "hero" ? "text-xs" : "text-2xs",
              )}
            >
              {finalSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fallback ? (
            <Badge variant="outline" className="hidden sm:inline-flex">
              Keyword search
            </Badge>
          ) : messages.length > 0 ? (
            <Badge variant="brand" className="hidden sm:inline-flex">
              AI
            </Badge>
          ) : null}
          {messages.length > 0 ? (
            <button
              onClick={reset}
              className="text-ink-soft hover:text-ink p-1 rounded-md hover:bg-bg-subtle"
              title="Start over"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {empty ? (
          <EmptyState
            onPick={(s) => send(s)}
            variant={variant}
            prompt={finalEmptyPrompt}
            suggestions={suggestions}
          />
        ) : (
          messages.map((m, i) => <MessageBubble key={i} message={m} />)
        )}
        {busy ? (
          <div className="flex items-center gap-2 text-ink-soft text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching the block...
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-line p-2 flex items-end gap-2 bg-bg-subtle/50"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={finalPlaceholder}
          className={cn(
            "flex-1 resize-none bg-transparent placeholder:text-ink-faint focus:outline-none px-2 py-2 max-h-28",
            variant === "hero" ? "text-base" : "text-sm",
          )}
          disabled={busy}
        />
        <Button
          type="submit"
          variant="brand"
          size={variant === "hero" ? "md" : "icon"}
          disabled={busy || !input.trim()}
          className="shrink-0"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : variant === "hero" ? (
            <>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Ask</span>
            </>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

function EmptyState({
  onPick,
  variant,
  prompt,
  suggestions,
}: {
  onPick: (s: string) => void;
  variant: "hero" | "compact" | "inline";
  prompt: string;
  suggestions: readonly string[];
}) {
  return (
    <div className="text-center py-2">
      <p
        className={cn(
          "text-ink-muted",
          variant === "hero" ? "text-sm" : "text-xs",
        )}
      >
        {prompt}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-brand-tint text-brand-dark hover:bg-brand hover:text-white transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-brand text-white px-3.5 py-2 text-sm">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-bg-subtle text-ink px-3.5 py-2 text-sm">
        {message.content}
      </div>
      {message.listings && message.listings.length > 0 ? (
        <ChatListings listings={message.listings} />
      ) : null}
      {message.vendors && message.vendors.length > 0 ? (
        <ChatVendors vendors={message.vendors} />
      ) : null}
    </div>
  );
}
