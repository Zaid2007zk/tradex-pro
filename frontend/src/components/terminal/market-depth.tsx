"use client";

import { fmtPrice, fmtQty } from "@/lib/market/engine";
import { useDepth } from "@/hooks/use-market";

export default function MarketDepth({ price }: { price: number }) {
  const { bids, asks, spread } = useDepth(price);
  const maxQty = Math.max(...bids.map((b) => b.qty), ...asks.map((a) => a.qty));

  return (
    <div className="tx-panel shrink-0">
      <div className="tx-panel-head flex items-center justify-between px-3 py-1.5">
        <span className="text-[12px] font-semibold tracking-wide">Market Depth</span>
        <span className="font-mono text-[9.5px] text-white/40">
          Spread <span className="text-amber-300">₹{fmtPrice(spread)}</span>
        </span>
      </div>

      <div className="grid grid-cols-3 px-3 pb-0.5 pt-1.5 text-[8.5px] font-semibold uppercase tracking-wider text-white/35">
        <span>Price</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Orders</span>
      </div>

      {/* asks (descending so best ask is nearest center) */}
      <div className="tx-divide">
        {[...asks].reverse().map((a, i) => (
          <div key={`a-${i}`} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[10.5px] tabular-nums">
            <div
              className="absolute inset-y-0.5 right-0 rounded-l bg-rose-500/12"
              style={{ width: `${(a.qty / maxQty) * 62}%` }}
            />
            <span className="relative z-10 text-rose-400">₹{fmtPrice(a.price)}</span>
            <span className="relative z-10 text-center text-white/75">{fmtQty(a.qty)}</span>
            <span className="relative z-10 text-right text-white/40">{a.orders}</span>
          </div>
        ))}
      </div>

      {/* last price divider */}
      <div className="relative flex items-center justify-between bg-white/5 px-3 py-1">
        <span className="font-mono text-[11px] font-bold tabular-nums text-amber-300">₹{fmtPrice(price)}</span>
        <span className="text-[8.5px] font-semibold uppercase tracking-wider text-white/40">LTP</span>
      </div>

      {/* bids */}
      <div className="tx-divide pb-1">
        {bids.map((b, i) => (
          <div key={`b-${i}`} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[10.5px] tabular-nums">
            <div
              className="absolute inset-y-0.5 right-0 rounded-l bg-emerald-500/12"
              style={{ width: `${(b.qty / maxQty) * 62}%` }}
            />
            <span className="relative z-10 text-emerald-400">₹{fmtPrice(b.price)}</span>
            <span className="relative z-10 text-center text-white/75">{fmtQty(b.qty)}</span>
            <span className="relative z-10 text-right text-white/40">{b.orders}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
