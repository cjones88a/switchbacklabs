"use client";

export default function StravaConnect({
  enabled,
  href = "/api/strava/authorize",
}: {
  enabled: boolean;
  href?: string;
}) {
  const base =
    "inline-flex items-center rounded-xl transition focus:outline-none focus-visible:ring-2 ring-offset-2 ring-[hsl(var(--pb-ink))]";

  if (!enabled) {
    return (
      <button
        type="button"
        aria-disabled
        className={`${base} opacity-40 cursor-not-allowed`}
        title="Please accept the display consent to continue"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/strava/connect-with-strava-orange.svg"
          alt="Connect with Strava"
          className="h-12 w-auto"
          height={48}
        />
      </button>
    );
  }

  return (
    <a href={href} className={base}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/strava/connect-with-strava-orange.svg"
        alt="Connect with Strava"
        className="h-12 w-auto"
        height={48}
      />
    </a>
  );
}
