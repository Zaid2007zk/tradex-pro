"use client";

import { useMemo } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { computeSignals, type Candle } from "@/lib/market/engine";

export default function AiPanel({ symbol, candles }: { symbol: string; candles: Candle[] }) {
  const sig = useMemo(() => computeSignals(candles), [candles]);

  const verdictColor =
    sig.score >= 25 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
    : sig.score > -25 ? "text-white/70 border-white/20 bg-white/5"
    : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  const rsiPos = Math.min(100, Math.max(0, sig.rsi));
  const currentPrice = candles[candles.length - 1]?.close || 1000;
  const isBull = sig.score >= 25;
  const target = isBull ? (currentPrice * 1.025).toFixed(2) : (currentPrice * 0.975).toFixed(2);
  const stopLoss = isBull ? (currentPrice * 0.985).toFixed(2) : (currentPrice * 1.015).toFixed(2);

  const insight = (() => {
    const dir = sig.score >= 25 ? "bullish" : sig.score > -25 ? "range-bound" : "bearish";
    const rsiNote = sig.rsi > 70 ? "overbought — momentum may cool" : sig.rsi < 30 ? "oversold — a bounce is plausible" : "in neutral territory";
    return `${symbol} prints ${dir} structure: price is ${sig.aboveMa20 ? "above" : "below"} MA20 and ${sig.aboveMa50 ? "above" : "below"} MA50, MACD histogram is ${sig.macdBull ? "positive" : "negative"}. RSI(14) at ${sig.rsi.toFixed(0)} is ${rsiNote}.`;
  })();

  return (
    <div className="tx-panel shrink-0 overflow-hidden">
      <div className="tx-shimmer flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-amber-300" />
          <span className="text-[12.5px] font-semibold tracking-wide">Aria · AI Signals</span>
        </div>
        <Sparkles className="h-3.5 w-3.5 text-amber-300/70" />
      </div>

      {/* verdict */}
      <div className="px-3.5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-white/40">Quant Verdict</div>
            <div className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-[12px] font-bold tracking-wide ${verdictColor}`}>
              {sig.verdict}
            </div>
          </div>
          <ScoreGauge score={sig.score} />
        </div>
      </div>

      {/* indicator rows */}
      <div className="space-y-2.5 px-3.5 pb-3 pt-3">
        <GaugeRow
          label="RSI (14)"
          value={sig.rsi.toFixed(1)}
          pct={rsiPos}
          tone={sig.rsi > 70 ? "down" : sig.rsi < 30 ? "up" : "neutral"}
          note={sig.rsi > 70 ? "Overbought" : sig.rsi < 30 ? "Oversold" : "Neutral"}
        />
        <GaugeRow
          label="MACD Hist"
          value={sig.macdHist.toFixed(2)}
          pct={Math.min(100, Math.abs(sig.macdHist) * 8 + 8)}
          tone={sig.macdBull ? "up" : "down"}
          note={sig.macdBull ? "Bullish cross" : "Bearish cross"}
        />
        <GaugeRow
          label="vs MA20"
          value={sig.ma20.toFixed(1)}
          pct={sig.aboveMa20 ? 72 : 28}
          tone={sig.aboveMa20 ? "up" : "down"}
          note={sig.aboveMa20 ? "Above" : "Below"}
        />
        <GaugeRow
          label="vs MA50"
          value={sig.ma50.toFixed(1)}
          pct={sig.aboveMa50 ? 78 : 22}
          tone={sig.aboveMa50 ? "up" : "down"}
          note={sig.aboveMa50 ? "Golden trend" : "Below"}
        />
      </div>

      {/* Risk / Reward & Quant Levels */}
      <div className="border-t border-white/8 px-3.5 py-2.5 bg-white/2">
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
          <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-1">
            <span className="block text-[8.5px] uppercase text-emerald-400/70 font-sans">Target</span>
            <span className="font-bold text-emerald-300">₹{target}</span>
          </div>
          <div className="rounded bg-rose-500/10 border border-rose-500/20 p-1">
            <span className="block text-[8.5px] uppercase text-rose-400/70 font-sans">Stop Loss</span>
            <span className="font-bold text-rose-300">₹{stopLoss}</span>
          </div>
          <div className="rounded bg-white/5 border border-white/10 p-1">
            <span className="block text-[8.5px] uppercase text-white/50 font-sans">R:R Ratio</span>
            <span className="font-bold text-amber-300">1 : 1.7</span>
          </div>
        </div>
      </div>

      {/* insight & disclaimer */}
      <div className="border-t border-white/8 px-3.5 py-2.5">
        <p className="text-[11px] leading-relaxed text-white/55">{insight}</p>
        <p className="mt-2 text-[9px] text-white/35 border-t border-white/5 pt-1.5 leading-tight">
          ⚠️ SEBI Disclaimer: Educational paper-trading analytics only. Not registered investment advisory.
        </p>
      </div>
    </div>
  );
}

function GaugeRow({
  label,
  value,
  pct,
  tone,
  note,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "up" | "down" | "neutral";
  note: string;
}) {
  const barColor =
    tone === "up" ? "bg-emerald-500" : tone === "down" ? "bg-rose-500" : "bg-white/40";
  const noteColor = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-rose-400" : "text-white/50";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10.5px]">
        <span className="text-white/45">{label}</span>
        <span className="flex items-center gap-2">
          <span className="tabular-nums text-white/80">{value}</span>
          <span className={`font-sans text-[9.5px] font-semibold ${noteColor}`}>{note}</span>
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const angle = ((score + 100) / 200) * 180 - 90;
  const color = score >= 25 ? "#0ecb81" : score > -25 ? "#f0b90b" : "#f6465d";
  return (
    <div className="relative h-14 w-20">
      <svg viewBox="0 0 80 46" className="h-full w-full">
        <path d="M8 42 A32 32 0 0 1 72 42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="40" cy="42" r="32" fill="none" stroke="none" />
        <line
          x1="40"
          y1="42"
          x2={40 + 26 * Math.cos((angle * Math.PI) / 180)}
          y2={42 + 26 * Math.sin((angle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <circle cx="40" cy="42" r="4" fill={color} />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center font-mono text-[10px] font-bold tabular-nums" style={{ color }}>
        {score > 0 ? `+${score}` : score}
      </div>
    </div>
  );
}
