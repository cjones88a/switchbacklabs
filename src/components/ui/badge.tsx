import { cn } from "@/lib/cn";

export function Badge({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700", className)}>{children}</div>;
}
