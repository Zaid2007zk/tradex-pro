"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
  Key,
} from "lucide-react";
import {
  queryAI,
  queryGemini,
  generateNaturalConversationalSynthesis,
  hasActiveGroqKey,
  hasActiveGeminiKey,
  getActiveAIProvider,
  MarketContext,
} from "@/services/geminiAiService";
import { GeminiKeyModal } from "@/components/GeminiKeyModal";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    setHasGeminiKey(hasActiveGeminiKey());
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: `### 🤖 TradeX Quantitative AI Copilot\n\n` +
        `Live telemetry synchronized with **${currentSymbol}** (LTP: **${currency === "INR" ? "₹" : "$"}${currentPrice.toFixed(2)}**).\n\n` +
        `Consult our institutional model on:\n` +
        `• *"Should I buy ${currentSymbol} at current market price?"*\n` +
        `• *"What are the critical upside breakout and downside breakdown pivots?"*\n` +
        `• *"Calculate dynamic stop-loss and profit-taking targets"*\n` +
        `• *"Compare Delivery CNC vs Intraday 5x MIS risk profile"*`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external open triggers (e.g. from AIPredictionBadge or navbar)
  useEffect(() => {
    if (isOpenExternal) {
      setIsOpen(true);
      if (initialQuery) {
        handleSend(initialQuery);
      }
    }
  }, [isOpenExternal, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
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

    const context: MarketContext = {
      symbol: currentSymbol,
      price: currentPrice,
      currency,
      changePercent: 0.0,
      rsi14,
      macd,
      macdSignal,
      sma20,
      sma50,
      volatility,
    };

    try {
      const reply = await queryAI(
        query,
        context,
        messages.map((m) => ({ sender: m.sender, text: m.text }))
      );
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: reply,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    } catch (err: any) {
      console.warn("AI query fallback to natural synthesizer:", err);
      const fallbackText = generateNaturalConversationalSynthesis(query, context);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackText,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }
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
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#2962FF] via-[#1E53E5] to-[#7B1FA2] text-white font-bold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 group"
          title="Open TradeX AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: "6s" }} />
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
                  Active Focus: <span className="text-white font-bold">{currentSymbol}</span> • {currency === "INR" ? "₹" : "$"}{currentPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Universal AI Engine Settings Button */}
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase flex items-center gap-1 border transition cursor-pointer ${
                  hasActiveGroqKey() || hasActiveGeminiKey()
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25"
                }`}
                title="Universal AI Engine Configuration (Groq / Gemini / Autonomous)"
              >
                <Zap className="w-3 h-3 text-cyan-300" />
                <span>
                  {getActiveAIProvider() === "groq" && hasActiveGroqKey()
                    ? "Groq 70B"
                    : getActiveAIProvider() === "gemini" && hasActiveGeminiKey()
                    ? "Gemini AI"
                    : "AI Engine"}
                </span>
              </button>

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

          {/* Quick Prompt Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-[#171B26] border-b border-[#2A2E39] no-scrollbar">
            {quickPills.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSend(pill)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] rounded-full bg-[#1E222D] hover:bg-[#2962FF] hover:text-white text-[#D1D4DC] border border-[#2A2E39] transition font-medium shrink-0 active:scale-95"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#131722]/80">
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              return (
                <div
                  key={m.id}
                  className={`flex ${isAi ? "justify-start" : "justify-end"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                      isAi
                        ? "bg-[#1E222D] text-[#D1D4DC] border border-[#2A2E39] rounded-tl-sm"
                        : "bg-gradient-to-r from-[#2962FF] to-[#1E53E5] text-white rounded-tr-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                    <span
                      className={`block text-[9px] mt-2 font-mono ${
                        isAi ? "text-[#787B86]" : "text-white/70 text-right"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl p-3 rounded-tl-sm flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#2962FF] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#7B1FA2] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#787B86] font-medium ml-1">
                    TradeX AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#1E222D] border-t border-[#2A2E39]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask TradeX AI anything in Hindi or English...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-[#131722] border border-[#2A2E39] focus:border-[#2962FF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#787B86] outline-none transition"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#1E53E5] hover:from-[#1E53E5] hover:to-[#2962FF] text-white transition disabled:opacity-40 shadow-lg shadow-blue-500/20 active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={() => setHasGeminiKey(hasActiveGeminiKey())}
      />
    </>
  );
};
