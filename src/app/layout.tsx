import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Switchback Labs – Product Strategy & Technical PM",
  description:
    "Fractional PM and product leadership. Crisp strategy, evidence-based decisions, and specs developers love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
