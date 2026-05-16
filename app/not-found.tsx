import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <p className="text-2xs uppercase tracking-widest text-ink-soft">404</p>
        <h1 className="mt-2 text-2xl display font-semibold">Nothing here</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
