import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so production builds do not fetch Google Fonts.
// Google sometimes returns extensionless font URLs, which crash next/font.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const crimsonPro = localFont({
  src: "./fonts/crimson-latin.woff2",
  variable: "--font-crimson",
  display: "swap",
  weight: "200 900",
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
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
