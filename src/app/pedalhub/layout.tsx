import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PedalHub — Cycling Command Center | Switchback Labs",
  description:
    "One-stop shop for mountain, road, and gravel: routes, ride log, navigation, weather, and tools. Fort Collins area.",
  openGraph: {
    title: "PedalHub — Cycling Command Center",
    description: "Routes, ride log, real maps, weather, tire calculator. Ride more, worry less.",
  },
};

export default function PedalHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}
