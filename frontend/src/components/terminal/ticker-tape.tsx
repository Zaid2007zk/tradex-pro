"use client";

import { STOCKS, fmtPct, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

export default function TickerTape({
  quotes,
  onSelect,
}: {
  quotes: Record<string, Quote>;
  onSelect: (s: string) => void;
}) {
  const items = STOCKS.map((s) => {
    const q = quotes[s.symbol];
    return { symbol: s.symbol, price: q?.price ?? s.base, chgPct: q?.chgPct ?? 0, currency: s.currency };
  });
  // duplicated once for a seamless -50% loop
  const loop = [...items, ...items];

  return (
    <div className="relative shrink-0 overflow-hidden border-b border-white/8 bg-[#0c0e13]">
      <div className="tx-marquee flex w-max items-center">
        {loop.map((it, i) => {
          const up = it.chgPct >= 0;
          return (
            <button
              key={`${it.symbol}-${i}`}
              onClick={() => onSelect(it.symbol)}
              className="flex items-center gap-2 border-r border-white/6 px-4 py-1.5 transition hover:bg-white/4"
            >
              <span className="text-[11.5px] font-semibold tracking-wide">{it.symbol}</span>
              <span className="font-mono text-[11.5px] tabular-nums text-white/70">
                {it.currency === "USD" ? "$" : "₹"}{fmtPrice(it.price)}
              </span>
              <span className={`font-mono text-[11px] font-medium tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}>
                {up ? "▲" : "▼"} {fmtPct(it.chgPct)}
              </span>
            </button>
          );
        })}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0c0e13] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0c0e13] to-transparent" />
    </div>
  );
}
