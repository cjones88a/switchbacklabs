import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Switchback Labs – Product work, built with AI",
  description: "A portfolio of product work and of learning to ship with AI. Training Coach is live. Case studies cover the build and a HubSpot franchise CRM.",
  keywords: ["product management", "technical pm", "product strategy", "Fort Collins"],
  authors: [{ name: "Switchback Labs" }],
  openGraph: {
    title: "Switchback Labs – Product work, built with AI",
    description: "Less Talk. More Shipped.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonPro.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
