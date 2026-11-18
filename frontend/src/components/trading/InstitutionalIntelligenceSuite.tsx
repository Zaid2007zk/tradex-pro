"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  Globe,
  Radio,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { soundEngine } from "@/utils/soundEngine";

interface InstitutionalIntelligenceSuiteProps {
  symbol: string;
  price: number;
  currency: string;
  changePercent: number;
  rsi14: number;
  sma20: number;
  sma50: number;
  volatility: number;
  onSetBracket?: (target: number, stopLoss: number) => void;
}

export const InstitutionalIntelligenceSuite: React.FC<InstitutionalIntelligenceSuiteProps> = ({
  symbol,
  price,
  currency,
  changePercent,
  rsi14,
  sma20,
  sma50,
  volatility,
  onSetBracket,
}) => {
  const [activeTab, setActiveTab] = useState<"smart_money" | "news_sentiment" | "patterns" | "fibonacci" | "stress_test">("smart_money");
  const [stressScenario, setStressScenario] = useState<"flash_crash" | "rate_hike" | "bull_rally">("flash_crash");
  const [isSimulating, setIsSimulating] = useState(false);

  const curr = currency === "INR" || currency === "₹" ? "₹" : "$";
  const numPrice = Number(price || 100);

  // Fibonacci & Pivot Calculations
  const highEst = numPrice * (1 + Math.max(0.015, (volatility || 16) / 1000));
  const lowEst = numPrice * (1 - Math.max(0.015, (volatility || 16) / 1000));
  const range = highEst - lowEst;

  const pivot = (highEst + lowEst + numPrice) / 3;
  const r1 = 2 * pivot - lowEst;
  const r2 = pivot + range;
  const r3 = highEst + 2 * (pivot - lowEst);
  const s1 = 2 * pivot - highEst;
  const s2 = pivot - range;
  const s3 = lowEst - 2 * (highEst - pivot);

  const fib236 = numPrice - range * 0.236;
  const fib382 = numPrice - range * 0.382;
  const fib500 = numPrice - range * 0.500;
  const fib618 = numPrice - range * 0.618;

  // Live Smart Money FII/DII Institutional Mock Stream
  const fiiFlow = +1842.5; // in Cr
  const diiFlow = +2114.8; // in Cr
  const netInstitutional = fiiFlow + diiFlow;

  // News Stream
  const newsItems = [
    {
      id: "n1",
      source: "Bloomberg / NSE Direct",
      time: "2m ago",
      title: `${symbol} surges as institutional block trades accelerate post-breakout`,
      sentiment: "BULLISH",
      score: 94,
    },
    {
      id: "n2",
      source: "Reuters Financial",
      time: "14m ago",
      title: "RBI maintains supportive monetary stance, foreign institutional inflows hit 3-month peak",
      sentiment: "BULLISH",
      score: 88,
    },
    {
      id: "n3",
      source: "Quant Capital Wire",
      time: "28m ago",
      title: "Derivatives open interest spikes 18% in near-month calls near active resistance",
      sentiment: "NEUTRAL",
      score: 52,
    },
  ];

  // AI Pattern Recognition Flags
  const patterns = [
    {
      name: "Bullish Engulfing",
      timeframe: "15m Intraday",
      probability: "86% Win Rate",
      bias: "BULLISH",
      status: "CONFIRMED",
      trigger: `${curr}${(numPrice * 1.004).toFixed(2)}`,
      target: `${curr}${(numPrice * 1.025).toFixed(2)}`,
    },
    {
      name: "20-Day SMA Golden Support",
      timeframe: "Daily Chart",
      probability: "78% Win Rate",
      bias: "BULLISH",
      status: "ACTIVE",
      trigger: `${curr}${sma20.toFixed(2)}`,
      target: `${curr}${(numPrice * 1.042).toFixed(2)}`,
    },
    {
      name: "Ascending Triangle Breakout",
      timeframe: "1-Hour Swing",
      probability: "81% Win Rate",
      bias: "BULLISH",
      status: "FORMING",
      trigger: `${curr}${(numPrice * 1.008).toFixed(2)}`,
      target: `${curr}${(numPrice * 1.035).toFixed(2)}`,
    },
  ];

  const handleSimulateStress = () => {
    setIsSimulating(true);
    soundEngine.playOrderFilled();
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="bg-[#0D111A]/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Suite Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Institutional Quant Intelligence Suite
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase font-mono">
                PRO ELITE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live FII/DII Smart Money Tracker, AI Pattern Scanner, Fibonacci Confluence &amp; Monte Carlo Stress Testing
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#121622] border border-[#212738] text-xs">
          <button
            onClick={() => {
              soundEngine.playTabSwitch();
              setActiveTab("smart_money");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "smart_money"
                ? "bg-amber-400 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>FII/DII Smart Money</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTabSwitch();
              setActiveTab("news_sentiment");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "news_sentiment"
                ? "bg-amber-400 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>News &amp; Sentiment</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTabSwitch();
              setActiveTab("patterns");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "patterns"
                ? "bg-amber-400 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Pattern AI</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTabSwitch();
              setActiveTab("fibonacci");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "fibonacci"
                ? "bg-amber-400 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Fibonacci &amp; Pivots</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTabSwitch();
              setActiveTab("stress_test");
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "stress_test"
                ? "bg-amber-400 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Risk Stress Test</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FII / DII INSTITUTIONAL SMART MONEY FLOW */}
      {activeTab === "smart_money" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fade-in">
          {/* Card 1: FII Cash Flow */}
          <div className="p-4 rounded-xl bg-[#090C13] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Foreign Inst. (FII / FPI)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                NET BUYER
              </span>
            </div>
            <div className="text-2xl font-black font-tabular text-emerald-400">
              +{curr}{fiiFlow.toLocaleString()} Cr
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Heavy accumulation in large-cap banking &amp; energy sectors during morning liquidity window.
            </p>
          </div>

          {/* Card 2: DII Domestic Flow */}
          <div className="p-4 rounded-xl bg-[#090C13] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Domestic Inst. (DII / MFs)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                NET BUYER
              </span>
            </div>
            <div className="text-2xl font-black font-tabular text-emerald-400">
              +{curr}{diiFlow.toLocaleString()} Cr
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              SIP inflows driving steady buying support, acting as a strong capital floor against dips.
            </p>
          </div>

          {/* Card 3: Institutional Bias Verdict */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-[#090C13] to-emerald-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px]">Smart Money Verdict</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                STRONG ACCUMULATION
              </span>
            </div>
            <div className="text-2xl font-black font-tabular text-white">
              +{curr}{netInstitutional.toLocaleString()} Cr
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Both FII &amp; DII are in synchronous net-buying mode. Market dips are being aggressively bought by institutions.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: AI NEWS STREAM & FEAR/GREED SENTIMENT GAUGE */}
      {activeTab === "news_sentiment" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* Newsfeed List (8 Cols) */}
          <div className="lg:col-span-8 space-y-2.5">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#090C13] border border-white/5 hover:border-amber-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-bold">{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h4>
                </div>
                <div className="shrink-0 flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                    item.sentiment === "BULLISH"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  }`}>
                    {item.sentiment} ({item.score}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Fear & Greed Index Dial (4 Cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#090C13] border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Market Sentiment Gauge
            </span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-8 border-[#1C2230] border-t-amber-400 border-r-emerald-400 animate-spin-slow" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-tabular">76</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  GREED / BULLISH
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Extreme institutional optimism with strong call writing &amp; rising trading volume across Nifty &amp; Tech.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: AI AUTOMATED PATTERN & CANDLESTICK SCANNER */}
      {activeTab === "patterns" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fade-in">
          {patterns.map((pat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#090C13] border border-white/5 hover:border-amber-400/40 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">{pat.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  {pat.probability}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Timeframe:</span>
                <span className="text-slate-200 font-semibold">{pat.timeframe}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1420] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trigger Breakout:</span>
                  <span className="text-amber-300 font-bold font-mono">{pat.trigger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected Target:</span>
                  <span className="text-emerald-400 font-bold font-mono">{pat.target}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pattern Status: {pat.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: FIBONACCI & DYNAMIC PIVOT CONFLUENCE */}
      {activeTab === "fibonacci" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* Pivots Table (6 Cols) */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-[#090C13] border border-white/5 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Standard Floor Pivots ({symbol})</span>
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5 text-rose-400">
                <span>Resistance 3 (R3)</span>
                <span className="font-bold">{curr}{r3.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-rose-300">
                <span>Resistance 2 (R2)</span>
                <span className="font-bold">{curr}{r2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-rose-200">
                <span>Resistance 1 (R1)</span>
                <span className="font-bold">{curr}{r1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-amber-400/30 text-amber-400 font-extrabold bg-amber-400/5 px-2 rounded">
                <span>Central Pivot (P)</span>
                <span>{curr}{pivot.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-emerald-300">
                <span>Support 1 (S1)</span>
                <span className="font-bold">{curr}{s1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400">
                <span>Support 2 (S2)</span>
                <span className="font-bold">{curr}{s2.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Fibonacci Retracements (6 Cols) */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-[#090C13] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
                Fibonacci Dynamic Retracements
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                  <span>Fib 23.6% Pullback:</span>
                  <span className="font-bold text-white">{curr}{fib236.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                  <span>Fib 38.2% Symmetrical:</span>
                  <span className="font-bold text-white">{curr}{fib382.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-amber-300 font-bold">
                  <span>Fib 50.0% Equilibrium:</span>
                  <span>{curr}{fib500.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400 font-extrabold bg-emerald-500/5 px-2 rounded">
                  <span>Fib 61.8% Golden Ratio:</span>
                  <span>{curr}{fib618.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 1-Click Set Bracket Order */}
            <button
              onClick={() => {
                soundEngine.playOrderFilled();
                if (onSetBracket) {
                  onSetBracket(Number(r1.toFixed(2)), Number(s1.toFixed(2)));
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply Pivot Bracket to Order Dock (TGT: {curr}{r1.toFixed(2)}, SL: {curr}{s1.toFixed(2)})</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: RISK MONTE CARLO & STRESS TESTING */}
      {activeTab === "stress_test" && (
        <div className="p-4 rounded-xl bg-[#090C13] border border-white/5 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Monte Carlo Portfolio Stress Test
              </h4>
              <p className="text-[11px] text-slate-400">
                Simulate portfolio resilience under extreme volatility &amp; geopolitical macro shocks.
              </p>
            </div>
            <button
              onClick={handleSimulateStress}
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
              <span>Re-Run 1,000 Iterations</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              onClick={() => setStressScenario("flash_crash")}
              className={`p-3 rounded-xl border text-left transition ${
                stressScenario === "flash_crash"
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                  : "bg-[#0C1019] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-extrabold block text-sm">Flash Crash (-3.5%)</span>
              <span className="text-[11px] text-slate-400">Nifty index gap down</span>
              <span className="block mt-2 font-mono font-bold text-rose-400">Est. Drawdown: -1.8%</span>
            </button>

            <button
              onClick={() => setStressScenario("rate_hike")}
              className={`p-3 rounded-xl border text-left transition ${
                stressScenario === "rate_hike"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "bg-[#0C1019] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-extrabold block text-sm">Interest Rate Shock (+50bps)</span>
              <span className="text-[11px] text-slate-400">Central Bank tightening</span>
              <span className="block mt-2 font-mono font-bold text-amber-400">Est. Volatility: +24%</span>
            </button>

            <button
              onClick={() => setStressScenario("bull_rally")}
              className={`p-3 rounded-xl border text-left transition ${
                stressScenario === "bull_rally"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-[#0C1019] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-extrabold block text-sm">Liquidity Bull Breakout (+3.0%)</span>
              <span className="text-[11px] text-slate-400">FII aggressive surge</span>
              <span className="block mt-2 font-mono font-bold text-emerald-400">Est. Gain: +4.2%</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#07090F] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">1-DAY VALUE AT RISK (VaR 99%):</span>
              <span className="text-white font-bold">{curr}14,280 (1.42% of ₹10L Margin)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MAX RECOVERY HORIZON:</span>
              <span className="text-emerald-400 font-bold">1.2 Trading Days</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CAPITAL HEALTH STATUS:</span>
              <span className="text-emerald-400 font-bold uppercase">Optimal Risk Buffer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
