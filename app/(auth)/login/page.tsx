import { Suspense } from "react";
import { LoginForm } from "./form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; role?: string };
}) {
  return (
    <Suspense>
      <LoginForm next={searchParams.next} role={searchParams.role} />
    </Suspense>
  );
}
