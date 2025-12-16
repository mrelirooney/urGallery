import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-14" />}>
      <LoginClient />
    </Suspense>
  );
}
