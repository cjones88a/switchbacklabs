import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Switchback Labs",
  description: "Product strategy & technical PM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
