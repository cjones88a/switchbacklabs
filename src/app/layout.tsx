import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Switchback Labs",
  description: "Product & growth studio in Fort Collins. We build, ship, and iterate.",
  metadataBase: new URL("https://switchbacklabsco.com"),
  openGraph: {
    title: "Switchback Labs",
    description: "Product & growth studio in Fort Collins. We build, ship, and iterate.",
    url: "https://switchbacklabsco.com",
    siteName: "Switchback Labs",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Switchback Labs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Switchback Labs",
    description: "Product & growth studio in Fort Collins. We build, ship, and iterate.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}