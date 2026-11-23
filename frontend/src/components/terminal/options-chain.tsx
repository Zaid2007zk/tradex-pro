"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Zap, ShieldCheck, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { mulberry32, STOCKS, fmtCompact, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import { useToast } from "@/hooks/use-toast";

type Row = {
  strike: number;
  ceOi: number;
  ceChgOi: number;
  ceIv: number;
  ceLtp: number;
  ceChg: number;
  peOi: number;
  peChgOi: number;
  peIv: number;
  peLtp: number;
  peChg: number;
};

function expiryDates(): string[] {
  const out: string[] = [];
  const d = new Date();
  // next 3 Thursdays (weekly NSE expiry)
  while (out.length < 3) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 4) {
      out.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }));
    }
  }
  return out;
}

export default function OptionsChain({ symbol, quote }: { symbol: string; quote: Quote }) {
  const [tick, setTick] = useState(0);
  const [expiry, setExpiry] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<"BULL_CALL" | "BEAR_PUT" | "STRADDLE" | "IRON_CONDOR" | null>("BULL_CALL");
  const { toast } = useToast();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);

  const expiries = useMemo(() => expiryDates(), []);
  const spot = quote.price;

  const { rows, pcr, maxPain, totCeOi, totPeOi } = useMemo(() => {
    const step = spot > 2000 ? 100 : spot > 1000 ? 50 : spot > 400 ? 20 : 10;
    const atm = Math.round(spot / step) * step;
    const rng = mulberry32(
      Math.floor(spot * 7) + symbol.length * 131 + expiry * 977 + tick
    );
    const n = 9;
    const rows: Row[] = [];
    for (let i = -n; i <= n; i++) {
      const strike = atm + i * step;
      const dist = Math.abs(i);
      const ceOi = Math.round((60000 / (1 + dist * 0.5)) * (0.5 + rng()));
      const peOi = Math.round((60000 / (1 + dist * 0.5)) * (0.5 + rng()));
      const ceIv = 14 + dist * 0.9 + rng() * 6;
      const peIv = 15 + dist * 0.9 + rng() * 6;
      const ceTime = spot * 0.008 / (1 + dist * 0.35);
      const peTime = spot * 0.008 / (1 + dist * 0.35);
      const ceIntr = Math.max(0, spot - strike);
      const peIntr = Math.max(0, strike - spot);
      const ceLtp = Math.max(0.05, ceIntr + ceTime * (0.8 + rng() * 0.5));
      const peLtp = Math.max(0.05, peIntr + peTime * (0.8 + rng() * 0.5));
      rows.push({
        strike,
        ceOi,
        ceChgOi: Math.round((rng() - 0.45) * ceOi * 0.4),
        ceIv: Math.round(ceIv * 10) / 10,
        ceLtp: Math.round(ceLtp * 100) / 100,
        ceChg: Math.round((rng() - 0.42) * 18 * 10) / 10,
        peOi,
        peChgOi: Math.round((rng() - 0.45) * peOi * 0.4),
        peIv: Math.round(peIv * 10) / 10,
        peLtp: Math.round(peLtp * 100) / 100,
        peChg: Math.round((rng() - 0.42) * 18 * 10) / 10,
      });
    }
    const totCeOi = rows.reduce((a, r) => a + r.ceOi, 0);
    const totPeOi = rows.reduce((a, r) => a + r.peOi, 0);
    const pcr = totPeOi / totCeOi;
    // max pain: strike where total writer loss is minimum (simplified)
    let maxPain = atm;
    let minPain = Infinity;
    for (const r of rows) {
      const pain = rows.reduce(
        (a, x) => a + Math.max(0, r.strike - x.strike) * x.ceOi + Math.max(0, x.strike - r.strike) * x.peOi,
        0
      );
      if (pain < minPain) {
        minPain = pain;
        maxPain = r.strike;
      }
    }
    return { rows, pcr, maxPain, totCeOi, totPeOi };
  }, [symbol, spot, expiry, tick]);

  const maxOi = Math.max(...rows.map((r) => Math.max(r.ceOi, r.peOi)));

  const step = spot > 2000 ? 100 : spot > 1000 ? 50 : spot > 400 ? 20 : 10;
  const atm = Math.round(spot / step) * step;

  const strategyDetails = useMemo(() => {
    if (!selectedStrategy) return null;
    if (selectedStrategy === "BULL_CALL") {
      const leg1 = rows.find((r) => r.strike === atm)?.ceLtp ?? 40;
      const leg2 = rows.find((r) => r.strike === atm + step)?.ceLtp ?? 18;
      const netDebit = Math.max(1, leg1 - leg2);
      const maxProfit = Math.max(1, step - netDebit);
      return {
        name: "Bull Call Spread",
        bias: "Moderately Bullish",
        legs: `Buy ${atm} CE (₹${leg1.toFixed(1)}) + Sell ${atm + step} CE (₹${leg2.toFixed(1)})`,
        maxProfit: Math.round(maxProfit * 50),
        maxLoss: Math.round(netDebit * 50),
        breakeven: Math.round((atm + netDebit) * 10) / 10,
        pop: 68,
      };
    }
    if (selectedStrategy === "BEAR_PUT") {
      const leg1 = rows.find((r) => r.strike === atm)?.peLtp ?? 42;
      const leg2 = rows.find((r) => r.strike === atm - step)?.peLtp ?? 20;
      const netDebit = Math.max(1, leg1 - leg2);
      const maxProfit = Math.max(1, step - netDebit);
      return {
        name: "Bear Put Spread",
        bias: "Moderately Bearish",
        legs: `Buy ${atm} PE (₹${leg1.toFixed(1)}) + Sell ${atm - step} PE (₹${leg2.toFixed(1)})`,
        maxProfit: Math.round(maxProfit * 50),
        maxLoss: Math.round(netDebit * 50),
        breakeven: Math.round((atm - netDebit) * 10) / 10,
        pop: 66,
      };
    }
    if (selectedStrategy === "STRADDLE") {
      const leg1 = rows.find((r) => r.strike === atm)?.ceLtp ?? 40;
      const leg2 = rows.find((r) => r.strike === atm)?.peLtp ?? 42;
      const totalCost = leg1 + leg2;
      return {
        name: "Long Straddle (0DTE Breakout)",
        bias: "High Volatility / Non-Directional",
        legs: `Buy ${atm} CE (₹${leg1.toFixed(1)}) + Buy ${atm} PE (₹${leg2.toFixed(1)})`,
        maxProfit: "Unlimited",
        maxLoss: Math.round(totalCost * 50),
        breakeven: `₹${Math.round(atm - totalCost)} - ₹${Math.round(atm + totalCost)}`,
        pop: 54,
      };
    }
    // IRON_CONDOR
    const leg1 = rows.find((r) => r.strike === atm + step)?.ceLtp ?? 18;
    const leg2 = rows.find((r) => r.strike === atm - step)?.peLtp ?? 20;
    const netCredit = leg1 + leg2;
    return {
      name: "Iron Condor (Rangebound Theta Harvest)",
      bias: "Neutral / Expiry Pinning",
      legs: `Sell ${atm + step} CE + Sell ${atm - step} PE`,
      maxProfit: Math.round(netCredit * 50),
      maxLoss: Math.round((step - netCredit) * 50),
      breakeven: `₹${atm - step} - ₹${atm + step}`,
      pop: 74,
    };
  }, [selectedStrategy, rows, atm, step]);

  return (
    <div className="tx-scroll flex h-full min-h-0 flex-col overflow-y-auto">
      {/* header */}
      <div className="tx-panel-head flex flex-wrap items-center gap-3 px-4 py-3 shrink-0">
        <div>
          <div className="text-[13px] font-bold tracking-wide">
            {symbol} <span className="text-white/40">· Options</span>
          </div>
          <div className="text-[10.5px] text-white/40">Simulated weekly chain · NSE</div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-0.5">
          {expiries.map((e, i) => (
            <button
              key={e}
              onClick={() => setExpiry(i)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                expiry === i ? "bg-amber-500/20 text-amber-300" : "text-white/50 hover:text-white"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <Chip label="SPOT" value={`₹${fmtPrice(spot)}`} tone="gold" />
          <Chip label="PCR" value={pcr.toFixed(2)} tone={pcr > 1 ? "up" : "down"} />
          <Chip label="MAX PAIN" value={String(maxPain)} tone="gold" />
          <Chip label="CE OI" value={fmtCompact(totCeOi)} tone="down" />
          <Chip label="PE OI" value={fmtCompact(totPeOi)} tone="up" />
        </div>
      </div>

      {/* 0DTE & Expiry AI Strategy Builder Bar */}
      <div className="mx-4 my-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-white">ARIA 0DTE Options AI Strategist</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9.5px] text-purple-300">
              Expiry Bias: {pcr > 1.15 ? "🟢 Bullish (PE Writers Dominant)" : pcr < 0.85 ? "🔴 Bearish (CE Writers Dominant)" : "🟡 Range Pinning"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { key: "BULL_CALL", label: "Bull Call Spread" },
              { key: "BEAR_PUT", label: "Bear Put Spread" },
              { key: "STRADDLE", label: "Straddle" },
              { key: "IRON_CONDOR", label: "Iron Condor" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSelectedStrategy(s.key as any)}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition ${
                  selectedStrategy === s.key
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {strategyDetails && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
            <div>
              <div className="text-white/50 text-[10px]">{strategyDetails.legs}</div>
              <div className="font-semibold text-white/90 text-xs mt-0.5">
                Bias: <span className="text-purple-300">{strategyDetails.bias}</span> · Breakeven: {strategyDetails.breakeven}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-white/40 text-[9.5px]">Max Profit / Loss:</span>{" "}
                <strong className="text-emerald-400">
                  {typeof strategyDetails.maxProfit === "number" ? `+₹${strategyDetails.maxProfit}` : strategyDetails.maxProfit}
                </strong>{" "}
                / <strong className="text-rose-400">-₹{strategyDetails.maxLoss}</strong>
              </div>
              <button
                onClick={() => {
                  toast({
                    title: `⚡ ${strategyDetails.name} Paper Executed`,
                    description: `Spread deployed for ${symbol} · Legs: ${strategyDetails.legs}`,
                  });
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-xs font-bold shadow-md transition active:scale-95"
              >
                <Zap className="h-3 w-3" />
                <span>Execute Spread</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* table */}
      <table className="w-full font-mono text-[11px] tabular-nums">
        <thead className="sticky top-0 z-10 bg-[#12161f] text-[9px] uppercase tracking-wider text-white/40">
          <tr>
            <th colSpan={4} className="border-r border-white/8 px-2 py-1.5 text-center text-emerald-400/80">Calls</th>
            <th className="px-2 py-1.5 text-center">Strike</th>
            <th colSpan={4} className="border-l border-white/8 px-2 py-1.5 text-center text-rose-400/80">Puts</th>
          </tr>
          <tr className="text-white/35">
            <th className="px-2 py-1 text-right">OI</th>
            <th className="px-1 py-1 text-right">Chg OI</th>
            <th className="px-1 py-1 text-right">IV</th>
            <th className="border-r border-white/8 px-2 py-1 text-right">LTP</th>
            <th className="px-2 py-1">₹</th>
            <th className="border-l border-white/8 px-2 py-1">LTP</th>
            <th className="px-1 py-1">IV</th>
            <th className="px-1 py-1">Chg OI</th>
            <th className="px-2 py-1">OI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const atmRow = Math.abs(r.strike - spot) < (spot > 2000 ? 50 : spot > 1000 ? 25 : spot > 400 ? 10 : 5);
            return (
              <tr
                key={r.strike}
                className={`border-t border-white/5 hover:bg-white/4 ${atmRow ? "bg-amber-500/8" : ""}`}
              >
                <td className="relative px-2 py-1 text-right text-emerald-300/90">
                  <div className="absolute inset-y-0.5 left-0 rounded-r bg-emerald-500/14" style={{ width: `${(r.ceOi / maxOi) * 60}%` }} />
                  <span className="relative">{fmtCompact(r.ceOi)}</span>
                </td>
                <td className={`px-1 py-1 text-right ${r.ceChgOi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {r.ceChgOi >= 0 ? "+" : "−"}{fmtCompact(Math.abs(r.ceChgOi))}
                </td>
                <td className="px-1 py-1 text-right text-white/55">{r.ceIv.toFixed(1)}</td>
                <td className="border-r border-white/8 px-2 py-1 text-right font-semibold text-emerald-300">
                  ₹{r.ceLtp.toFixed(1)}
                </td>
                <td className={`px-2 py-1 text-center font-semibold ${atmRow ? "text-amber-300" : "text-white/80"}`}>
                  {r.strike}
                </td>
                <td className="border-l border-white/8 px-2 py-1 font-semibold text-rose-300">₹{r.peLtp.toFixed(1)}</td>
                <td className="px-1 py-1 text-white/55">{r.peIv.toFixed(1)}</td>
                <td className={`px-1 py-1 ${r.peChgOi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {r.peChgOi >= 0 ? "+" : "−"}{fmtCompact(Math.abs(r.peChgOi))}
                </td>
                <td className="relative px-2 py-1 text-rose-300/90">
                  <div className="absolute inset-y-0.5 right-0 rounded-l bg-rose-500/14" style={{ width: `${(r.peOi / maxOi) * 60}%` }} />
                  <span className="relative">{fmtCompact(r.peOi)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2.5 text-[10px] text-white/35">
        OI bars show open-interest weight · ATM strike highlighted · data simulated for demonstration ({STOCKS.find((s) => s.symbol === symbol)?.name})
      </div>
    </div>
  );
}

function Chip({ label, value, tone }: { label: string; value: string; tone: "up" | "down" | "gold" }) {
  const cls = tone === "up" ? "text-emerald-300 border-emerald-500/25" : tone === "down" ? "text-rose-300 border-rose-500/25" : "text-amber-300 border-amber-500/25";
  return (
    <span className={`flex items-center gap-1.5 rounded-md border bg-white/4 px-2 py-1 ${cls}`}>
      <span className="text-[8.5px] font-sans font-semibold tracking-wider text-white/40">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
