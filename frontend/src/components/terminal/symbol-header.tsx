"use client";

import { ArrowDownRight, ArrowUpRight, Eye, Gauge, Layers, ShieldCheck } from "lucide-react";
import { STOCKS, fmtCompact, fmtPct, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import { isShariahCompliant } from "./shariah-modal";

export default function SymbolHeader({ symbol, quote }: { symbol: string; quote: Quote }) {
  const def = STOCKS.find((s) => s.symbol === symbol)!;
  const isHalal = isShariahCompliant(symbol);
  const up = quote.chgPct >= 0;
  const dayRange = quote.dayHigh - quote.dayLow || 1;
  const posInRange = Math.min(100, Math.max(0, ((quote.price - quote.dayLow) / dayRange) * 100));

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      {/* identity + price */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold text-amber-300">
          {def.symbol.slice(0, 4)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">{symbol}</h1>
            <span className="rounded border border-white/12 bg-white/6 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white/55">
              NSE
            </span>
            <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-300">
              EQ
            </span>
            {isHalal ? (
              <span className="rounded border border-emerald-500/35 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-300">
                ✓ HALAL
              </span>
            ) : (
              <span className="rounded border border-rose-500/35 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-300">
                NON-PERMISSIBLE
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11.5px] text-white/45">
            {def.name} · {def.sector}
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div
          key={quote.price}
          className={`rounded-lg px-1 font-mono text-[30px] font-bold leading-none tracking-tight tabular-nums ${
            quote.tickDir === 1 ? "tx-flash-up text-emerald-400" : quote.tickDir === -1 ? "tx-flash-down text-rose-400" : "text-white"
          }`}
        >
          ₹{fmtPrice(quote.price)}
        </div>
        <div
          className={`mb-0.5 flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[13px] font-semibold tabular-nums ${
            up ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"
          }`}
        >
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {fmtPct(quote.chgPct)}
        </div>
      </div>

      {/* day range */}
      <div className="min-w-52 flex-1">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-white/40">
          <span>L {fmtPrice(quote.dayLow)}</span>
          <span className="uppercase tracking-wider">Day Range</span>
          <span>H {fmtPrice(quote.dayHigh)}</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500/50 via-white/15 to-emerald-500/50">
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#0a0c10] bg-amber-400 shadow-[0_0_10px_rgba(240,185,11,0.7)] transition-all duration-700"
            style={{ left: `calc(${posInRange}% - 6px)` }}
          />
        </div>
      </div>

      {/* stats */}
      <div className="hidden items-center gap-5 md:flex">
        <Stat icon={<Layers className="h-3.5 w-3.5" />} label="Volume" value={fmtCompact(quote.volume)} />
        <Stat icon={<Gauge className="h-3.5 w-3.5" />} label="Prev Close" value={fmtPrice(quote.prevClose)} />
        <Stat icon={<Eye className="h-3.5 w-3.5" />} label="Mkt Cap" value={`₹${fmtCompact(def.capCr)} Cr`} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/4 text-white/45">
        {icon}
      </div>
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
        <div className="font-mono text-[12px] font-semibold tabular-nums text-white/85">{value}</div>
      </div>
    </div>
  );
}
