import clsx from "clsx";
export default function Badge({ children, tone="brand" }:{ children:React.ReactNode; tone?: "brand"|"neutral"|"warning" }) {
  const cls = {
    brand: "bg-[hsl(var(--brand))] text-[hsl(var(--brand-fg))]",
    neutral: "bg-[hsl(var(--border))] text-[hsl(var(--fg))]",
    warning: "bg-amber-500 text-amber-50",
  }[tone];
  return <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>{children}</span>;
}
