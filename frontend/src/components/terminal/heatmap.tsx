"use client";

import { useMemo, useState } from "react";
import { STOCKS, fmtPct, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

/** Sector-weighted treemap-style heatmap using flex sizing. */
export default function Heatmap({
  quotes,
  onSelect,
}: {
  quotes: Record<string, Quote>;
  onSelect: (s: string) => void;
}) {
  const sectors = useMemo(() => {
    const map = new Map<string, { total: number; chg: number; n: number }>();
    for (const s of STOCKS) {
      const q = quotes[s.symbol];
      const cur = map.get(s.sector) ?? { total: 0, chg: 0, n: 0 };
      cur.total += s.capCr;
      cur.chg += s.capCr * q.chgPct;
      cur.n += 1;
      map.set(s.sector, cur);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v, chgPct: v.chg / v.total }))
      .sort((a, b) => b.total - a.total);
  }, [quotes]);

  return (
    <div className="tx-grid-bg flex h-full min-h-0 flex-col gap-2.5 overflow-auto p-3 tx-scroll">
      {sectors.map((sec) => {
        const stocks = STOCKS.filter((s) => s.sector === sec.name);
        return (
          <div key={sec.name} className="flex shrink-0 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wide text-white/70">{sec.name.toUpperCase()}</span>
              <span
                className={`font-mono text-[11px] font-semibold tabular-nums ${
                  sec.chgPct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {fmtPct(sec.chgPct)}
              </span>
              <div className="h-px flex-1 bg-white/8" />
            </div>
            <div className="flex gap-1.5">
              {stocks.map((s) => {
                const q = quotes[s.symbol];
                const intensity = Math.min(1, Math.abs(q.chgPct) / 3.5);
                const bg = q.chgPct >= 0
                  ? `rgba(14,203,129,${0.08 + intensity * 0.5})`
                  : `rgba(246,70,93,${0.08 + intensity * 0.5})`;
                return (
                  <button
                    key={s.symbol}
                    onClick={() => onSelect(s.symbol)}
                    className="group relative flex min-w-24 flex-1 flex-col justify-between rounded-lg border border-white/8 p-2.5 text-left transition hover:border-white/30 hover:brightness-125"
                    style={{ background: bg, flexGrow: s.capCr }}
                  >
                    <div>
                      <div className="text-[12px] font-bold tracking-wide">{s.symbol}</div>
                      <div className="text-[9.5px] text-white/45">{s.name}</div>
                    </div>
                    <div className="mt-1.5">
                      <div className="font-mono text-[11.5px] font-semibold tabular-nums">{fmtPrice(q.price)}</div>
                      <div
                        className={`font-mono text-[11px] font-semibold tabular-nums ${
                          q.chgPct >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {fmtPct(q.chgPct)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
