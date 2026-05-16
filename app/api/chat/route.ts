import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getActiveSocietyId } from "@/lib/society-server";
import { CHAT_STOPWORDS, type ChatMessage, type ChatRequest, type ChatResponse } from "@/lib/chat";
import { SOCIETY, fullSocietyName } from "@/lib/society";

const MODEL = "claude-haiku-4-5";

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const message = (body.message ?? "").trim();
  if (!message) return new NextResponse("Empty message", { status: 400 });

  const societyId = await getActiveSocietyId();
  if (!societyId) {
    return new NextResponse(
      "Society not configured — run supabase/seed.sql in your Supabase project.",
      { status: 500 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const result = apiKey
    ? await llmReply(message, body.history ?? [], societyId, apiKey)
    : await keywordReply(message, societyId);

  return NextResponse.json(result satisfies ChatResponse);
}

// ---------------------------------------------------------------------------
// Keyword fallback — used until ANTHROPIC_API_KEY is set in the env.
// ---------------------------------------------------------------------------

async function keywordReply(message: string, societyId: string): Promise<ChatResponse> {
  const tokens = tokenize(message);
  const supabase = createClient();

  let listings: any[] = [];
  let vendors: any[] = [];

  if (tokens.length > 0) {
    const listingOr = tokens
      .flatMap((t) => [`name.ilike.%${t}%`, `description.ilike.%${t}%`])
      .join(",");
    const { data: lData } = await supabase
      .from("listings")
      .select(
        "id, name, description, price, unit, image_url, vendor:vendors!inner(id, business_name, photo_url, society_id, status)",
      )
      .eq("is_active", true)
      .eq("vendor.society_id", societyId)
      .eq("vendor.status", "approved")
      .or(listingOr)
      .limit(12);
    listings = lData ?? [];

    const vendorOr = tokens
      .flatMap((t) => [`business_name.ilike.%${t}%`, `tagline.ilike.%${t}%`])
      .join(",");
    const { data: vData } = await supabase
      .from("vendors")
      .select("id, business_name, tagline, photo_url, is_open, delivery_note")
      .eq("society_id", societyId)
      .eq("status", "approved")
      .or(vendorOr)
      .limit(6);
    vendors = vData ?? [];
  }

  const total = listings.length + vendors.length;
  const reply =
    total > 0
      ? `Here ${total === 1 ? "is what I" : `are ${total} things I`} found matching "${message}". The smart AI search will be even better once we plug in the key — for now this is a quick keyword search.`
      : `I couldn't find anything matching "${message}" yet. Try browsing the categories below, or once the AI key is added I'll be able to understand more loosely-worded requests.`;

  return { reply, listings, vendors, fallback: true };
}

function tokenize(s: string): string[] {
  const raw = s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !CHAT_STOPWORDS.has(t));
  // Add a stemmed variant for naive plural / -ing handling so "apples"
  // matches "Apple", "tomatoes" matches "tomato", etc.
  const out = new Set<string>();
  for (const t of raw) {
    out.add(t);
    if (t.length > 4 && t.endsWith("es")) out.add(t.slice(0, -2));
    else if (t.length > 4 && t.endsWith("s")) out.add(t.slice(0, -1));
    if (t.length > 5 && t.endsWith("ing")) out.add(t.slice(0, -3));
  }
  return Array.from(out);
}

// ---------------------------------------------------------------------------
// LLM path — Haiku with a small in-prompt catalog. Activated when key is set.
// ---------------------------------------------------------------------------

async function llmReply(
  message: string,
  history: ChatMessage[],
  societyId: string,
  apiKey: string,
): Promise<ChatResponse> {
  const supabase = createClient();

  // Fetch the catalog for this society. At MVP scale (~50-200 listings per
  // society) this fits comfortably into a single prompt.
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, name, description, price, unit, vendor:vendors!inner(id, business_name, is_open, society_id, status)",
    )
    .eq("is_active", true)
    .eq("vendor.society_id", societyId)
    .eq("vendor.status", "approved");
  const { data: services } = await supabase
    .from("services")
    .select(
      "id, name, description, starting_price, pricing_unit, vendor:vendors!inner(id, business_name, society_id, status)",
    )
    .eq("is_active", true)
    .eq("vendor.society_id", societyId)
    .eq("vendor.status", "approved");

  const catalogLines = [
    ...(listings ?? []).map(
      (l: any) =>
        `LISTING ${l.id} — ${l.name}${l.description ? ` (${l.description})` : ""} — ₹${l.price}/${l.unit} from ${l.vendor.business_name}${!l.vendor.is_open ? " [vendor closed]" : ""}`,
    ),
    ...(services ?? []).map(
      (s: any) =>
        `SERVICE ${s.id} — ${s.name}${s.description ? ` (${s.description})` : ""}${s.starting_price ? ` — from ₹${s.starting_price}/${s.pricing_unit}` : ""} from ${s.vendor.business_name}`,
    ),
  ];

  const system = `You are the friendly shopping assistant for ${SOCIETY.appName}, the hyperlocal marketplace for residents of ${fullSocietyName()}, ${SOCIETY.location}.

Your job: help residents find the right vendor or product for what they're looking for. Be warm but extremely concise — never more than two short sentences in your reply. Don't list items in prose; just point to the matches and trust the UI to render them.

The full catalog available right now (${catalogLines.length} items):
${catalogLines.join("\n") || "(catalog is empty)"}

When the user asks for something, identify which catalog entries best match. Reply in this exact format:

REPLY: <your 1-2 sentence friendly response>
MATCHES: <comma-separated list of matching LISTING ids only, max 8>

If nothing matches, say so kindly and suggest they browse categories. Use MATCHES: (empty).
Never invent IDs. Never recommend items that aren't in the catalog above.`;

  const anthropic = new Anthropic({ apiKey });
  const chatHistory = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  let text = "";
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [...chatHistory, { role: "user", content: message }],
    });
    text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("\n");
  } catch (err: any) {
    // Surface a clean error rather than 500-ing
    return {
      reply: `The AI assistant hit an error: ${err?.message ?? "unknown"}. Try again, or browse below.`,
      listings: [],
      vendors: [],
      fallback: false,
    };
  }

  const replyMatch = text.match(/REPLY:\s*([\s\S]*?)(?=\nMATCHES:|$)/i);
  const matchesMatch = text.match(/MATCHES:\s*([^\n]*)/i);
  const reply = (replyMatch?.[1] ?? text).trim();
  const matchIds = (matchesMatch?.[1] ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  let pickedListings: any[] = [];
  if (matchIds.length > 0) {
    const { data } = await supabase
      .from("listings")
      .select(
        "id, name, description, price, unit, image_url, vendor:vendors(id, business_name, photo_url)",
      )
      .in("id", matchIds);
    // Preserve LLM ranking order
    const order = new Map(matchIds.map((id, i) => [id, i]));
    pickedListings = (data ?? []).sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
    );
  }

  return { reply, listings: pickedListings, vendors: [], fallback: false };
}
