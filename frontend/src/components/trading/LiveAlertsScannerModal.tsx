"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Flame,
} from "lucide-react";
import { soundEngine } from "@/utils/soundEngine";

export interface TradeAlertItem {
  id: string;
  time: string;
  symbol: string;
  type: "BREAKOUT" | "OVERSOLD" | "OVERBOUGHT" | "STOPLOSS";
  price: number;
  change: string;
  rationale: string;
  target: number;
  stopLoss: number;
  confidence: number;
}

interface LiveAlertsScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade?: (order: {
    symbol: string;
    side: "BUY" | "SELL";
    product: "CNC" | "MIS";
    orderType: "MARKET";
    quantity: number;
    price: number;
    marginRequired: number;
  }) => void;
  onSelectSymbol?: (symbol: string) => void;
}

export const LiveAlertsScannerModal: React.FC<LiveAlertsScannerModalProps> = ({
  isOpen,
  onClose,
  onExecuteTrade,
  onSelectSymbol,
}) => {
  const [filterType, setFilterType] = useState<"ALL" | "BREAKOUT" | "OVERSOLD" | "OVERBOUGHT">("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const alerts: TradeAlertItem[] = [
    {
      id: "alt-1",
      time: "Just now",
      symbol: "RELIANCE.NS",
      type: "BREAKOUT",
      price: 1335.8,
      change: "+0.97%",
      rationale: "15-minute bullish expansion candle crossed 20-Day SMA (₹1320.00) with Wilder RSI surge to 68.4.",
      target: 1369.2,
      stopLoss: 1315.75,
      confidence: 94,
    },
    {
      id: "alt-2",
      time: "1 min ago",
      symbol: "TCS.NS",
      type: "BREAKOUT",
      price: 3824.5,
      change: "+1.92%",
      rationale: "Multi-day range breakout confirmed above ₹3800 resistance with heavy institutional volume.",
      target: 3920.0,
      stopLoss: 3760.0,
      confidence: 91,
    },
    {
      id: "alt-3",
      time: "3 mins ago",
      symbol: "HDFCBANK.NS",
      type: "OVERSOLD",
      price: 1688.0,
      change: "+1.15%",
      rationale: "Pullback retested 50-Day SMA baseline with bullish RSI divergence. Prime value accumulation zone.",
      target: 1735.0,
      stopLoss: 1665.0,
      confidence: 88,
    },
    {
      id: "alt-4",
      time: "5 mins ago",
      symbol: "NVDA",
      type: "BREAKOUT",
      price: 142.8,
      change: "+2.85%",
      rationale: "NASDAQ semiconductor index breakout with massive call option open interest accumulation.",
      target: 148.5,
      stopLoss: 139.2,
      confidence: 96,
    },
    {
      id: "alt-5",
      time: "8 mins ago",
      symbol: "AAPL",
      type: "OVERBOUGHT",
      price: 228.4,
      change: "+1.22%",
      rationale: "Wilder RSI registers at 78.9 (Overbought exhaustion). Recommending 50% profit booking at current quote.",
      target: 231.0,
      stopLoss: 224.0,
      confidence: 85,
    },
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === "ALL") return true;
    return a.type === filterType;
  });

  const handleExecute = (alert: TradeAlertItem) => {
    soundEngine.playOrderFilled();
    if (onExecuteTrade) {
      onExecuteTrade({
        symbol: alert.symbol,
        side: alert.type === "OVERBOUGHT" ? "SELL" : "BUY",
        product: "CNC",
        orderType: "MARKET",
        quantity: 25,
        price: alert.price,
        marginRequired: alert.price * 25,
      });
    }
    if (onSelectSymbol) {
      onSelectSymbol(alert.symbol);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0E17] border border-amber-500/25 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2433] bg-[#0E121D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0E17] rounded-[9px] flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-mono">
                  Live AI Trade Alerts &amp; Breakout Scanner
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  {filteredAlerts.length} SIGNALS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional Algorithmic Scanning across Indian &amp; Global Equities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2433] transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2433] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-[#1E2433] bg-[#080B12] flex items-center gap-1.5 overflow-x-auto text-xs">
          {(["ALL", "BREAKOUT", "OVERSOLD", "OVERBOUGHT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundEngine.playTabSwitch();
                setFilterType(tab);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === tab
                  ? "bg-amber-400 text-black shadow"
                  : "text-slate-400 hover:text-white hover:bg-[#141824]"
              }`}
            >
              {tab === "ALL" && "All Live Signals"}
              {tab === "BREAKOUT" && "🚀 Bullish Breakouts"}
              {tab === "OVERSOLD" && "💎 Oversold Value Rebounds"}
              {tab === "OVERBOUGHT" && "⚠️ Profit Booking Warnings"}
            </button>
          ))}
        </div>

        {/* Alert Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-[#0F1320] border border-[#1F2638] hover:border-amber-500/30 transition space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg ${alert.type === "BREAKOUT" ? "bg-emerald-500/15 text-emerald-400" : alert.type === "OVERSOLD" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {alert.type === "BREAKOUT" ? <TrendingUp className="w-4 h-4" /> : alert.type === "OVERSOLD" ? <Sparkles className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white font-mono">{alert.symbol}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${alert.type === "BREAKOUT" ? "bg-emerald-500/20 text-emerald-400" : alert.type === "OVERSOLD" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-slate-500">{alert.time}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      LTP: {alert.symbol.includes(".NS") ? "₹" : "$"}{alert.price.toFixed(2)} ({alert.change})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">AI Confidence</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-400">{alert.confidence}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#07090F] p-2.5 rounded-lg border border-white/5">
                {alert.rationale}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-400">
                    Target: <strong>{alert.symbol.includes(".NS") ? "₹" : "$"}{alert.target.toFixed(2)}</strong>
                  </span>
                  <span className="text-rose-400">
                    Stop-Loss: <strong>{alert.symbol.includes(".NS") ? "₹" : "$"}{alert.stopLoss.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onSelectSymbol) onSelectSymbol(alert.symbol);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#181D2A] hover:bg-[#23293B] text-slate-300 hover:text-white font-semibold text-xs transition"
                  >
                    View Chart
                  </button>
                  <button
                    onClick={() => handleExecute(alert)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ 1-Click AI Buy</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1E2433] bg-[#0E121D] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">AUTO-SCAN REFRESH: EVERY 5 SECONDS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181D2A] hover:bg-[#22293B] text-white font-bold transition"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};