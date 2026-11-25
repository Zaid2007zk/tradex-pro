"use client";

import { useMemo } from "react";
import { BrainCircuit, Sparkles, Zap, Target, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { computeSignals, type Candle } from "@/lib/market/engine";

type Props = {
  symbol: string;
  candles: Candle[];
  onApplyLevels?: (side: "BUY" | "SELL", sl: number, tgt: number) => void;
};

export default function AiPanel({ symbol, candles, onApplyLevels }: Props) {
  const sig = useMemo(() => computeSignals(candles), [candles]);

  const verdictColor =
    sig.score >= 25
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : sig.score > -25
      ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
      : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  const rsiPos = Math.min(100, Math.max(0, sig.rsi));
  const currentPrice = candles[candles.length - 1]?.close || 1000;
  const isBull = sig.score >= 25;
  const isBear = sig.score <= -25;
  const target = isBull ? (currentPrice * 1.025).toFixed(2) : (currentPrice * 0.975).toFixed(2);
  const stopLoss = isBull ? (currentPrice * 0.985).toFixed(2) : (currentPrice * 1.015).toFixed(2);

  const insight = (() => {
    const dir = isBull ? "bullish" : isBear ? "bearish" : "range-bound neutral";
    const rsiNote =
      sig.rsi > 70
        ? "overbought — momentum may cool"
        : sig.rsi < 30
        ? "oversold — a bounce is plausible"
        : "in healthy territory";
    return `${symbol} prints ${dir} structure: price is ${sig.aboveMa20 ? "above" : "below"} MA20 and ${
      sig.aboveMa50 ? "above" : "below"
    } MA50, MACD histogram is ${sig.macdBull ? "positive (bullish momentum)" : "negative (bearish momentum)"}. RSI(14) at ${sig.rsi.toFixed(
      0
    )} is ${rsiNote}.`;
  })();

  const handleApply = (preferredSide?: "BUY" | "SELL") => {
    const side = preferredSide || (isBear ? "SELL" : "BUY");
    if (onApplyLevels) {
      onApplyLevels(side, parseFloat(stopLoss), parseFloat(target));
    }
  };

  return (
    <div className="tx-panel shrink-0 overflow-hidden">
      <div className="tx-shimmer flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-amber-300" />
          <span className="text-[12.5px] font-semibold tracking-wide">Aria · AI Signals</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE ENGINE</span>
        </div>
      </div>

      {/* verdict & calibrated gauge */}
      <div className="px-3.5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-white/40">Quant Verdict</div>
            <div className={`mt-1 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-bold tracking-wide ${verdictColor}`}>
              {isBull ? <ArrowUpRight className="h-3.5 w-3.5" /> : isBear ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
              <span>{sig.verdict}</span>
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

      {/* Risk / Reward & 1-Click Interactive Quant Levels */}
      <div className="border-t border-white/8 px-3.5 py-2.5 bg-white/2">
        <div className="flex items-center justify-between pb-1.5 text-[9.5px] text-white/45">
          <span className="font-semibold uppercase tracking-wider">Calculated Execution Setup</span>
          <span className="font-mono text-amber-300">R:R 1 : 1.7</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handleApply("BUY")}
            title="Click to pre-fill Target & Arm Bracket in Order Ticket"
            className="group rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-2 transition hover:bg-emerald-500/20 hover:border-emerald-500/60 active:scale-95 text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] uppercase text-emerald-400/80 font-sans font-semibold">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3 text-emerald-400" /> Target
              </span>
              <span className="text-[8px] text-emerald-400/50 group-hover:text-emerald-300">+2.5%</span>
            </div>
            <div className="mt-1 font-bold text-emerald-300 text-[12px]">₹{target}</div>
          </button>

          <button
            type="button"
            onClick={() => handleApply("SELL")}
            title="Click to pre-fill Stop Loss & Arm Bracket in Order Ticket"
            className="group rounded-lg bg-rose-500/10 border border-rose-500/25 p-2 transition hover:bg-rose-500/20 hover:border-rose-500/60 active:scale-95 text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[9px] uppercase text-rose-400/80 font-sans font-semibold">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-rose-400" /> Stop Loss
              </span>
              <span className="text-[8px] text-rose-400/50 group-hover:text-rose-300">−1.5%</span>
            </div>
            <div className="mt-1 font-bold text-rose-300 text-[12px]">₹{stopLoss}</div>
          </button>
        </div>

        {/* 1-Click Action to Apply directly to Order Ticket */}
        <button
          type="button"
          onClick={() => handleApply(isBear ? "SELL" : "BUY")}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-[11px] font-bold shadow-md transition active:scale-[0.98] ${
            isBear
              ? "border-rose-500/40 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 shadow-rose-500/10"
              : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 shadow-emerald-500/10"
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>Load AI {isBear ? "SELL" : "BUY"} Setup into Order Ticket</span>
        </button>
      </div>

      {/* insight thesis & disclaimer */}
      <div className="border-t border-white/8 px-3.5 py-2.5">
        <p className="text-[11px] leading-relaxed text-white/60">{insight}</p>
        <p className="mt-2 text-[8.5px] text-white/35 border-t border-white/5 pt-1.5 leading-tight">
          ⚠️ SEBI Disclaimer: Educational quantitative model for virtual paper-trading simulation only.
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
  const s = Math.max(-100, Math.min(100, score));
  // In standard SVG semi-circle from left (x=12, y=38) through top (x=45, y=5) to right (x=78, y=38)
  // angle in radians: left is Math.PI, top is Math.PI/2, right is 0
  const rad = Math.PI - ((s + 100) / 200) * Math.PI;
  const radius = 26;
  const cx = 45;
  const cy = 38;
  const nx = cx + radius * Math.cos(rad);
  const ny = cy - radius * Math.sin(rad); // MINUS because Y grows downwards in SVG

  const color = s >= 25 ? "#0ecb81" : s > -25 ? "#f0b90b" : "#f6465d";
  const label = s >= 25 ? "BULLISH" : s > -25 ? "NEUTRAL" : "BEARISH";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 90 44" className="h-11 w-22">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f6465d" />
            <stop offset="50%" stopColor="#f0b90b" />
            <stop offset="100%" stopColor="#0ecb81" />
          </linearGradient>
        </defs>

        {/* Track background */}
        <path
          d="M 12 38 A 33 33 0 0 1 78 38"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Gradient indicator track */}
        <path
          d="M 12 38 A 33 33 0 0 1 78 38"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Needle pointing outwards to arc */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Pivot center dot */}
        <circle cx={cx} cy={cy} r="4" fill={color} />
        <circle cx={cx} cy={cy} r="1.8" fill="#0b0e14" />
      </svg>

      {/* Score value cleanly positioned below gauge */}
      <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] font-bold tabular-nums" style={{ color }}>
        <span>{s > 0 ? `+${s}` : s}</span>
        <span className="text-[8.5px] uppercase font-sans text-white/45">({label})</span>
      </div>
    </div>
  );
}
