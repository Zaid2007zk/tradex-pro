import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradex-pro-ai.vercel.app"),
  title: "TradeX PRO — Quantum Trading Terminal",
  description:
    "Institutional-grade trading terminal for Indian markets: live charts, market depth, AI signals, sector heatmap and paper trading with ₹10L virtual funds.",
  keywords: ["trading terminal", "NSE", "BSE", "paper trading", "charts", "AI signals", "TradeX PRO"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "TradeX PRO — Quantum Trading Terminal",
    description: "Live charts, depth, AI signals and paper trading for NSE / BSE markets",
    type: "website",
    url: "https://tradex-pro-ai.vercel.app",
    images: [
      {
        url: "/og-image.jpg",
        width: 882,
        height: 582,
        alt: "TradeX Pro AI Terminal Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeX PRO — Quantum Trading Terminal",
    description: "Live charts, depth, AI signals and paper trading for NSE / BSE markets",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0c10] text-slate-200`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
