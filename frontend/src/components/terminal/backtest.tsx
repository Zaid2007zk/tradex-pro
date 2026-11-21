"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Play } from "lucide-react";
import { generateCandles, STOCKS, fmtINR, fmtPrice, r2, sma, type Candle } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

type Strategy = "ma_cross" | "rsi_rev";

type Trade = { entryIdx: number; exitIdx: number; entry: number; exit: number; pnlPct: number };

type Result = {
  equity: number[];
  trades: Trade[];
  final: number;
  retPct: number;
  winRate: number;
  maxDd: number;
};

const STRATS: { key: Strategy; name: string; desc: string }[] = [
  { key: "ma_cross", name: "MA 20 Crossover", desc: "Long while close > MA20" },
  { key: "rsi_rev", name: "RSI Reversal", desc: "Buy RSI<30 · exit RSI>70" },
];

function rsiAt(closes: number[], end: number): number {
  const lo = Math.max(1, end - 13);
  let g = 0;
  let l = 0;
  for (let i = lo; i <= end; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) g += d;
    else l -= d;
  }
  if (l === 0) return 100;
  return 100 - 100 / (1 + g / 13 / (l / 13));
}

function runBacktest(candles: Candle[], strategy: Strategy): Result {
  const closes = candles.map((c) => c.close);
  const equity: number[] = [];
  const trades: Trade[] = [];
  let cash = 100000;
  let inPos = false;
  let entryIdx = 0;
  let entry = 0;
  let peak = cash;
  let maxDd = 0;

  candles.forEach((c, i) => {
    if (!inPos) equity.push(cash);
    else equity.push(r2(cash * (c.close / entry)));
    const e = equity[equity.length - 1];
    peak = Math.max(peak, e);
    maxDd = Math.max(maxDd, ((peak - e) / peak) * 100);

    if (strategy === "ma_cross") {
      if (i < 21) return;
      const ma20 = sma(closes.slice(0, i + 1), 20);
      const above = closes[i] > ma20;
      const wasAbove = closes[i - 1] > sma(closes.slice(0, i), 20);
      if (above && !wasAbove && !inPos) {
        inPos = true;
        entry = closes[i];
        entryIdx = i;
      } else if (!above && wasAbove && inPos) {
        inPos = false;
        trades.push({ entryIdx, exitIdx: i, entry, exit: closes[i], pnlPct: ((closes[i] - entry) / entry) * 100 });
      }
    } else {
      if (i < 15) return;
      const r = rsiAt(closes, i);
      if (r < 30 && !inPos) {
        inPos = true;
        entry = closes[i];
        entryIdx = i;
      } else if (r > 70 && inPos) {
        inPos = false;
        trades.push({ entryIdx, exitIdx: i, entry, exit: closes[i], pnlPct: ((closes[i] - entry) / entry) * 100 });
      }
    }
  });
  // close open position at the end
  if (inPos) {
    const last = closes[closes.length - 1];
    trades.push({ entryIdx, exitIdx: closes.length - 1, entry, exit: last, pnlPct: ((last - entry) / entry) * 100 });
  }
  const final = r2(equity[equity.length - 1]);
  const wins = trades.filter((t) => t.pnlPct > 0).length;
  return {
    equity,
    trades,
    final,
    retPct: ((final - 100000) / 100000) * 100,
    winRate: trades.length ? (wins / trades.length) * 100 : 0,
    maxDd: r2(maxDd),
  };
}

export default function Backtest({ symbol, quotes }: { symbol: string; quotes: Record<string, Quote> }) {
  const [strategy, setStrategy] = useState<Strategy>("ma_cross");
  const [result, setResult] = useState<Result | null>(null);
  const candles = useMemo(() => generateCandles(symbol, "3M"), [symbol]);
  const quote = quotes[symbol];

  const run = () => setResult(runBacktest(candles, strategy));

  const def = STOCKS.find((s) => s.symbol === symbol)!;
  // equity curve path
  const eq = result?.equity ?? [];
  const lo = Math.min(...(eq.length ? eq : [1]), 100000);
  const hi = Math.max(...(eq.length ? eq : [1]), 100000);
  const pts = eq
    .map((v, i) => {
      const x = (i / Math.max(1, eq.length - 1)) * 100;
      const y = 100 - ((v - lo) / (hi - lo || 1)) * 92 - 4;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="tx-scroll grid h-full min-h-0 grid-cols-1 gap-2 overflow-y-auto p-2 lg:grid-cols-[300px_1fr]">
      {/* config */}
      <div className="tx-panel shrink-0">
        <div className="tx-panel-head flex items-center gap-2 px-3.5 py-2.5">
          <FlaskConical className="h-4 w-4 text-amber-300" />
          <span className="text-[13px] font-semibold tracking-wide">Backtest Lab</span>
        </div>
        <div className="space-y-4 px-3.5 py-3">
          <div>
            <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-white/40">Instrument</div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/4 px-3 py-2">
              <span className="text-[12.5px] font-bold">{symbol}</span>
              <span className="font-mono text-[11px] text-white/55">₹{fmtPrice(quote.price)}</span>
            </div>
            <div className="mt-1 text-[10px] text-white/35">{def.name} · 3M daily candles ({candles.length})</div>
          </div>
          <div>
            <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-white/40">Strategy</div>
            <div className="space-y-1.5">
              {STRATS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStrategy(s.key)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    strategy === s.key
                      ? "border-amber-500/50 bg-amber-500/12"
                      : "border-white/10 bg-white/3 hover:border-white/25"
                  }`}
                >
                  <div className={`text-[12px] font-bold ${strategy === s.key ? "text-amber-300" : "text-white/80"}`}>
                    {s.name}
                  </div>
                  <div className="text-[10px] text-white/40">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={run}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-[13px] font-bold text-black shadow-[0_4px_16px_rgba(240,185,11,0.3)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5" /> Run Backtest
          </button>
          <p className="text-[9.5px] leading-relaxed text-white/30">
            Simulated on generated price history with 1-lot full-equity sizing, no fees. For education only.
          </p>
        </div>
      </div>

      {/* results */}
      <div className="tx-panel flex min-h-0 flex-col overflow-hidden">
        <div className="tx-panel-head flex items-center justify-between px-3.5 py-2.5">
          <span className="text-[13px] font-semibold tracking-wide">Equity Curve</span>
          {result && (
            <span className={`font-mono text-[12px] font-bold ${result.retPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {result.retPct >= 0 ? "+" : ""}{result.retPct.toFixed(2)}%
            </span>
          )}
        </div>
        {result ? (
          <div className="tx-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="relative h-44 px-3 pt-4">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="eqg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={result.retPct >= 0 ? "#0ecb81" : "#f6465d"} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={result.retPct >= 0 ? "#0ecb81" : "#f6465d"} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[25, 50, 75].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
                ))}
                <polygon points={`0,100 ${pts} 100,100`} fill="url(#eqg)" />
                <polyline
                  points={pts}
                  fill="none"
                  stroke={result.retPct >= 0 ? "#0ecb81" : "#f6465d"}
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="absolute left-3 top-1 font-mono text-[9px] text-white/35">₹{fmtINR(hi)}</span>
              <span className="absolute bottom-1 left-3 font-mono text-[9px] text-white/35">₹{fmtINR(lo)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 px-3 pb-2 sm:grid-cols-4">
              <Stat label="Final Equity" value={`₹${fmtINR(result.final)}`} />
              <Stat label="Total Return" value={`${result.retPct >= 0 ? "+" : ""}${result.retPct.toFixed(2)}%`} tone={result.retPct >= 0} />
              <Stat label="Win Rate" value={`${result.winRate.toFixed(0)}%`} tone={result.winRate >= 50} />
              <Stat label="Max Drawdown" value={`−${result.maxDd.toFixed(1)}%`} tone={false} />
            </div>

            <div className="px-3 pb-3">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Trades ({result.trades.length})
              </div>
              <div className="tx-divide rounded-lg border border-white/8">
                {result.trades.map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 font-mono text-[11px] tabular-nums">
                    <span className="text-white/50">#{i + 1}</span>
                    <span className="text-white/70">
                      ₹{fmtPrice(t.entry)} → ₹{fmtPrice(t.exit)}
                    </span>
                    <span className="text-white/40">candles {t.entryIdx}–{t.exitIdx}</span>
                    <span className={`font-semibold ${t.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(2)}%
                    </span>
                  </div>
                ))}
                {result.trades.length === 0 && (
                  <div className="px-3 py-3 text-center text-[11px] text-white/40">
                    No trades triggered on this window — try the other strategy.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[12.5px] text-white/40">Pick a strategy and press Run Backtest to see the equity curve.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
      <div className={`mt-0.5 font-mono text-[13px] font-bold tabular-nums ${tone === undefined ? "text-white/85" : tone ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}
