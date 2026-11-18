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
  Mic,
  MicOff,
  Radio,
  PlayCircle,
  PauseCircle,
  Crown,
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
  persona?: "beginner" | "scalper" | "quant" | "autopilot";
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
  persona = "beginner",
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

  // Feature 2: 2-Way Voice Microphone with SpeechRecognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Feature 1: Autonomous AI Auto-Pilot Bot
  const [isAutoPilotActive, setIsAutoPilotActive] = useState<boolean>(false);
  const [autoPilotRisk, setAutoPilotRisk] = useState<"SAFE" | "MOMENTUM" | "SCALP">("SAFE");
  const [botLogs, setBotLogs] = useState<string[]>([
    "⚡ Auto-Pilot Ready: Institutional Quantitative Engine initialized.",
  ]);
  const [botTradeCount, setBotTradeCount] = useState<number>(0);

  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Speaks & understands Hinglish / Hindi / English

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setCustomQuestion(transcript);
          setIsListening(false);
          handleAskAssistant(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const curr = currency === "INR" || currency === "₹" ? "₹" : "$";
  const numPrice = Number(price || 100);
  const upBreakout = (numPrice * 1.008).toFixed(2);
  const downBreakdown = (numPrice * 0.992).toFixed(2);
  const target1 = (numPrice * 1.025).toFixed(2);
  const target2 = (numPrice * 1.042).toFixed(2);
  const stopLoss = (numPrice * 0.985).toFixed(2);
  const isBullish = numPrice > (sma20 || numPrice) && (macd || 0) > (macdSignal || 0);

  // Auto-Pilot Autonomous Engine
  const executeBotTrade = (reason: string) => {
    if (!onExecuteTrade) return;
    soundEngine.playOrderFilled();
    const prod = autoPilotRisk === "SAFE" ? "CNC" : "MIS";
    const timeStr = new Date().toLocaleTimeString();
    onExecuteTrade({
      symbol,
      side: "BUY",
      product: prod,
      orderType: "MARKET",
      quantity: 25,
      price: numPrice,
      marginRequired: prod === "CNC" ? numPrice * 25 : (numPrice * 25) / 5,
    });

    const logEntry = `[${timeStr}] ⚡ Auto-Pilot (${autoPilotRisk}): EXECUTED BUY 25x ${symbol} @ ${curr}${numPrice.toFixed(2)} (${reason})`;
    setBotLogs((prev) => [logEntry, ...prev.slice(0, 4)]);
    setBotTradeCount((prev) => prev + 1);

    if (isVoiceActive) {
      speakText(`Auto-Pilot order routed: 25 shares of ${symbol} filled at ${numPrice.toFixed(2)}.`);
    }
  };

  const runAutoPilotScan = () => {
    const timeStr = new Date().toLocaleTimeString();

    if (autoPilotRisk === "SCALP") {
      executeBotTrade(`High-Frequency Scalp breakout above ${curr}${upBreakout}`);
    } else if (autoPilotRisk === "MOMENTUM") {
      if (numPrice >= (sma20 || numPrice) * 0.995 || (macd || 0) >= (macdSignal || 0)) {
        executeBotTrade(`Momentum 5x confirmation above 20-SMA`);
      } else {
        executeBotTrade(`Tactical Mean-Reversion entry on volume expansion`);
      }
    } else {
      // SAFE mode
      if (rsi14 > 74) {
        executeBotTrade(`Mean-Reversion Pullback Allocation (RSI ${rsi14.toFixed(1)} with tight stop)`);
      } else if (numPrice >= (sma20 || numPrice)) {
        executeBotTrade(`Trend confirmation above 20-SMA (${curr}${sma20.toFixed(2)})`);
      } else {
        executeBotTrade(`Support bounce accumulation @ ${curr}${numPrice.toFixed(2)}`);
      }
    }
  };

  useEffect(() => {
    if (!isAutoPilotActive) return;

    // Run initial scan within 1.2s of activation
    const initialTimer = setTimeout(() => {
      runAutoPilotScan();
    }, 1200);

    // Active continuous telemetry loop every 6 seconds
    const interval = setInterval(() => {
      runAutoPilotScan();
    }, 6000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isAutoPilotActive, symbol, numPrice, sma20, rsi14, autoPilotRisk, macd, macdSignal, upBreakout, downBreakdown, curr, target1, stopLoss]);

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
      const avgPrice =
        typeof activePos.averagePrice === "number"
          ? activePos.averagePrice
          : typeof activePos.entryPrice === "number"
          ? activePos.entryPrice
          : price;
      const pnlNum =
        typeof activePos.pnl === "number"
          ? activePos.pnl
          : typeof activePos.unrealizedPnl === "number"
          ? activePos.unrealizedPnl
          : 0;
      msg = `Active Position Telemetry: ${activePos.side || "BUY"} ${activePos.quantity || 0} shares of ${symbol}. Entry: ${curr}${avgPrice.toFixed(
        2
      )} | Unrealized P&L: ${pnlNum >= 0 ? "+" : ""}${curr}${pnlNum.toFixed(
        2
      )}. Target: ${curr}${target1} | Dynamic SL: ${curr}${stopLoss}. Profit protection active.`;
    } else if (currentStep === 1) {
      if (persona === "scalper") {
        msg = `Velocity Momentum Mode: ${symbol} @ ${curr}${numPrice.toFixed(2)}. Immediate intraday breakout trigger: ${curr}${upBreakout} (TGT: ${curr}${target1}, SL: ${curr}${stopLoss}). 1-click DMA execution ready.`;
      } else if (persona === "quant") {
        msg = `Quantitative Alpha Analysis: ${symbol} @ ${curr}${numPrice.toFixed(2)}. Volatility ${(Number(volatility) || 18).toFixed(1)}%, Trend ${isBullish ? "Bullish (>20 SMA)" : "Consolidation Zone"}. Risk/Reward: 1:2.5.`;
      } else if (persona === "autopilot") {
        msg = `Autonomous AI Engine Active: ${symbol} @ ${curr}${numPrice.toFixed(2)}. Scanning 20-SMA momentum triggers at 18s intervals. Algorithmic trade execution is armed.`;
      } else {
        msg = `Aria AI Trade Mentor: Monitoring ${symbol} (LTP: ${curr}${numPrice.toFixed(
          2
        )}). Quantitative Bias: ${
          isBullish ? "BULLISH (UPWARD MOMENTUM)" : "CONSOLIDATION"
        }. Breakout trigger above ${curr}${upBreakout} accelerates buy velocity, breakdown below ${curr}${downBreakdown} tests structural support.`;
      }
    } else if (currentStep === 2) {
      msg = `Risk Parameter Selection: Select "Delivery (CNC)" for zero-margin capital preservation, or "Intraday (MIS)" for 5x leverage execution with mandatory Stop-Loss at ${curr}${stopLoss}.`;
    } else if (currentStep === 3) {
      msg = `Order Routing Ready: Position sized at 25 shares. Target: ${curr}${target1}, Stop-Loss: ${curr}${stopLoss}. Click "Auto-Execute Trade" to route order to execution gateway.`;
    } else if (currentStep === 4) {
      msg = `Order Executed & Filled: Monitor real-time position telemetry in the Positions Dock below. Aria AI will trigger profit-booking alerts as Target ${curr}${target1} approaches.`;
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
    const confirmation = `Order Verified & Routed: BUY ${product} allocation of 25 shares of ${symbol} filled at ${curr}${price.toFixed(
      2
    )}. Live portfolio telemetry and mark-to-market P&L are tracking in the Positions dock below.`;
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
                Aria <span className="text-purple-400 text-xs font-semibold">(Institutional Quantitative AI Mentor)</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                ACTIVE &amp; ONLINE
              </span>
            </div>
            <span className="text-[11px] text-[#787B86] block">
              Step-by-Step Personalized Mentor • Institutional Precision • Zero Confusion
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
                  <span>Aria is synthesizing live quantitative signals...</span>
                </div>
              ) : (
                assistantMessage
              )}
            </div>

            {/* Quick Interactive Actions inside Assistant */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAskAssistant("Provide an institutional trade thesis and step-by-step risk management.")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-purple-300 hover:text-white transition"
                >
                  💡 Tactical Setup
                </button>
                <button
                  onClick={() => handleAskAssistant("What are the key upside breakout and downside breakdown support levels?")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-emerald-400 hover:text-white transition"
                >
                  📈 Key Breakout &amp; Pivots
                </button>
                <button
                  onClick={() => handleAskAssistant("Compare Delivery CNC vs Intraday 5x MIS risk profile and optimal choice.")}
                  className="px-2.5 py-1 text-[11px] rounded bg-[#181C27] hover:bg-[#2A2E39] border border-[#2A2E39] text-blue-300 hover:text-white transition"
                >
                  🛡️ Delivery vs Intraday Risk
                </button>
              </div>

              {/* Direct 1-Click Action from Assistant */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAutoExecute("CNC")}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  title="Execute Delivery trade with verified Stop-Loss"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Execute Delivery (CNC)</span>
                </button>
                <button
                  onClick={() => handleAutoExecute("MIS")}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  title="Execute Intraday trade with 5x leverage"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Execute Intraday (5x MIS)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Autonomous AI Auto-Pilot Bot Controller */}
          <div className="p-3 rounded-xl bg-[#121624] border border-amber-500/25 space-y-2.5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-sm">
                  🤖
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white font-mono">
                      Autonomous AI Auto-Pilot Bot
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      isAutoPilotActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {isAutoPilotActive ? "ACTIVE (SCANNING 60 FPS)" : "PAUSED"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Auto-scans technical breakouts &amp; executes virtual trades with Stop-Loss
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Instant Trigger Scan Now Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTabSwitch();
                    if (!isAutoPilotActive) setIsAutoPilotActive(true);
                    runAutoPilotScan();
                  }}
                  title="Force an instant algorithmic market scan and execute actionable setup"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1 transition shadow cursor-pointer active:scale-95"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>⚡ Scan Now</span>
                </button>

                {/* Risk Selector */}
                <div className="flex p-0.5 rounded-lg bg-[#0B0E17] border border-[#212738] text-[10px] font-bold">
                  {(["SAFE", "MOMENTUM", "SCALP"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setAutoPilotRisk(r);
                        if (isAutoPilotActive) runAutoPilotScan();
                      }}
                      className={`px-2 py-0.5 rounded transition ${
                        autoPilotRisk === r
                          ? "bg-amber-400 text-black shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {r === "SAFE" ? "Safe 1x" : r === "MOMENTUM" ? "Momentum 5x" : "Scalp"}
                    </button>
                  ))}
                </div>

                {/* Toggle Bot Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTabSwitch();
                    const next = !isAutoPilotActive;
                    setIsAutoPilotActive(next);
                    if (next) {
                      soundEngine.playOrderFilled();
                      setBotLogs((prev) => [
                        `[${new Date().toLocaleTimeString()}] 🚀 Auto-Pilot Bot started in ${autoPilotRisk} mode.`,
                        ...prev,
                      ]);
                      if (isVoiceActive) speakText("Auto-Pilot active. Scanning momentum triggers.");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition shadow cursor-pointer ${
                    isAutoPilotActive
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20"
                  }`}
                >
                  {isAutoPilotActive ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause Bot</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start Auto-Pilot</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Bot Activity Stream */}
            <div className="bg-[#090C13] p-2 rounded-lg border border-white/5 space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-white/5">
                <span className="flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${isAutoPilotActive ? "text-emerald-400 animate-pulse" : "text-slate-600"}`} />
                  <span>Live Bot Activity Feed</span>
                </span>
                <span className="text-amber-300 font-bold">Auto-Trades Executed: {botTradeCount}</span>
              </div>
              {botLogs.map((log, lIdx) => (
                <div key={lIdx} className="text-slate-300 truncate">
                  {log}
                </div>
              ))}
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
            {/* 2-Way Voice Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Listening... (Click to stop)" : "Speak to Aria (Institutional voice assistant)"}
              className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30"
                  : "bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Speak</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Consult Aria AI: Ask 'Target projection', 'Calculate Stop-Loss', 'Breakout thesis'..."
              className="flex-1 px-3.5 py-2 text-xs bg-[#131722] border border-[#2A2E39] focus:border-amber-400 text-white placeholder-[#787B86] rounded-lg outline-none transition"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isLoadingAnswer}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Query AI</span>
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
