import type { Listing, Vendor } from "@/lib/types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Listings the assistant attached to this message (recommendations) */
  listings?: ChatListing[];
  /** Vendors the assistant attached to this message */
  vendors?: ChatVendor[];
}

export interface ChatListing
  extends Pick<Listing, "id" | "name" | "description" | "price" | "unit" | "image_url"> {
  vendor: { id: string; business_name: string; photo_url: string | null };
}

export interface ChatVendor
  extends Pick<
    Vendor,
    "id" | "business_name" | "tagline" | "photo_url" | "is_open" | "delivery_note"
  > {}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  listings: ChatListing[];
  vendors: ChatVendor[];
  /** True when the LLM key isn't configured and we fell back to keyword search. */
  fallback: boolean;
}

/** Stopwords we strip from keyword fallback queries. */
export const CHAT_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "have",
  "from",
  "want",
  "need",
  "looking",
  "find",
  "show",
  "some",
  "any",
  "what",
  "where",
  "when",
  "who",
  "how",
  "can",
  "you",
  "please",
  "thanks",
  "thank",
  "would",
  "could",
  "give",
  "tell",
  "buy",
  "get",
  "order",
]);

export const CHAT_SUGGESTIONS = [
  "Fresh vegetables under ₹100",
  "I need a plumber for tomorrow",
  "Cleaning help once a week",
  "What dal do you have",
  "Bananas and apples",
] as const;

export const PRODUCT_CHAT_SUGGESTIONS = [
  "Vegetables under ₹100",
  "Best fruits today",
  "I need milk and bread",
  "Show me the bakery items",
  "Anything organic",
] as const;

export const SERVICE_CHAT_SUGGESTIONS = [
  "Daily maid for 2 hours",
  "One-time deep clean",
  "I need a plumber today",
  "Tuition for class 8",
  "Move-out cleaning",
] as const;
