"use client";

import React, { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Gauge,
  Globe2,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { soundEngine } from "@/utils/soundEngine";

interface SectorHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol?: (symbol: string) => void;
}

export const SectorHeatmapModal: React.FC<SectorHeatmapModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<"INDIA" | "GLOBAL">("INDIA");

  if (!isOpen) return null;

  const fearGreedScore = 74; // 0-100 (Greed / Bullish Expansion)

  const indiaSectors = [
    {
      name: "IT & Technology",
      change: "+1.85%",
      isUp: true,
      topStock: "TCS.NS",
      stocks: ["TCS (+1.9%)", "INFY (+2.1%)", "WIPRO (+0.8%)", "HCLTECH (+1.4%)"],
      color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    },
    {
      name: "Banking & Financials",
      change: "+1.12%",
      isUp: true,
      topStock: "HDFCBANK.NS",
      stocks: ["HDFCBANK (+1.2%)", "ICICIBANK (+1.4%)", "SBIN (+0.9%)", "KOTAKBANK (+0.6%)"],
      color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    {
      name: "Energy, Oil & Gas",
      change: "+0.97%",
      isUp: true,
      topStock: "RELIANCE.NS",
      stocks: ["RELIANCE (+0.97%)", "ONGC (+1.5%)", "NTPC (+0.8%)", "POWERGRID (+0.4%)"],
      color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    {
      name: "Automobiles",
      change: "+0.45%",
      isUp: true,
      topStock: "TATAMOTORS.NS",
      stocks: ["TATAMOTORS (+1.1%)", "MARUTI (+0.2%)", "M&M (+0.5%)", "BAJAJ-AUTO (-0.1%)"],
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      name: "Metals & Mining",
      change: "+0.28%",
      isUp: true,
      topStock: "TATASTEEL.NS",
      stocks: ["TATASTEEL (+0.6%)", "HINDALCO (+0.4%)", "JSWSTEEL (-0.2%)"],
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      name: "Pharma & Healthcare",
      change: "-0.42%",
      isUp: false,
      topStock: "SUNPHARMA.NS",
      stocks: ["SUNPHARMA (-0.5%)", "CIPLA (-0.3%)", "DRREDDY (+0.2%)"],
      color: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    },
  ];

  const globalSectors = [
    {
      name: "US Mega-Cap Tech",
      change: "+1.42%",
      isUp: true,
      topStock: "AAPL",
      stocks: ["AAPL (+1.2%)", "NVDA (+2.8%)", "MSFT (+0.9%)", "AMZN (+1.5%)"],
      color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    },
    {
      name: "Semiconductors & AI",
      change: "+2.65%",
      isUp: true,
      topStock: "NVDA",
      stocks: ["NVDA (+2.8%)", "AMD (+3.1%)", "TSM (+1.9%)", "QCOM (+1.4%)"],
      color: "bg-emerald-500/25 border-emerald-500/50 text-emerald-200",
    },
    {
      name: "Consumer Discretionary",
      change: "+0.68%",
      isUp: true,
      topStock: "AMZN",
      stocks: ["AMZN (+1.5%)", "TSLA (+0.4%)", "NKE (-0.2%)"],
      color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    {
      name: "Global Energy",
      change: "-0.54%",
      isUp: false,
      topStock: "XOM",
      stocks: ["XOM (-0.6%)", "CVX (-0.4%)", "SHEL (-0.7%)"],
      color: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    },
  ];

  const activeSectors = selectedRegion === "INDIA" ? indiaSectors : globalSectors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0E17] border border-amber-500/25 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2433] bg-[#0E121D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0E17] rounded-[9px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-mono">
                  Market Heatmap &amp; Sentiment Radar
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE 60 FPS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional Sector Allocation &amp; Real-Time FII/DII Net Flow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex p-0.5 rounded-lg bg-[#141824] border border-[#212738]">
              <button
                onClick={() => {
                  soundEngine.playTabSwitch();
                  setSelectedRegion("INDIA");
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  selectedRegion === "INDIA"
                    ? "bg-amber-400 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                NSE / BSE
              </button>
              <button
                onClick={() => {
                  soundEngine.playTabSwitch();
                  setSelectedRegion("GLOBAL");
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  selectedRegion === "GLOBAL"
                    ? "bg-amber-400 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Global / US
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2433] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Market Mood (Fear & Greed) Gauge Section */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#101420] via-[#121827] to-[#101420] border border-amber-500/20 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            <div className="sm:col-span-5 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-bold text-amber-400">
                <Gauge className="w-4 h-4" />
                <span>MARKET MOOD INDEX (FEAR &amp; GREED)</span>
              </div>
              <div className="flex items-baseline justify-center sm:justify-start space-x-3">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {fearGreedScore}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  GREED (BULLISH)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Buyers are in strong control. Momentum favors buying on intraday dips above 20-Day SMA.
              </p>
            </div>

            {/* Gauge Bar */}
            <div className="sm:col-span-7 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span className="text-rose-400">0 Extreme Fear</span>
                <span className="text-amber-400">50 Neutral</span>
                <span className="text-emerald-400">100 Extreme Greed</span>
              </div>
              <div className="h-3 w-full bg-[#181D2A] rounded-full overflow-hidden p-0.5 border border-[#232A3B] relative">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${fearGreedScore}%` }}
                />
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-1.5 rounded bg-[#151926] border border-white/5">
                  <span className="text-[9px] text-slate-400 block">FII Net Flow</span>
                  <span className="text-xs font-bold text-emerald-400">+₹2,420 Cr</span>
                </div>
                <div className="p-1.5 rounded bg-[#151926] border border-white/5">
                  <span className="text-[9px] text-slate-400 block">DII Net Flow</span>
                  <span className="text-xs font-bold text-emerald-400">+₹1,890 Cr</span>
                </div>
                <div className="p-1.5 rounded bg-[#151926] border border-white/5">
                  <span className="text-[9px] text-slate-400 block">India VIX</span>
                  <span className="text-xs font-bold text-emerald-400">13.4 (-2.1%)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sector Heatmap Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Sector Performance Heatmap</span>
              </h4>
              <span className="text-[11px] text-slate-400">Click any sector to trade its leading stock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSectors.map((sector, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    soundEngine.playOrderFilled();
                    if (onSelectSymbol) onSelectSymbol(sector.topStock);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border ${sector.color} hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex flex-col justify-between space-y-3 shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        {sector.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Lead: {sector.topStock}
                      </span>
                    </div>
                    <span className="text-sm font-black font-mono">
                      {sector.change}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
                    {sector.stocks.map((stk, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300"
                      >
                        {stk}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 pt-1">
                    <span>Inspect {sector.topStock}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1E2433] bg-[#0E121D] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">MARKET REGIME: BULLISH EXPANSION</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181D2A] hover:bg-[#22293B] text-white font-bold transition"
          >
            Close Heatmap
          </button>
        </div>
      </div>
    </div>
  );
};