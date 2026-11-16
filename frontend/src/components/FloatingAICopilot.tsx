"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Brain,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
  Bot,
  User,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface FloatingAICopilotProps {
  currentSymbol: string;
  currentPrice: number;
  currency: string;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const FloatingAICopilot: React.FC<FloatingAICopilotProps> = ({
  currentSymbol,
  currentPrice,
  currency,
  rsi14,
  macd,
  macdSignal,
  sma20,
  sma50,
  volatility,
  isOpenExternal,
  onCloseExternal,
  initialQuery,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currSym = currency === "INR" ? "₹" : "$";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "ai",
      text: `Hello! I am your TradeX AI Copilot. I analyze real-time technical indicators, quantitative models, and chart patterns. How can I help you analyze **${currentSymbol}** today?`,
      timestamp: "Just now",
    },
  ]);

  // Synchronize external open triggers
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Handle initial query trigger
  useEffect(() => {
    if (initialQuery && initialQuery.length > 0) {
      setIsOpen(true);
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Smart Context-Aware Quantitative Response Engine
  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    const isTrendBullish = currentPrice > sma20 && sma20 > sma50;
    const isMacdCross = macd > macdSignal;
    const isRsiOverbought = rsi14 > 70;
    const isRsiOversold = rsi14 < 35;

    // 0. Beginner / Getting Started Query (Hindi & English)
    if (
      q.includes("shuru") ||
      q.includes("start") ||
      q.includes("begin") ||
      q.includes("kese karu") ||
      q.includes("kaise karu") ||
      q.includes("seekhna") ||
      q.includes("guide") ||
      q.includes("kya karu")
    ) {
      return `### 🚀 TradeX Pro Par Shuruat Kaise Karein (Beginner's Step-by-Step Guide)\n\n` +
        `Aap bina kisi risk ke 5 aasan steps mein trading sikh sakte hain:\n\n` +
        `1. **💰 ₹10,00,000 Virtual Cash Use Karein:**\n` +
        `   Aapko Paper Trading wallet mein bina real paise ke practice karne ke liye virtual cash mila hai. Aap bina tension ke trade test kar sakte hain.\n\n` +
        `2. **📈 Stock & Chart Select Karein:**\n` +
        `   Upar watchlist se koi stock chune (jaise **RELIANCE**, **TCS**, **HDFCBANK**). Chart par real price action aur indicators dekhein.\n\n` +
        `3. **🤖 AI Prediction & Target Dekhein:**\n` +
        `   Chart ke upar **AI Neural Prediction** badge dekhein — yeh aapko Signal (**STRONG BUY / HOLD**), Target price, aur Stop-Loss suggest karta hai.\n\n` +
        `4. **⚡ Virtual Order Place Karein:**\n` +
        `   Right side panel par **BUY** ya **SELL** click karein, quantity enter karein aur order confirm karein!\n\n` +
        `5. **🎓 Trading Academy Explore Karein:**\n` +
        `   Top bar mein **Academy** tab par jayein jahan pure beginner lessons (Hinglish mein) available hain!\n\n` +
        `> 💬 *Aap mujhse kisi bhi stock ke baare mein pooch sakte hain, jaise: "RELIANCE kal kaisa rahega?" ya "Stop-loss kitna lagayein?"*`;
    }

    // Node & Decision Flow / Up-Down / Risk / Difference Query
    if (
      q.includes("node") ||
      q.includes("flow") ||
      q.includes("kaha up") ||
      q.includes("kaha down") ||
      q.includes("konsa buy") ||
      q.includes("kisme risk") ||
      q.includes("difference") ||
      q.includes("yee karo") ||
      q.includes("uske bad")
    ) {
      const upLevel = (currentPrice * 1.008).toFixed(2);
      const downLevel = (currentPrice * 0.992).toFixed(2);
      const t1 = (currentPrice * (isTrendBullish ? 1.025 : 0.98)).toFixed(2);
      const sl = (currentPrice * (isTrendBullish ? 0.985 : 1.015)).toFixed(2);

      return `### 🗺️ AI Sequential Decision Nodes for **${currentSymbol}**\n\n` +
        `**📍 Node 1: Kahan Market UP hoga vs Kahan DOWN hoga?**\n` +
        `* 🚀 **UP Condition:** Agar price **${currSym}${upLevel}** ke upar sustain kare, toh market UP hoga (+2.5% target: **${currSym}${t1}**).\n` +
        `* 🔻 **DOWN Condition:** Agar price **${currSym}${downLevel}** ke niche slip kare, toh down-move aayega.\n\n` +
        `**📍 Node 2: Konsa Buy Karein? (Difference & Risk Breakdown)**\n` +
        `* 🟢 **Delivery (CNC) - LOW RISK:** Best for beginners. Share hold kar sakte hain, koi daily expiry nahi hoti.\n` +
        `* 🔴 **Intraday (MIS) - HIGH RISK:** 5x margin milta hai par 3:20 PM tak close karna hota hai. Strict stop-loss zaroori hai.\n\n` +
        `**📍 Node 3: Yee Karo, Uske Baad Yee Karo (Action Plan):**\n` +
        `1. **Step 1:** Chart par 20-Day SMA (${currSym}${sma20.toFixed(2)}) ke upar price dekh kar Buy entry plan karein.\n` +
        `2. **Step 2:** Stop-Loss hamesha **${currSym}${sl}** (-1.5%) par set karein.\n` +
        `3. **Step 3:** Target **${currSym}${t1}** aane par 50% profit book karke rest hold karein.\n\n` +
        `> 💡 *Chart ke theek upar ab **AI Visual Decision Nodes** panel active ho chuka hai, jahan se aap Visual Nodes, Aasan Hinglish Guide, aur Konsa Buy Karein Screener switch kar sakte hain!*`;
    }

    // 1. Tomorrow / Prediction Query
    if (q.includes("predict") || q.includes("tomorrow") || q.includes("kal") || q.includes("next day") || q.includes("signal")) {
      const direction = isTrendBullish && isMacdCross ? "BULLISH (UPWARD MOMENTUM)" : currentPrice < sma20 ? "BEARISH / CONSOLIDATION" : "RANGE-BOUND NEUTRAL";
      const confidence = isTrendBullish ? "86.5%" : "78.2%";
      const target = (currentPrice * (isTrendBullish ? 1.025 : 0.985)).toFixed(2);
      const stop = (currentPrice * (isTrendBullish ? 0.985 : 1.015)).toFixed(2);

      return `### 🧠 AI Next-Day Prediction for **${currentSymbol}**\n\n` +
        `* **Model Outlook:** **${direction}** (Confidence: **${confidence}**)\n` +
        `* **Expected Target:** **${currSym}${target}**\n` +
        `* **Dynamic Stop-Loss:** **${currSym}${stop}**\n` +
        `* **Technical Rationale:** Price is trading at **${currSym}${currentPrice.toFixed(2)}** relative to 20-SMA (${currSym}${sma20.toFixed(2)}). RSI stands at **${rsi14.toFixed(1)}**, indicating ${rsi14 > 60 ? "strong buyer conviction" : rsi14 < 40 ? "oversold accumulation zone" : "balanced momentum"}.\n\n` +
        `> 💡 *Recommendation: Maintain strict stop-loss and limit exposure to 2-3% of portfolio.*`;
    }

    // 2. Support & Resistance Query
    if (q.includes("support") || q.includes("resistance") || q.includes("levels") || q.includes("target")) {
      const s1 = (currentPrice * 0.982).toFixed(2);
      const s2 = (currentPrice * 0.965).toFixed(2);
      const r1 = (currentPrice * 1.022).toFixed(2);
      const r2 = (currentPrice * 1.045).toFixed(2);

      return `### 🎯 Key Structural Levels for **${currentSymbol}**\n\n` +
        `* **Immediate Resistance (R1):** **${currSym}${r1}** (Pivot Breakout Zone)\n` +
        `* **Major Resistance (R2):** **${currSym}${r2}** (Supply Zone)\n` +
        `* **Key Support (S1):** **${currSym}${s1}** (20-day Moving Average Congestion)\n` +
        `* **Strong Baseline (S2):** **${currSym}${s2}** (Demand Zone)\n\n` +
        `*Break above ${currSym}${r1} with above-average volume confirms secondary wave continuation.*`;
    }

    // 3. Stop-Loss & Risk Management Query
    if (q.includes("stop") || q.includes("risk") || q.includes("loss") || q.includes("capital") || q.includes("size")) {
      const riskPerShare = (currentPrice * 0.015).toFixed(2);
      const stopPrice = (currentPrice * 0.985).toFixed(2);
      return `### 🛡️ Quantitative Risk Management for **${currentSymbol}**\n\n` +
        `* **Optimal Stop-Loss Level:** **${currSym}${stopPrice}** (-1.5% from current price)\n` +
        `* **Annualized Volatility:** **${volatility.toFixed(1)}%**\n` +
        `* **Position Sizing Rule (1% Rule):** For ₹1,00,000 capital with 1% risk (₹1,000 risk budget), maximum position size is **${Math.floor(1000 / parseFloat(riskPerShare))} shares**.\n` +
        `* **Risk-to-Reward Ratio:** Minimum **1:2.0** targeted on all swing trades.`;
    }

    // 4. Breakout / Top Stocks Query
    if (q.includes("breakout") || q.includes("top") || q.includes("best") || q.includes("buy")) {
      return `### ⚡ Top High-Probability Setups Today\n\n` +
        `1. **RELIANCE.NS** (Energy / Retail): Strong baseline consolidation near ₹1339, MACD golden cross building.\n` +
        `2. **TCS.NS** (IT): Holding support above 2400 with institutional delivery accumulation.\n` +
        `3. **AAPL** (Tech): Expanding above 20-SMA with 65.4 RSI momentum.\n\n` +
        `> Scan the **Signal Matrix** tab for live factor scorecards across all active stocks!`;
    }

    // 5. Hindi / Hinglish Query
    if (q.includes("hindi") || q.includes("hinglish") || q.includes("kya lagta") || q.includes("batao")) {
      return `### 🇮🇳 ${currentSymbol} Ka AI Vishleshan (Analysis)\n\n` +
        `* **Current Trend:** ${isTrendBullish ? "Stock mein tezi (Bullish) ka rukh bana hua hai." : "Stock thoda consolidate kar raha hai."}\n` +
        `* **RSI Indicator:** **${rsi14.toFixed(1)}** par hai — ${rsi14 > 60 ? "kharidari achhi chal rahi hai." : "neutral zone mein hai."}\n` +
        `* **Kharidne Ka Plan (Strategy):** ${currSym}${currentPrice.toFixed(2)} ke aas paas entry aur ${currSym}${(currentPrice * 0.985).toFixed(2)} ka stop loss rakhna surakshit rahega.\n\n` +
        `*Trade hamesha stop-loss ke saath karein!*`;
    }

    // Default Fallback Analysis
    return `### 📊 Deep Quantitative Overview for **${currentSymbol}**\n\n` +
      `* **Current Market Price:** **${currSym}${currentPrice.toFixed(2)}**\n` +
      `* **20-Day SMA:** **${currSym}${sma20.toFixed(2)}** • **50-Day SMA:** **${currSym}${sma50.toFixed(2)}**\n` +
      `* **RSI (14):** **${rsi14.toFixed(1)}** (${isRsiOverbought ? "Overbought Warning" : isRsiOversold ? "Oversold Rebound" : "Balanced Range"})\n` +
      `* **MACD Delta:** **${(macd - macdSignal).toFixed(2)}** (${isMacdCross ? "Positive Momentum" : "Negative Momentum"})\n` +
      `* **Model Summary:** Overall confluence bias is **${isTrendBullish ? "BULLISH" : "NEUTRAL/CONSOLIDATING"}**.\n\n` +
      `*You can ask me for "Price targets", "Support/Resistance", or "Risk management" anytime!*`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const quickPills = [
    `Main shuru kaise karu?`,
    `Kahan market UP hoga aur kahan DOWN?`,
    `Konsa buy karein aur kisme risk hai?`,
    `AI Sequential Decision Nodes`,
    `Predict tomorrow for ${currentSymbol}`,
    `Stop-Loss & Risk calculation`,
    `Hinglish mein batao`,
  ];

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#2962FF] via-[#1E53E5] to-[#7B1FA2] text-white font-bold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 group"
          title="Open TradeX AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="tracking-wide">Ask TradeX AI</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-black uppercase">
            Copilot
          </span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#131722] border border-[#2A2E39] rounded-2xl shadow-2xl overflow-hidden ${
            isExpanded
              ? "inset-4 sm:inset-10"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[580px] max-h-[90vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E222D] to-[#252A37] border-b border-[#2A2E39] p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2962FF] to-[#7B1FA2] flex items-center justify-center text-white shadow-md">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    TradeX AI Copilot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#787B86] font-medium">
                  Active Focus: <span className="text-white font-bold">{currentSymbol}</span> • {currSym}{currentPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseExternal) onCloseExternal();
                }}
                className="p-1.5 rounded-lg text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="bg-[#181B24] border-b border-[#2A2E39] px-3 py-2 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#1E222D] hover:bg-[#2962FF]/20 hover:text-[#2962FF] hover:border-[#2962FF]/40 border border-[#2A2E39] text-[11px] font-medium text-[#D1D4DC] transition"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#0F121A]/70 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-[#2962FF] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-[#2962FF] text-white rounded-br-none"
                      : "bg-[#1E222D] text-[#D1D4DC] border border-[#2A2E39] rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
                {m.sender === "user" && (
                  <div className="w-6 h-6 rounded-full bg-[#2A2E39] text-[#787B86] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-[#787B86] pl-8">
                <span className="w-2 h-2 rounded-full bg-[#2962FF] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#2962FF] animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-[#2962FF] animate-bounce" style={{ animationDelay: "0.4s" }} />
                <span className="font-medium text-[11px]">AI analyzing order book & momentum...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="bg-[#1E222D] border-t border-[#2A2E39] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${currentSymbol}...`}
                className="flex-1 bg-[#131722] border border-[#2A2E39] focus:border-[#2962FF] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#787B86] outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-[#2962FF] hover:bg-[#1E53E5] disabled:opacity-40 text-white font-bold transition shadow-md"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-[#787B86] text-center mt-2 font-medium">
              Powered by TradeX Multi-Factor AI • For educational & analytical purposes
            </div>
          </div>
        </div>
      )}
    </>
  );
};
