"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, Gauge, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { STOCKS, computeSignals, fmtCompact, fmtPct, fmtPrice, getInstrumentMarketStatus, type Candle } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import { isShariahCompliant } from "./shariah-modal";

export default function SymbolHeader({ symbol, quote, candles }: { symbol: string; quote: Quote; candles?: Candle[] }) {
  const def = STOCKS.find((s) => s.symbol === symbol) || STOCKS[0];
  const marketStatus = getInstrumentMarketStatus(def);
  const isHalal = isShariahCompliant(symbol);
  const up = quote.chgPct >= 0;
  const dayRange = quote.dayHigh - quote.dayLow || 1;
  const posInRange = Math.min(100, Math.max(0, ((quote.price - quote.dayLow) / dayRange) * 100));
  const sig = useMemo(() => (candles && candles.length ? computeSignals(candles) : null), [candles]);

  return (
    <div className="flex items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 overflow-x-auto tx-scroll flex-nowrap shrink-0">
      {/* identity + price */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9.5px] font-bold text-amber-300">
          {def.symbol.slice(0, 4)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-[14px] font-bold tracking-tight">{symbol}</h1>
            <span className="rounded border border-white/12 bg-white/6 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider text-white/55">
              {def.exchange || "NSE"}
            </span>
            <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider text-emerald-300">
              {def.exchange === "CRYPTO" ? "SPOT" : def.exchange === "MCX" ? "COMMODITY" : def.exchange === "FOREX" ? "CDS" : def.exchange === "GLOBAL" ? "US TECH" : def.exchange === "BONDS" ? "G-SEC" : "EQ"}
            </span>
            <span className={`hidden sm:flex items-center gap-1 rounded border px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider ${marketStatus.badgeClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${marketStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {marketStatus.label}
            </span>
            {isHalal ? (
              <span className="hidden sm:inline-block rounded border border-emerald-500/35 bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider text-emerald-300">
                ✓ HALAL
              </span>
            ) : null}
            {sig && (
              <span className="hidden md:flex items-center gap-1 rounded border border-purple-500/35 bg-purple-500/15 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider text-purple-200">
                <Sparkles className="h-2.5 w-2.5 text-purple-400" />
                <span className="text-white/50">AI:</span>
                <span className={sig.verdict.includes("BUY") ? "text-emerald-300 font-bold" : sig.verdict.includes("SELL") ? "text-rose-300 font-bold" : "text-amber-300 font-bold"}>
                  {sig.verdict}
                </span>
                <span className="text-white/40 font-mono">({Math.abs(sig.score)}%)</span>
              </span>
            )}
          </div>
          <div className="text-[10px] text-white/45">
            {def.name} · {def.sector}
          </div>
        </div>
      </div>

      <div className="flex items-end gap-2 shrink-0">
        <div
          key={quote.price}
          className={`rounded px-1 font-mono text-[20px] xl:text-[24px] font-bold leading-none tracking-tight tabular-nums ${
            quote.tickDir === 1 ? "tx-flash-up text-emerald-400" : quote.tickDir === -1 ? "tx-flash-down text-rose-400" : "text-white"
          }`}
        >
          {def.currency === "USD" ? "$" : "₹"}{fmtPrice(quote.price)}
        </div>
        <div
          className={`mb-0.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
            up ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {fmtPct(quote.chgPct)}
        </div>
      </div>

      {/* day range */}
      <div className="hidden lg:block min-w-36 max-w-56 flex-1 shrink-0">
        <div className="mb-0.5 flex items-center justify-between font-mono text-[9px] text-white/40">
          <span>L {def.currency === "USD" ? "$" : "₹"}{fmtPrice(quote.dayLow)}</span>
          <span className="uppercase tracking-wider">Day Range</span>
          <span>H {def.currency === "USD" ? "$" : "₹"}{fmtPrice(quote.dayHigh)}</span>
        </div>
        <div className="relative h-1 rounded-full bg-gradient-to-r from-rose-500/50 via-white/15 to-emerald-500/50">
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#0a0c10] bg-amber-400 shadow-[0_0_8px_rgba(240,185,11,0.7)] transition-all duration-700"
            style={{ left: `calc(${posInRange}% - 5px)` }}
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
