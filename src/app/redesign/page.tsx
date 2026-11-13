import type { Metadata } from "next";
import { Suspense } from "react";
import { parsePalette } from "./palette";
import RedesignClient from "./RedesignClient";

export const metadata: Metadata = {
  title: "Redesign prototype — Switchback Labs",
  description: "A palette study of the Switchback Labs home page. Not the live site.",
  robots: { index: false, follow: false },
};

export default async function RedesignPage({
  searchParams,
}: {
  searchParams: Promise<{ palette?: string }>;
}) {
  const { palette } = await searchParams;
  return (
    <Suspense fallback={null}>
      <RedesignClient initial={parsePalette(palette)} />
    </Suspense>
  );
}
