import type { Metadata } from "next";
import "./globals.css";
import { Inter, Archivo_Black } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Switchback Labs",
  description: "Product strategy & technical PM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${archivoBlack.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
