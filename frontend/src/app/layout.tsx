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
  title: "TradeX PRO — Quantum Trading Terminal",
  description:
    "Institutional-grade trading terminal for Indian markets: live charts, market depth, AI signals, sector heatmap and paper trading with ₹10L virtual funds.",
  keywords: ["trading terminal", "NSE", "BSE", "paper trading", "charts", "AI signals", "TradeX PRO"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TradeX PRO — Quantum Trading Terminal",
    description: "Live charts, depth, AI signals and paper trading for NSE / BSE markets",
    type: "website",
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
