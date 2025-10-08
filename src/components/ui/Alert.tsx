"use client";

import clsx from "clsx";

type Variant = "info" | "success" | "warning" | "error";

export default function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const ring = {
    info:    "ring-[hsl(var(--pb-line))]",
    success: "ring-[hsl(142, 70%, 45%)]",  // green
    warning: "ring-[hsl(42, 95%, 55%)]",   // yellow
    error:   "ring-[hsl(0, 85%, 55%)]",    // red
  }[variant];

  return (
    <div className={clsx(
      "card p-4 md:p-5 ring-1", ring, className,
    )}>
      {children}
    </div>
  );
}
