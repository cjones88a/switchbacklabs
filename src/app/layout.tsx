import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  metadataBase: new URL("https://switchbacklabsco.com"),
  title: "Switchback Labs — Product Strategy & Technical PM",
  description: "Consulting in strategy, research, design, and requirements. Built by a senior PM with principal-level engineering chops.",
  openGraph: {
    title: "Switchback Labs",
    description: "Product Strategy & Technical PM Consulting",
    url: "https://switchbacklabsco.com",
    siteName: "Switchback Labs",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col" suppressHydrationWarning>
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
