export function Skeleton({ className="" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[hsl(var(--border))] ${className}`} />;
}
export function Spinner({ size=16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin text-[hsl(var(--muted))]">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );
}
