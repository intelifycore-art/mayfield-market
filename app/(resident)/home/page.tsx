import { redirect } from "next/navigation";

// /home was the old resident shop start; the landing at "/" now plays that role
// (with the AI chat hero + personalized greeting + recent orders). Keep this
// path as a redirect so old links and bookmarks still work.
export default function LegacyHome() {
  redirect("/");
}
