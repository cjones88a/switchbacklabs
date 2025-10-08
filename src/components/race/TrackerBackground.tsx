import Image from "next/image";

/**
 * Decorative background for the Four-Seasons tracker.
 * - Fills the viewport behind content
 * - Low contrast + gradient wash keeps UI readable
 * - aria-hidden so it's ignored by assistive tech
 */
export default function TrackerBackground({
  /** Prefer WEBP if present; otherwise PNG is fine */
  src = "/race/4soh-background.png",
  className = "",
}: {
  src?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        priority={false}
        className="object-cover opacity-20 mix-blend-luminosity"
      />
      {/* Legibility wash — darkens toward the bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/40 to-bg/80" />
    </div>
  );
}
