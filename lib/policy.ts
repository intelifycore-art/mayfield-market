import { fullSocietyName } from "@/lib/society";
import { inr } from "@/lib/format";

/**
 * Canonical rate label for a household service — the single source of truth
 * is the RWA rate card, so every card (list, profile, services) renders the
 * exact figures from the official document via this one helper.
 */
export function householdRateLabel(s: {
  rate_min: number | null;
  rate_max: number | null;
  rate_unit: string;
}): string {
  if (s.rate_min == null) return "On request";
  if (s.rate_max != null && s.rate_max !== s.rate_min) {
    return `${inr(s.rate_min)}–${inr(s.rate_max)} / ${s.rate_unit}`;
  }
  return `${inr(s.rate_min)} / ${s.rate_unit}`;
}

/**
 * Official RWA code of conduct for hired domestic staff in C-Block,
 * Mayfield Gardens. Fixed society policy — shown on the maids page so
 * residents and staff both know the rules.
 */
export const RWA_STAFF_POLICY = {
  intro: () =>
    `The RWA of ${fullSocietyName()}, Sector 50, Gurugram fixes the rates below for household jobs done by hired staff. Lower limit applies to smaller homes, upper limit to bigger homes.`,
  rules: [
    {
      title: "Leaves",
      detail: "2 leaves a month are allowed without any salary deduction.",
    },
    {
      title: "Notice period",
      detail: "Minimum 15 days notice before leaving work.",
    },
    {
      title: "Code of behaviour",
      detail:
        "If two or more houses submit a written complaint to the RWA about behaviour, feedback is taken from other houses where she works. On that basis she may be immediately blacklisted and her entry pass withdrawn.",
    },
    {
      title: "Age",
      detail: "Only staff above 18 years of age are allowed to work.",
    },
  ],
} as const;

export const HOUSEHOLD_GROUP_LABELS: Record<string, string> = {
  cleaning: "Cleaning & housekeeping",
  kitchen: "Kitchen & cooking",
  fulltime: "Full-time maid",
};
