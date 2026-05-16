import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SOCIETY } from "@/lib/society";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="px-5 py-5">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-start sm:items-center justify-center px-5 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-5 py-5 text-center text-2xs uppercase tracking-wider text-ink-soft">
        Made for {SOCIETY.name} {SOCIETY.block} · {SOCIETY.location}
      </footer>
    </div>
  );
}
