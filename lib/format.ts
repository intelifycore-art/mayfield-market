/**
 * Indian rupee formatting — lakhs/crores aware.
 */
export function inr(amount: number, opts: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false, decimals = 0 } = opts;
  if (!Number.isFinite(amount)) return "₹0";

  if (compact) {
    if (Math.abs(amount) >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
    if (Math.abs(amount) >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
    if (Math.abs(amount) >= 1_000) return `₹${(amount / 1_000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function inrPlain(amount: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

export function relativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
