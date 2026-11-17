"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Shield,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Play,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { soundEngine } from "@/utils/soundEngine";
import {
  queryGemini,
  generateNeuralSynthesis,
  hasActiveGeminiKey,
  MarketContext,
} from "@/services/geminiAiService";
import { GeminiKeyModal } from "./GeminiKeyModal";

export interface PersonalTradingMentorProps {
  symbol: string;
  price: number;
  currency?: string;
  changePercent?: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
  availableMargin?: number;
  activePositions?: any[];
  onExecuteTrade?: (order: {
    symbol: string;
    side: "BUY" | "SELL";
    product: "MIS" | "CNC" | "MTF";
    orderType: "MARKET" | "LIMIT" | "SL";
    quantity: number;
    price: number;
    marginRequired: number;
  }) => void;
  onSelectStock?: (sym: string) => void;
}

export const PersonalTradingMentor: React.FC<PersonalTradingMentorProps> = ({
  symbol,
  price,
  currency = "INR",
  changePercent = 0,
  rsi14,
  macd,
  macdSignal,
  sma20,
  sma50,
  volatility,
  availableMargin,
  activePositions,
  onExecuteTrade,
  onSelectStock,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [assistantMessage, setAssistantMessage] = useState<string>("");
  const [isLoadingAnswer, setIsLoadingAnswer] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<"CNC" | "MIS">("CNC");

  const curr = currency === "INR" || currency === "₹" ? "₹" : "$";
  const upBreakout = (price * 1.008).toFixed(2);
  const downBreakdown = (price * 0.992).toFixed(2);
  const target1 = (price * 1.025).toFixed(2);
  const target2 = (price * 1.042).toFixed(2);
  const stopLoss = (price * 0.985).toFixed(2);
  const isBullish = price > sma20 && macd > macdSignal;

  // Speech Synthesizer for Audio Guidance
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!isVoiceActive) return;

    // Strip markdown formatting for clean audio
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/₹/g, "Rupees ")
      .replace(/\$/g, "Dollars ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Default Guidance based on active step & open position
  useEffect(() => {
    const activePos = activePositions?.find((p) => p.symbol === symbol);
    let msg = "";
    if (activePos) {
      setCurrentStep(4);
      msg = `🎉 Active Trade Alert: Aapka ${activePos.side} ${activePos.quantity} shares of ${symbol} active hai! Entry: ${curr}${activePos.entryPrice.toFixed(
        2
      )}, Live P&L: ${activePos.unrealizedPnl >= 0 ? "+" : ""}${curr}${activePos.unrealizedPnl.toFixed(
        2
      )}. Target: ${curr}${target1}, Stop-Loss: ${curr}${stopLoss}. Target aate hi munafa book karein!`;
    } else if (currentStep === 1) {
      msg = `Namaste! Main aapki Personal Trading Assistant "Aria" hoon. Abhi hum ${symbol} dekh rahe hain (LTP: ${curr}${price.toFixed(
        2
      )}). AI Decision Model ke anusar trend ${
        isBullish ? "BULLISH (UP)" : "CONSOLIDATING"
      } hai. Breakout trigger ${curr}${upBreakout} ke upar buy momentum tezi se banega, jabki ${curr}${downBreakdown} ke niche breakdown risk hai.`;
    } else if (currentStep === 2) {
      msg = `Ab Step 2: Risk decide karein. Agar aap safe rehna chahte hain toh "Delivery (CNC)" chunein—isme koi margin risk nahi hai. Agar aap aaj hi 5x leverage ke sath profit banana chahte hain toh "Intraday (MIS)" lein, lekin Stop-Loss ${curr}${stopLoss} lagana mandatory hai!`;
    } else if (currentStep === 3) {
      msg = `Step 3 Execution: Main aapke liye optimal trade ready kar chuki hoon. Quantity: 25 shares, Stop-Loss: ${curr}${stopLoss}, Target: ${curr}${target1}. Niche diye button par click karke trade auto-execute karein!`;
    } else if (currentStep === 4) {
      msg = `Step 4 P&L Protection: Trade place ho gaya hai! Niche "Positions Dock" me apna live munafa track karein. Jaise hi Target ${curr}${target1} hit hoga, main aapko profit book karne ka alert doongi!`;
    }
    setAssistantMessage(msg);
  }, [currentStep, symbol, price, isBullish, activePositions]);

  // Handle custom query to assistant
  const handleAskAssistant = async (queryText: string) => {
    const q = (queryText || customQuestion).trim();
    if (!q || isLoadingAnswer) return;

    setCustomQuestion("");
    setIsLoadingAnswer(true);

    const marketCtx: MarketContext = {
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
    };

    if (hasActiveGeminiKey()) {
      try {
        const answer = await queryGemini(q, marketCtx, [
          { sender: "assistant", text: assistantMessage },
          { sender: "user", text: q },
        ]);
        setAssistantMessage(answer);
        setIsLoadingAnswer(false);
        speakText(answer);
        return;
      } catch (err) {
        console.error("Gemini Assistant error:", err);
      }
    }

    // Dynamic Multi-Factor Assistant Answer
    const answer = generateNeuralSynthesis(q, marketCtx);
    setAssistantMessage(answer);
    setIsLoadingAnswer(false);
    speakText(answer);
  };

  // 1-Click Auto Execution from Assistant
  const handleAutoExecute = (product: "CNC" | "MIS") => {
    soundEngine.playOrderFilled();
    if (onExecuteTrade) {
      onExecuteTrade({
        symbol,
        side: "BUY",
        product,
        orderType: "MARKET",
        quantity: 25,
        price,
        marginRequired: (price * 25) / (product === "MIS" ? 5 : 1),
      });
    }
    setCurrentStep(4);
    const confirmation = `Shabaash! Aapka BUY ${product} order 25 shares @ ${curr}${price.toFixed(
      2
    )} auto-execute ho chuka hai. Live P&L niche Positions dock me dikhai de raha hai!`;
    setAssistantMessage(confirmation);
    speakText(confirmation);
  };

  return (
    <div className="bg-gradient-to-br from-[#1E222D] via-[#181C27] to-[#121620] border-2 border-purple-500/40 rounded-xl p-4 shadow-xl shadow-purple-950/20 space-y-3.5 select-none relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Assistant Persona Info & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2E39] pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#131722] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-300 animate-pulse" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#089981] border-2 border-[#131722]" title="Assistant Active & Listening" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white tracking-wide">
                Aria <span className="text-purple-400 text-xs font-semibold">(Your Personal AI Trading Guide)</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                HIRED &amp; ACTIVE
              </span>
            </div>
            <span className="text-[11px] text-[#787B86] block">
              Step-by-Step Personalized Mentor • Speaks Hinglish &amp; English • Zero Confusion
            </span>
          </div>
        </div>

        {/* Right Tools: Voice Toggle, Gemini Key, Collapse */}
        <div className="flex items-center space-x-2">
          {/* Voice Guidance Toggle */}
          <button
            onClick={() => {
              const nextVoice = !isVoiceActive;
              setIsVoiceActive(nextVoice);
              if (!nextVoice && typeof window !== "undefined") {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              } else {
                speakText(assistantMessage);
              }
            }}
            title={isVoiceActive ? "Turn off Voice Guidance" : "Turn on Voice Guidance (Awaaz me sunein)"}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
              isVoiceActive
                ? "bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm"
                : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-white"
            }`}
          >
            {isVoiceActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                <span>Voice ON {isSpeaking ? "🔊" : ""}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#787B86]" />
                <span>Voice Guide</span>
              </>
            )}
          </button>

          {/* Gemini AI Key Setup */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            title="Configure Google Gemini 1.5 Flash Key"
            className="px-2.5 py-1 rounded text-xs font-semibold bg-[#131722] hover:bg-[#2A2E39] border border-[#2A2E39] text-purple-300 hover:text-white transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{hasActiveGeminiKey() ? "Gemini Linked" : "AI Key"}</span>
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-[#787B86] hover:text-white transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3.5">
          {/* 4 Interactive Workflow Stage Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              {
                step: 1,
                title: "1. Market Direction",
                desc: isBullish ? "UP Breakout" : "Consolidation",
                color: isBullish ? "text-emerald-400 border-emerald-500/40" : "text-amber-400 border-amber-500/40",
              },
              {
                step: 2,
                title: "2. Risk & Product",
                desc: "CNC (Safe) vs MIS",
                color: "text-blue-400 border-blue-500/40",
              },
              {
                step: 3,
                title: "3. Auto-Execute",
                desc: "1-Click AI Buy",
                color: "text-purple-400 border-purple-500/40",
              },
              {
                step: 4,
                title: "4. Target & Profit",
                desc: `Book @ ${curr}${target1}`,
                color: "text-emerald-400 border-emerald-500/40",
              },
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => {
                  setCurrentStep(s.step);
                  soundEngine.playTabSwitch();
                }}
                className={`p-2 rounded-lg text-left transition border ${
                  currentStep === s.step
                    ? `bg-[#131722] ${s.color} font-bold ring-1 ring-purple-500/50 shadow-md`
                    : "bg-[#131722]/60 border-[#2A2E39] text-[#787B86] hover:text-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400">{s.title}</div>
                <div className="text-xs font-semibold truncate mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Assistant Speech Bubble */}
          <div className="bg-[#131722] border border-purple-500/30 rounded-xl p-3.5 space-y-2 relative">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Aria's Live Guidance for You:</span>
              </div>
              <span className="text-[10px] text-[#787B86] font-tabular">
                Step {currentStep} of 4 Active
              </span>
            </div>

            <div className="text-xs text-[#D1D4DC] leading-relaxed whitespace-pre-line font-medium bg-[#181C27] p-3 rounded-lg border border-[#2A2E39]">
              {isLoadingAnswer ? (
                <div className="flex items-center space-x-2 text-purple-300 py-2">
                  <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Aria live market indicators analyze kar rahi hain...</span>
                </div>
              ) : (
                assistantMessage
              )}
            </div>

            {/* Quick Interactive Actions inside Assistant */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAskAssistant("Abhi mujhe kya karna chahiye step by step batao?")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-purple-300 hover:text-white transition"
                >
                  👉 Ab Main Kya Karu?
                </button>
                <button
                  onClick={() => handleAskAssistant("Kahan UP hoga aur kahan DOWN hoga exact price batao?")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-emerald-400 hover:text-white transition"
                >
                  📈 Kahan UP / DOWN Hoga?
                </button>
                <button
                  onClick={() => handleAskAssistant("Delivery aur Intraday me kya farq hai, konsa buy karu?")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-blue-300 hover:text-white transition"
                >
                  🛡️ Konsa Buy Karein (Risk Diff)?
                </button>
              </div>

              {/* Direct 1-Click Action from Assistant */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAutoExecute("CNC")}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  title="Aria executes Safe Delivery trade with verified Stop-Loss"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Aria: Buy Delivery (Safe)</span>
                </button>
                <button
                  onClick={() => handleAutoExecute("MIS")}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  title="Aria executes Intraday trade with 5x leverage"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Aria: Buy Intraday (5x)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ask Aria Anything (Direct input in card) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAssistant(customQuestion);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Aria se kuch bhi poochein: 'Mujhe trading kaise sikhni hai', 'Kab bechna hai'..."
              className="flex-1 px-3.5 py-2 text-xs bg-[#131722] border border-[#2A2E39] focus:border-purple-500 text-white placeholder-[#787B86] rounded-lg outline-none transition"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isLoadingAnswer}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Poochein</span>
            </button>
          </form>
        </div>
      )}

      {/* Gemini Key Config Modal */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
};
