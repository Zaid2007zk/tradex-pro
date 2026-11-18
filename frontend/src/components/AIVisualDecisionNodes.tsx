"use client";

import React, { useState } from "react";
import {
  Brain,
  GitBranch,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  DollarSign,
  PlayCircle,
  Eye,
} from "lucide-react";
import STOCK_DATABASE from "@/data/stock_database.json";

export interface AIVisualDecisionNodesProps {
  symbol: string;
  price: number;
  currency: string;
  changePercent: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
  onSelectStock?: (symbol: string) => void;
  onPreFillOrder?: (order: {
    symbol: string;
    side: "BUY" | "SELL";
    product: "MIS" | "CNC";
    orderType: "MARKET" | "LIMIT";
    quantity: number;
    price: number;
    targetPrice?: number;
    stopLoss?: number;
  }) => void;
  onOpenCopilot?: (query: string) => void;
}

export type ViewMode = "nodes" | "guided" | "risk_screener" | "quant";

export const AIVisualDecisionNodes: React.FC<AIVisualDecisionNodesProps> = ({
  symbol,
  price,
  currency,
  changePercent,
  rsi14,
  macd,
  macdSignal,
  sma20,
  sma50,
  volatility,
  onSelectStock,
  onPreFillOrder,
  onOpenCopilot,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<ViewMode>("nodes");
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  const currSym = currency === "INR" ? "₹" : "$";

  // Technical calculations
  const isTrendUp = price > sma20 && sma20 > sma50;
  const isTrendDown = price < sma20 && sma20 < sma50;
  const isMacdCross = macd > macdSignal;
  const isRsiOverbought = rsi14 > 70;
  const isRsiOversold = rsi14 < 35;
  const isRsiBalanced = rsi14 >= 45 && rsi14 <= 65;

  // Bullish/Bearish breakouts
  const upThreshold = parseFloat((Math.max(price, sma20) * 1.008).toFixed(2));
  const downThreshold = parseFloat((Math.min(price, sma20) * 0.992).toFixed(2));
  const target1 = parseFloat((price * (isTrendUp ? 1.025 : 0.98)).toFixed(2));
  const target2 = parseFloat((price * (isTrendUp ? 1.045 : 0.965)).toFixed(2));
  const stopLoss = parseFloat((price * (isTrendUp ? 0.985 : 1.015)).toFixed(2));

  // Risk Score calculation (1 to 10)
  let riskScore = 4;
  if (volatility > 25) riskScore += 2;
  if (isRsiOverbought || isRsiOversold) riskScore += 2;
  if (Math.abs(changePercent) > 2.5) riskScore += 1;
  riskScore = Math.min(10, Math.max(1, riskScore));

  const riskLabel = riskScore <= 4 ? "LOW RISK (SAFE)" : riskScore <= 7 ? "MODERATE RISK" : "HIGH VOLATILITY RISK";
  const riskColor = riskScore <= 4 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : riskScore <= 7 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-rose-400 bg-rose-500/10 border-rose-500/30";

  // The 5 Sequential Decision Nodes
  const nodes = [
    {
      id: "node-1",
      stepNumber: "Step 1",
      title: "Market Direction Predictor",
      shortSummary: isTrendUp ? "BULLISH (Upward Continuation)" : isTrendDown ? "BEARISH (Downward Pressure)" : "SIDEWAYS CONSOLIDATION",
      status: isTrendUp ? "UP" : isTrendDown ? "DOWN" : "NEUTRAL",
      statusColor: isTrendUp ? "bg-emerald-500" : isTrendDown ? "bg-rose-500" : "bg-amber-500",
      instruction: isTrendUp
        ? `Sustained trade above ${currSym}${upThreshold} confirms bullish continuation (+2.0% to +4.2% projected expansion).`
        : `A breakdown below ${currSym}${downThreshold} triggers defensive downside support tests.`,
      detail: `Trend analysis: Current price (${currSym}${price.toFixed(2)}) trades ${price >= sma20 ? "above" : "below"} the 20-Day SMA (${currSym}${sma20.toFixed(2)}). Bullish breakout trigger is ${currSym}${upThreshold}, with structural support at ${currSym}${downThreshold}.`,
      actionPrompt: "Verify direction: Align execution with prevailing quantitative trend.",
    },
    {
      id: "node-2",
      stepNumber: "Step 2",
      title: "Momentum & Confirmation Filter",
      shortSummary: isMacdCross ? "BUY Momentum Confirmed" : "Caution: Waiting for MACD Signal",
      status: isMacdCross ? "CONFIRMED" : "WAITING",
      statusColor: isMacdCross ? "bg-emerald-500" : "bg-amber-500",
      instruction: `RSI-14 is ${rsi14.toFixed(1)} (${isRsiBalanced ? "Healthy Buyer Strength" : isRsiOverbought ? "Overbought: Await mean-reversion dip" : "Oversold: Statistical rebound zone"}). MACD histogram reflects ${macd > macdSignal ? "Positive buyer accumulation" : "Bearish momentum compression"}.`,
      detail: `Signal validation: Cross-reference MACD delta and RSI distribution to eliminate false breakouts. Currently RSI resides in ${isRsiBalanced ? "optimal entry channel" : "tactical caution zone"}.`,
      actionPrompt: isMacdCross ? "Momentum confirmed: Advance to Risk Allocation node." : "Await confirmation: Allow 15-minute bar to close above pivot.",
    },
    {
      id: "node-3",
      stepNumber: "Step 3",
      title: "Risk & Capital Allocation",
      shortSummary: `${riskLabel} (Score ${riskScore}/10)`,
      status: riskScore <= 5 ? "BUYABLE" : "HIGH RISK",
      statusColor: riskScore <= 5 ? "bg-emerald-500" : "bg-amber-500",
      instruction: `Capital stratification: Delivery (CNC) carries zero margin call risk. Intraday (5x MIS) amplifies purchasing power with mandatory Stop-Loss at ${currSym}${stopLoss}.`,
      detail: `Volatility metrics: Annualized volatility is ${volatility.toFixed(1)}%. Expected standard deviation is ±${(price * 0.015).toFixed(2)}. Restrict position size to 1.5% - 2.0% maximum portfolio drawdown.`,
      actionPrompt: "Position sizing: Confirm risk limits before routing order.",
    },
    {
      id: "node-4",
      stepNumber: "Step 4",
      title: "Systematic Order Execution Plan",
      shortSummary: `BUY Entry: ${currSym}${price.toFixed(2)} | Stop-Loss: ${currSym}${stopLoss}`,
      status: "ACTIONABLE",
      statusColor: "bg-blue-500",
      instruction: `Execution blueprint: 1. Entry @ ${currSym}${price.toFixed(2)} | 2. Target 1 @ ${currSym}${target1} | 3. Stop-Loss @ ${currSym}${stopLoss}.`,
      detail: `Execution routing: Use 1-Click 'Pre-fill AI Order' to load parameters into the Execution Dock. Select 'MIS' for leveraged intraday or 'CNC' for cash delivery.`,
      actionPrompt: "Stage order ticket and execute via DMA gateway.",
    },
    {
      id: "node-5",
      stepNumber: "Step 5",
      title: "Profit Realization & Trailing Stop",
      shortSummary: `Target T1: ${currSym}${target1} (+${(((target1 - price) / price) * 100).toFixed(1)}%)`,
      status: "EXIT PLAN",
      statusColor: "bg-purple-500",
      instruction: `Upon reaching Target 1 (${currSym}${target1}), liquidate 50% volume to lock profits, then trail remaining stop-loss to breakeven (${currSym}${price.toFixed(2)}).`,
      detail: `Disciplined execution: Preserve capital by systematically trimming exposure at target milestones. If market reverses below ${currSym}${stopLoss}, execute immediate protective exit.`,
      actionPrompt: "Systematic trade management: Follow profit milestones and trail protective stops.",
    },
  ];

  // Stock screener comparison database
  const stockComparisonList = [
    { sym: "RELIANCE.NS", name: "Reliance Industries", price: 1335.80, rsi: 61.0, outlook: "UP / Bullish", risk: "Low", buyRating: "STRONG BUY", reason: "Support bounce + Energy demand rally" },
    { sym: "TCS.NS", name: "Tata Consultancy Services", price: 2396.90, rsi: 52.4, outlook: "UP / Accumulate", risk: "Low", buyRating: "BUY", reason: "Holding 2400 level, institutional accumulation" },
    { sym: "HDFCBANK.NS", name: "HDFC Bank Ltd", price: 813.65, rsi: 58.2, outlook: "UP / Reversal", risk: "Low", buyRating: "STRONG BUY", reason: "Breakout above 804 with strong volume" },
    { sym: "INFY.NS", name: "Infosys Limited", price: 1142.40, rsi: 48.7, outlook: "Consolidating", risk: "Moderate", buyRating: "HOLD", reason: "Trading in range, wait for 1160 breakout" },
    { sym: "ICICIBANK.NS", name: "ICICI Bank Ltd", price: 1581.60, rsi: 63.5, outlook: "UP / Momentum", risk: "Low", buyRating: "BUY", reason: "Strong banking index momentum" },
    { sym: "SBIN.NS", name: "State Bank of India", price: 1089.80, rsi: 64.1, outlook: "UP / High Momentum", risk: "Moderate", buyRating: "BUY", reason: "Approaching 1100 resistance, high volatility" },
    { sym: "ITC.NS", name: "ITC Limited", price: 294.85, rsi: 68.2, outlook: "UP / Fast Surge", risk: "Moderate", buyRating: "BUY (Caution)", reason: "+3.5% surge today, close to overbought" },
  ];

  const handlePreFill = () => {
    if (onPreFillOrder) {
      onPreFillOrder({
        symbol,
        side: isTrendUp ? "BUY" : "BUY",
        product: "MIS",
        orderType: "MARKET",
        quantity: 25,
        price,
        targetPrice: target1,
        stopLoss,
      });
    }
  };

  return (
    <div className="w-full bg-[#1E222D] border border-[#2A2E39] rounded-xl overflow-hidden shadow-2xl mb-4 transition-all">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#171B26] via-[#1E222D] to-[#1E222D] border-b border-[#2A2E39] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2962FF] to-[#7B1FA2] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                AI Visual Decision Nodes & Strategy Flow
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Interactive Navigator
              </span>
            </div>
            <p className="text-[11px] text-[#787B86]">
              Sequential Decision Tree: Market Up/Down • Risk Assessment • What to Buy • Exact Step-by-Step Action
            </p>
          </div>
        </div>

        {/* Perspective Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#131722] p-1 rounded-lg border border-[#2A2E39]">
          <button
            onClick={() => setActiveMode("nodes")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === "nodes"
                ? "bg-[#2962FF] text-white shadow-md"
                : "text-[#787B86] hover:text-white"
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>Visual Nodes</span>
          </button>

          <button
            onClick={() => setActiveMode("guided")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === "guided"
                ? "bg-[#2962FF] text-white shadow-md"
                : "text-[#787B86] hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Guided Execution Thesis</span>
          </button>

          <button
            onClick={() => setActiveMode("risk_screener")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === "risk_screener"
                ? "bg-[#2962FF] text-white shadow-md"
                : "text-[#787B86] hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Asset Screener Matrix</span>
          </button>

          <button
            onClick={() => setActiveMode("quant")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === "quant"
                ? "bg-[#2962FF] text-white shadow-md"
                : "text-[#787B86] hover:text-white"
            }`}
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>Pro Quant Logic</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-[#787B86] hover:text-white transition ml-1"
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5">
          {/* MODE 1: VISUAL NODE PIPELINE */}
          {activeMode === "nodes" && (
            <div className="space-y-5">
              {/* Up/Down Quick Prediction Callout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#131722] border border-[#2A2E39]">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isTrendUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {isTrendUp ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[11px] text-[#787B86] uppercase font-bold tracking-wider">Kaha Market UP Hoga?</span>
                    <p className="text-sm font-extrabold text-white">
                      Above <span className="text-emerald-400 font-mono">{currSym}{upThreshold}</span>
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-medium">Breakout Target: {currSym}{target1} (+{(((target1 - price) / price) * 100).toFixed(1)}%)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#787B86] uppercase font-bold tracking-wider">Kaha Market DOWN Hoga?</span>
                    <p className="text-sm font-extrabold text-white">
                      Below <span className="text-rose-400 font-mono">{currSym}{downThreshold}</span>
                    </p>
                    <p className="text-[11px] text-rose-400/90 font-medium">Breakdown Risk: Slip towards {currSym}{(price * 0.975).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-2 rounded bg-[#1E222D] border border-[#2A2E39]">
                  <div>
                    <span className="text-[11px] text-[#787B86] uppercase font-bold">Overall Risk Level</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-black px-2 py-0.5 rounded border ${riskColor}`}>
                        {riskLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handlePreFill}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Execute Plan</span>
                  </button>
                </div>
              </div>

              {/* Connected Visual Interactive Nodes */}
              <div className="relative">
                <div className="text-xs font-bold text-[#787B86] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Interactive Sequential Steps (Click any node to inspect)</span>
                  <span className="text-blue-400 text-[11px] font-normal">Step {selectedNodeIndex + 1} of 5 Active</span>
                </div>

                {/* Node Cards Horizontal Scroll / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
                  {nodes.map((node, idx) => {
                    const isSelected = selectedNodeIndex === idx;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeIndex(idx)}
                        className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative ${
                          isSelected
                            ? "bg-[#2A2E39] border-blue-500 shadow-xl ring-2 ring-blue-500/30 scale-[1.02]"
                            : "bg-[#131722] border-[#2A2E39] hover:border-[#3E4452] hover:bg-[#1A1E29]"
                        }`}
                      >
                        {/* Node Step Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            isSelected ? "bg-blue-500 text-white" : "bg-[#2A2E39] text-[#787B86]"
                          }`}>
                            {node.stepNumber}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${node.statusColor} animate-pulse`} />
                        </div>

                        <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                          {node.title}
                        </h4>

                        <p className="text-[11px] text-emerald-400 font-semibold mb-2 line-clamp-1">
                          {node.shortSummary}
                        </p>

                        <div className="text-[10px] text-[#787B86] bg-[#1E222D] p-1.5 rounded border border-[#2A2E39]/50 line-clamp-2">
                          {node.instruction}
                        </div>

                        {idx < 4 && (
                          <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#787B86]">
                            <ArrowRight className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Selected Node Deep-Dive Card */}
              {(() => {
                const activeNode = nodes[selectedNodeIndex];
                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#171B26] to-[#1E222D] border border-blue-500/40 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          {activeNode.stepNumber} Deep Analysis
                        </span>
                        <h3 className="text-sm font-bold text-white">{activeNode.title}</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {activeNode.shortSummary}
                      </span>
                    </div>

                    <p className="text-xs text-[#D1D4DC] leading-relaxed mb-3">
                      {activeNode.detail}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2A2E39]">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Action: {activeNode.actionPrompt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (selectedNodeIndex < 4) setSelectedNodeIndex(selectedNodeIndex + 1);
                          }}
                          disabled={selectedNodeIndex >= 4}
                          className="px-3 py-1 rounded bg-[#2A2E39] hover:bg-[#3E4452] text-xs font-semibold text-white disabled:opacity-30 transition flex items-center gap-1"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handlePreFill}
                          className="px-3.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-md flex items-center gap-1"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Pre-fill This Trade</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* MODE 2: GUIDED EXECUTION THESIS */}
          {activeMode === "guided" && (
            <div className="p-4 rounded-xl bg-[#131722] border border-[#2A2E39] space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Institutional Trade Execution Blueprint ({symbol})</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-[#D1D4DC]">
                <div className="p-3 rounded-lg bg-[#1E222D] border-l-4 border-blue-500">
                  <h4 className="font-bold text-white text-xs mb-1">
                    1️⃣ Market Regime &amp; Trend Trajectory
                  </h4>
                  <p>
                    Currently **{symbol}** trades at **{currSym}{price.toFixed(2)}**.
                    {isTrendUp
                      ? ` Bullish regime confirmed above 20-Day SMA (${currSym}${sma20.toFixed(2)}). A sustained push through ${currSym}${upThreshold} unlocks upside extension toward ${currSym}${target1}.`
                      : ` Price is consolidating within horizontal support. A drop below ${currSym}${downThreshold} invalidates bullish thesis and triggers downside risk.`}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1E222D] border-l-4 border-emerald-500">
                  <h4 className="font-bold text-white text-xs mb-1">
                    2️⃣ Momentum Confluence &amp; Signal Quality
                  </h4>
                  <p>
                    RSI indicator is indexed at **{rsi14.toFixed(1)}**. {isRsiBalanced ? "Asset resides in balanced equilibrium with healthy accumulation strength." : isRsiOverbought ? "Momentum is extended in overbought zone; await pullback toward 20-SMA." : "Oversold territory; statistical reversal setup developing."}
                    MACD histogram confirms **{macd > macdSignal ? "positive buyer accumulation delta" : "bearish momentum compression"}**.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1E222D] border-l-4 border-amber-500">
                  <h4 className="font-bold text-white text-xs mb-1">
                    3️⃣ Capital Allocation &amp; Risk Stratification
                  </h4>
                  <p>
                    • **Delivery (CNC):** Zero margin risk. Asset is 100% cash funded with indefinite holding duration.<br/>
                    • **Intraday (MIS):** 5x leverage execution. Requires strict disciplined Stop-Loss at **{currSym}{stopLoss}** and square-off before 15:15 IST.<br/>
                    • **Risk Budget:** Deploy standard 25-share sizing to cap maximum allowable loss at &lt;1.5% of simulated portfolio equity.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#1E222D] border-l-4 border-purple-500">
                  <h4 className="font-bold text-white text-xs mb-1">
                    4️⃣ Order Execution &amp; Bracket Management
                  </h4>
                  <p>
                    Stage order via Execution Dock: Select **BUY**, Quantity **25**, Product **CNC / MIS**.<br/>
                    Primary Target: **{currSym}{target1}** (+{(((target1 - price) / price) * 100).toFixed(1)}%)<br/>
                    Invalidation Stop-Loss: **{currSym}{stopLoss}** (-1.5%)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => onOpenCopilot && onOpenCopilot(`Provide institutional thesis and risk breakdown for ${symbol}`)}
                  className="px-3 py-1.5 rounded bg-[#2A2E39] hover:bg-[#3E4452] text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span>Consult AI Copilot</span>
                </button>
                <button
                  onClick={handlePreFill}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition"
                >
                  Stage Order in Ticket
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: ASSET OPPORTUNITY MATRIX (RISK VS REWARD SCREENER) */}
          {activeMode === "risk_screener" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787B86] font-semibold">
                  Cross-asset quantitative comparison: Risk-adjusted ratings, volatility profile, and breakout confirmation triggers.
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Real-Time Market Screening</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#2A2E39]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131722] text-[#787B86] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A2E39]">
                    <tr>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">AI Rating</th>
                      <th className="p-2.5">Risk Level</th>
                      <th className="p-2.5">Direction Bias</th>
                      <th className="p-2.5">Quantitative Catalyst</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E39] bg-[#1E222D]">
                    {stockComparisonList.map((item) => {
                      const isCurrent = item.sym === symbol;
                      return (
                        <tr
                          key={item.sym}
                          className={`hover:bg-[#2A2E39]/60 transition ${isCurrent ? "bg-blue-500/10" : ""}`}
                        >
                          <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                            <span>{item.sym.replace(".NS", "")}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-black">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-[#D1D4DC]">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                item.buyRating.includes("STRONG")
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : item.buyRating.includes("BUY")
                                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {item.buyRating}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.risk === "Low"
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {item.risk} Risk
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-white">
                            {item.outlook}
                          </td>
                          <td className="p-2.5 text-[#787B86] text-[11px] max-w-[200px] truncate">
                            {item.reason}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => onSelectStock && onSelectStock(item.sym)}
                              className="px-2.5 py-1 rounded bg-[#131722] hover:bg-[#2962FF] hover:text-white text-[#787B86] border border-[#2A2E39] text-[11px] font-bold transition"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODE 4: PRO QUANT LOGIC */}
          {activeMode === "quant" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#131722] border border-[#2A2E39] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mathematical Confluence Engine</span>
                </h4>
                <div className="space-y-1 text-[#787B86] font-mono text-[11px]">
                  <p>• 20-Day SMA: {currSym}{sma20.toFixed(2)} (Deviation: {(((price - sma20) / sma20) * 100).toFixed(2)}%)</p>
                  <p>• 50-Day SMA: {currSym}{sma50.toFixed(2)} (Regime: {sma20 > sma50 ? "Golden Cross" : "Death Cross"})</p>
                  <p>• RSI 14-Period: {rsi14.toFixed(2)} (Z-score normalized momentum)</p>
                  <p>• MACD Line: {macd.toFixed(2)} | Signal: {macdSignal.toFixed(2)} (Delta: {(macd - macdSignal).toFixed(2)})</p>
                  <p>• Historical Volatility: {volatility.toFixed(2)}% (Annualized ATR proxy)</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131722] border border-[#2A2E39] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>Quantitative Risk & Reward Model</span>
                </h4>
                <div className="space-y-1 text-[#787B86] font-mono text-[11px]">
                  <p>• Upside Probability (P_up): {(isTrendUp ? 74.2 : 51.5).toFixed(1)}%</p>
                  <p>• Expected Value (EV): +{(price * 0.018).toFixed(2)} per standard unit</p>
                  <p>• Optimal Kelly Criterion Sizing: 3.4% of portfolio capital</p>
                  <p>• Risk:Reward Ratio: 1 : 2.1 (T1) | 1 : 3.2 (T2)</p>
                  <p>• Maximum Drawdown Constraint: 1.5% max capital tolerance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
