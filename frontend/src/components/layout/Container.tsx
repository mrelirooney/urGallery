"use client";

import React, { type ElementType, type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType; // <— polymorphic tag (e.g., "div", "main", "section")
};

export default function Container({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={[
        "mx-auto w-full md:w-full max-w-7xl px-0",
        className,
      ].join(" ")}
    >
      {children}
    </Component>
  );
}
