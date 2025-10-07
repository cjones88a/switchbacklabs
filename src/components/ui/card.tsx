import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("card p-4", className)}>{children}</div>;
}
export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h3 className="font-medium">{title}</h3>
      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
    </div>
  );
}