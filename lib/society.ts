/**
 * Society identity helpers — pulled from env so the same codebase can
 * be forked per society.
 */
export const SOCIETY = {
  slug: process.env.NEXT_PUBLIC_SOCIETY_SLUG ?? "mayfield-c-block",
  name: process.env.NEXT_PUBLIC_SOCIETY_NAME ?? "Mayfield Gardens",
  block: process.env.NEXT_PUBLIC_SOCIETY_BLOCK ?? "C-Block",
  location: process.env.NEXT_PUBLIC_SOCIETY_LOCATION ?? "Sector 50, Gurugram",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Mayfield Market",
  supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "",
};

export function fullSocietyName() {
  return `${SOCIETY.name}${SOCIETY.block ? ` ${SOCIETY.block}` : ""}`;
}
