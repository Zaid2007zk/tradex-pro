"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CircleCheck, Crosshair, Pause, Play, Radio, ShieldCheck } from "lucide-react";
import {
  computeSignals,
  generateCandles,
  liveCandle,
  STOCKS,
  fmtPct,
  fmtPrice,
  type SignalVerdict,
} from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

const SHARIAH = new Set(["RELIANCE", "TCS", "INFY", "HDFCBANK", "SBIN", "ITC", "WIPRO", "HCLTECH", "TITAN", "MARUTI"]);

type ScanRow = {
  symbol: string;
  verdict: SignalVerdict;
  score: number;
  rsi: number;
  pattern: string | null;
  price: number;
  chgPct: number;
};

function detectPattern(closes: number[]): string | null {
  // Golden cross: MA20 crossing above MA50 over the lookback window
  const ma = (arr: number[], p: number) => arr.slice(-p).reduce((a, b) => a + b, 0) / Math.min(p, arr.length);
  const ma20 = ma(closes, 20);
  const ma50 = ma(closes, 50);
  const ma20old = ma(closes.slice(0, -25), 20);
  const ma50old = ma(closes.slice(0, -25), 50);
  if (ma20 > ma50 && ma20old <= ma50old) return "Golden Cross";
  // Bullish flag: strong run-up then tight consolidation
  const run = (closes[closes.length - 12] - closes[closes.length - 32]) / closes[closes.length - 32];
  const recentRange = (Math.max(...closes.slice(-12)) - Math.min(...closes.slice(-12))) / closes[closes.length - 1];
  if (run > 0.04 && recentRange < 0.02) return "Bullish Flag";
  return null;
}

export default function AlgoStudio({
  symbol,
  quotes,
  onSelect,
}: {
  symbol: string;
  quotes: Record<string, Quote>;
  onSelect: (s: string) => void;
}) {
  const [autoPilot, setAutoPilot] = useState(true);
  const [shariahOnly, setShariahOnly] = useState(false);
  const [minScore, setMinScore] = useState(30);
  const [feed, setFeed] = useState<{ id: number; symbol: string; verdict: SignalVerdict; score: number; pattern: string | null; price: number }[]>([]);
  const feedId = useRef(0);

  const scans: ScanRow[] = useMemo(() => {
    const rows: ScanRow[] = [];
    for (const s of STOCKS) {
      if (shariahOnly && !SHARIAH.has(s.symbol)) continue;
      const candles = liveCandle(generateCandles(s.symbol, "1D"), quotes[s.symbol].price);
      const sig = computeSignals(candles);
      const closes = candles.map((c) => c.close);
      rows.push({
        symbol: s.symbol,
        verdict: sig.verdict,
        score: sig.score,
        rsi: sig.rsi,
        pattern: detectPattern(closes),
        price: quotes[s.symbol].price,
        chgPct: quotes[s.symbol].chgPct,
      });
    }
    return rows.sort((a, b) => b.score - a.score);
  }, [quotes, shariahOnly]);

  // auto-pilot bot: publishes high-conviction signals to the feed
  useEffect(() => {
    if (!autoPilot) return;
    const id = setInterval(() => {
      const pick = scans[Math.floor(Math.random() * 3)];
      if (!pick) return;
      feedId.current += 1;
      setFeed((prev) =>
        [
          {
            id: feedId.current,
            symbol: pick.symbol,
            verdict: pick.verdict,
            score: pick.score,
            pattern: pick.pattern,
            price: pick.price,
          },
          ...prev,
        ].slice(0, 8)
      );
    }, 5200);
    return () => clearInterval(id);
  }, [autoPilot, scans]);

  const buys = scans.filter((r) => r.score >= minScore).length;
  const sells = scans.filter((r) => r.score <= -minScore).length;

  return (
    <div className="tx-scroll grid h-full min-h-0 grid-cols-1 gap-2 overflow-y-auto p-2 lg:grid-cols-[1fr_320px]">
      {/* scanner */}
      <div className="tx-panel flex min-h-0 flex-col overflow-hidden">
        <div className="tx-panel-head flex flex-wrap items-center gap-2 px-3.5 py-2.5">
          <Crosshair className="h-4 w-4 text-amber-300" />
          <span className="text-[13px] font-semibold tracking-wide">Quant Scanner</span>
          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9.5px] text-white/50">
            {scans.length} scripts
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className="text-emerald-400">▲ {buys} longs</span>
            <span className="text-rose-400">▼ {sells} shorts</span>
          </span>
        </div>

        <div className="tx-scroll min-h-0 flex-1 overflow-y-auto">
          <table className="w-full text-left font-mono text-[11px] tabular-nums">
            <thead className="sticky top-0 bg-[#12161f] text-[9px] uppercase tracking-wider text-white/35">
              <tr>
                <th className="px-3 py-1.5 font-semibold">Stock</th>
                <th className="px-1 py-1.5 text-right font-semibold">LTP</th>
                <th className="px-1 py-1.5 text-right font-semibold">Chg</th>
                <th className="px-1 py-1.5 text-right font-semibold">RSI</th>
                <th className="px-1 py-1.5 text-right font-semibold">Score</th>
                <th className="px-1 py-1.5 font-semibold">Pattern</th>
                <th className="px-3 py-1.5 text-right font-semibold">Signal</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((r) => {
                const tone =
                  r.score >= 25 ? "text-emerald-300 border-emerald-500/35 bg-emerald-500/10"
                  : r.score > -25 ? "text-white/60 border-white/15 bg-white/5"
                  : "text-rose-300 border-rose-500/35 bg-rose-500/10";
                return (
                  <tr
                    key={r.symbol}
                    onClick={() => onSelect(r.symbol)}
                    className={`cursor-pointer border-t border-white/5 transition hover:bg-white/5 ${
                      r.symbol === symbol ? "bg-amber-500/8" : ""
                    }`}
                  >
                    <td className="px-3 py-1.5 font-sans text-[11.5px] font-semibold">{r.symbol}</td>
                    <td className="px-1 py-1.5 text-right text-white/75">₹{fmtPrice(r.price)}</td>
                    <td className={`px-1 py-1.5 text-right ${r.chgPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmtPct(r.chgPct)}
                    </td>
                    <td className={`px-1 py-1.5 text-right ${r.rsi > 70 ? "text-rose-400" : r.rsi < 30 ? "text-emerald-400" : "text-white/55"}`}>
                      {r.rsi.toFixed(0)}
                    </td>
                    <td className={`px-1 py-1.5 text-right font-semibold ${r.score >= 25 ? "text-emerald-400" : r.score <= -25 ? "text-rose-400" : "text-white/55"}`}>
                      {r.score > 0 ? `+${r.score}` : r.score}
                    </td>
                    <td className="px-1 py-1.5 font-sans text-[10px]">
                      {r.pattern && (
                        <span className="rounded border border-amber-500/35 bg-amber-500/12 px-1.5 py-0.5 font-semibold text-amber-300">
                          {r.pattern}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`inline-block rounded border px-1.5 py-0.5 text-[9.5px] font-bold ${tone}`}>
                        {r.verdict}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* controls + auto-pilot */}
      <div className="flex min-h-0 flex-col gap-2">
        <div className="tx-panel">
          <div className="tx-panel-head flex items-center gap-2 px-3.5 py-2.5">
            <Bot className="h-4 w-4 text-amber-300" />
            <span className="text-[13px] font-semibold tracking-wide">Auto-Pilot Bot</span>
            <button
              onClick={() => setAutoPilot((v) => !v)}
              className={`ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                autoPilot
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                  : "border border-white/15 bg-white/5 text-white/55"
              }`}
            >
              {autoPilot ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {autoPilot ? "RUNNING" : "PAUSED"}
            </button>
          </div>
          <div className="space-y-3 px-3.5 py-3">
            <label className="flex items-center justify-between text-[11.5px]">
              <span className="text-white/55">Min conviction score</span>
              <span className="font-mono font-semibold text-amber-300">{minScore}</span>
            </label>
            <input
              type="range"
              min={10}
              max={70}
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
              aria-label="Minimum conviction score"
            />
            <button
              onClick={() => setShariahOnly((v) => !v)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-[11.5px] font-semibold transition ${
                shariahOnly
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-white/12 bg-white/4 text-white/55 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Shariah-compliant universe only
              {shariahOnly && <CircleCheck className="ml-auto h-3.5 w-3.5" />}
            </button>
            <p className="text-[10px] leading-relaxed text-white/35">
              The bot sweeps the universe every few seconds and publishes signals above your conviction threshold. Purely simulated — no orders are placed.
            </p>
          </div>
        </div>

        <div className="tx-panel flex min-h-40 flex-1 flex-col overflow-hidden">
          <div className="tx-panel-head flex items-center gap-2 px-3.5 py-2.5">
            <Radio className={`h-4 w-4 ${autoPilot ? "text-emerald-400" : "text-white/40"}`} />
            <span className="text-[13px] font-semibold tracking-wide">Live Signal Feed</span>
            {autoPilot && <span className="tx-live-dot ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </div>
          <div className="tx-scroll min-h-0 flex-1 overflow-y-auto px-2.5 py-2">
            {feed.map((f) => (
              <div key={f.id} className="mb-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => onSelect(f.symbol)} className="text-[12px] font-bold transition hover:text-amber-300">
                    {f.symbol}
                  </button>
                  <span className="font-mono text-[10.5px] text-white/45">₹{fmtPrice(f.price)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      f.score >= 25 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {f.verdict} · {f.score > 0 ? `+${f.score}` : f.score}
                  </span>
                  {f.pattern && <span className="text-[9.5px] font-semibold text-amber-300/90">{f.pattern}</span>}
                </div>
              </div>
            ))}
            {feed.length === 0 && (
              <p className="px-1 py-3 text-center text-[11px] text-white/35">
                {autoPilot ? "Scanning for the first signal…" : "Bot paused — press RUNNING to start"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
