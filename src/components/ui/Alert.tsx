import { cn } from "@/lib/cn";

export function Alert({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900", className)}>{children}</div>;
}
