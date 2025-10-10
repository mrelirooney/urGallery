"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import Container from "./Container";
import Footer from "./Footer";

type Props = {
  children: ReactNode;
  padMain?: boolean; // add vertical padding inside main
};

export default function PageShell({ children, padMain = true }: Props) {
  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <Navbar />
      <main className={padMain ? "py-8 sm:py-10" : ""}>
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
