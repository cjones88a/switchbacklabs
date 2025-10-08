export default function DashedRing({ className = "" }: { className?: string }) {
  // simple dashed circle vignette (no external assets)
  return (
    <div className={`rounded-full border border-dashed border-[hsl(var(--pb-stroke))] ${className}`} />
  );
}
