"use client";

import { useMemo } from "react";
import { generateCandles, STOCKS, fmtPct, type Timeframe } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import CandleChart from "./candle-chart";
import Sparkline from "./sparkline";

/** 2x2 live multi-chart grid: selected symbol + top movers. */
export default function MultiChart({
  symbol,
  quotes,
  onSelect,
}: {
  symbol: string;
  quotes: Record<string, Quote>;
  onSelect: (s: string) => void;
}) {
  const cells = useMemo(() => {
    const movers = [...STOCKS].sort(
      (a, b) => Math.abs(quotes[b.symbol].chgPct) - Math.abs(quotes[a.symbol].chgPct)
    );
    const picks = [symbol, ...movers.map((s) => s.symbol).filter((s) => s !== symbol).slice(0, 3)];
    return picks.map((sym) => {
      const q = quotes[sym];
      return { sym, q, candles: generateCandles(sym, "1D" as Timeframe) };
    });
    // rebuild only when the selected symbol changes — charts still tick via quote price
  }, [symbol, quotes]);

  return (
    <div className="tx-scroll grid h-full min-h-0 grid-cols-1 gap-2 overflow-y-auto p-2 md:grid-cols-2">
      {cells.map(({ sym, q, candles }) => {
        const def = STOCKS.find((s) => s.symbol === sym)!;
        const up = q.chgPct >= 0;
        return (
          <div key={sym} className="tx-panel flex min-h-72 flex-col overflow-hidden">
            <button
              onClick={() => onSelect(sym)}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/5 ${
                sym === symbol ? "bg-amber-500/8" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-bold ${sym === symbol ? "text-amber-300" : ""}`}>{sym}</span>
                  {sym === symbol && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300">ACTIVE</span>}
                </div>
                <div className="text-[10px] text-white/40">{def.name}</div>
              </div>
              <Sparkline data={q.history} up={up} width={80} height={26} />
              <div className="ml-auto text-right">
                <div className="font-mono text-[13px] font-semibold tabular-nums">₹{q.price.toFixed(2)}</div>
                <div className={`font-mono text-[11px] font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmtPct(q.chgPct)}
                </div>
              </div>
            </button>
            <div className="min-h-0 flex-1">
              <CandleChart symbol={sym} candles={candles} timeframe="1D" price={q.price} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
