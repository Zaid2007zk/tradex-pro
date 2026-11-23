"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle, AlertCircle } from "lucide-react";
import { STOCKS, INDICES, fmtPct, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  onExecuteOrder: (o: { symbol: string; side: "BUY" | "SELL"; qty: number; price: number; type: "MARKET"; product: "MIS" }) => void;
  onOpenAiCore: () => void;
  quotes: Record<string, Quote>;
  currentSymbol: string;
};

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  onSelectSymbol,
  onExecuteOrder,
  onOpenAiCore,
  quotes,
  currentSymbol,
}: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "success" | "error">("idle");
  const recognitionRef = useRef<any>(null);

  // Speak response using Web Speech Synthesis with fallback
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(rawText);

    // 1. Market Summary Command
    if (/summary|market kaisa|kya chal raha|overview|haal/i.test(text)) {
      const nifty = INDICES[0];
      const sensex = INDICES[1];
      const relQuote = quotes["RELIANCE"]?.price ?? 1351;
      const resp = `Market Update: Nifty is trading around ${nifty?.base ?? 25350}. Reliance is at ₹${fmtPrice(relQuote)}. Momentum is positive.`;
      setResponse(resp);
      setStatus("success");
      speak(resp);
      return;
    }

    // 2. Open AI Core Command
    if (/ai core|copilot|open ai|chat|aria/i.test(text)) {
      onOpenAiCore();
      const resp = "Opening ARIA AI Core Hub.";
      setResponse(resp);
      setStatus("success");
      speak(resp);
      setTimeout(() => onClose(), 1200);
      return;
    }

    // 3. Buy Order Command (e.g. "Buy 10 Tata Motors", "Khareedo")
    if (/\b(buy|khareedo|kharid|purchase)\b/i.test(text)) {
      let targetSym = currentSymbol;
      for (const s of STOCKS) {
        if (new RegExp(`\\b${s.symbol.toLowerCase()}\\b|\\b${s.name.toLowerCase().split(" ")[0]}\\b`, "i").test(text)) {
          targetSym = s.symbol;
          break;
        }
      }
      const qtyMatch = text.match(/\b(\d+)\b/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
      const px = quotes[targetSym]?.price ?? STOCKS.find((s) => s.symbol === targetSym)?.base ?? 1000;

      onExecuteOrder({
        symbol: targetSym,
        side: "BUY",
        qty,
        price: px,
        type: "MARKET",
        product: "MIS",
      });

      const resp = `Buy order executed: ${qty} shares of ${targetSym} at ₹${fmtPrice(px)}.`;
      setResponse(resp);
      setStatus("success");
      speak(resp);
      setTimeout(() => onClose(), 1500);
      return;
    }

    // 4. Sell Order Command (e.g. "Sell 10 Reliance", "Becho")
    if (/\b(sell|becho|bech)\b/i.test(text)) {
      let targetSym = currentSymbol;
      for (const s of STOCKS) {
        if (new RegExp(`\\b${s.symbol.toLowerCase()}\\b|\\b${s.name.toLowerCase().split(" ")[0]}\\b`, "i").test(text)) {
          targetSym = s.symbol;
          break;
        }
      }
      const qtyMatch = text.match(/\b(\d+)\b/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
      const px = quotes[targetSym]?.price ?? STOCKS.find((s) => s.symbol === targetSym)?.base ?? 1000;

      onExecuteOrder({
        symbol: targetSym,
        side: "SELL",
        qty,
        price: px,
        type: "MARKET",
        product: "MIS",
      });

      const resp = `Sell order executed: ${qty} shares of ${targetSym} at ₹${fmtPrice(px)}.`;
      setResponse(resp);
      setStatus("success");
      speak(resp);
      setTimeout(() => onClose(), 1500);
      return;
    }

    // 5. Select Stock Symbol (e.g. "Reliance", "Tata Motors kholo", "Apple", "Nvidia")
    for (const s of STOCKS) {
      const firstWord = s.name.toLowerCase().split(" ")[0];
      if (
        text.includes(s.symbol.toLowerCase()) ||
        (firstWord.length > 2 && text.includes(firstWord))
      ) {
        onSelectSymbol(s.symbol);
        const resp = `Switched to ${s.name} (${s.symbol}). Live price is ₹${fmtPrice(quotes[s.symbol]?.price ?? s.base)}.`;
        setResponse(resp);
        setStatus("success");
        speak(resp);
        setTimeout(() => onClose(), 1400);
        return;
      }
    }

    setResponse("Command not recognized. Try saying 'Reliance kholo', 'Buy 10 TCS', or 'Market summary'.");
    setStatus("error");
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("error");
      setResponse("Speech recognition not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
        setStatus("listening");
        setTranscript("");
        setResponse("");
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        processCommand(speechResult);
      };

      recognition.onerror = () => {
        setListening(false);
        setStatus("error");
        setResponse("Could not hear clearly. Please try speaking again.");
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setStatus("error");
      setResponse("Microphone access error. Please grant mic permission.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => stopListening();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-purple-500/35 bg-[#0e121a] p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>TradeX Voice AI</span>
              <span className="rounded bg-purple-500/25 px-1.5 py-0.2 font-mono text-[9px] text-purple-300">
                LIVE
              </span>
            </h2>
            <p className="text-[11px] text-white/45">Speech-to-Trade & Market Voice Assistant</p>
          </div>
        </div>

        {/* Big Mic Button with Pulsing Animation */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={listening ? stopListening : startListening}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 shadow-2xl ${
              listening
                ? "bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-purple-500/50 scale-105"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 rounded-full bg-purple-500 opacity-40 animate-ping" />
            )}
            {listening ? <Mic className="h-10 w-10 animate-bounce" /> : <MicOff className="h-10 w-10" />}
          </button>
          <div className="mt-4 font-mono text-[12px] font-bold">
            {listening ? (
              <span className="text-purple-300 animate-pulse">Listening... बोलिए</span>
            ) : (
              <span className="text-white/50">Tap mic to speak</span>
            )}
          </div>
        </div>

        {/* Live Transcript / Result */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 mb-4 min-h-[72px] flex flex-col justify-center">
          {transcript ? (
            <div className="text-[12px] font-medium text-white/90">
              <span className="text-white/40 mr-1.5">You said:</span> "{transcript}"
            </div>
          ) : (
            <div className="text-[11px] text-white/35 text-center italic">
              Try: "Tata Motors kholo", "Buy 10 Reliance", "Market summary", "AI Core kholo"
            </div>
          )}

          {response && (
            <div className={`mt-2 text-[12px] font-semibold flex items-start gap-1.5 ${
              status === "success" ? "text-emerald-400" : "text-amber-300"
            }`}>
              {status === "success" ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span>{response}</span>
            </div>
          )}
        </div>

        {/* Quick Voice Hints */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {[
            "Reliance kholo",
            "Buy 10 TCS",
            "Market summary",
            "AI Core",
          ].map((hint) => (
            <button
              key={hint}
              onClick={() => processCommand(hint)}
              className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[10px] text-white/60 hover:border-purple-500/40 hover:text-purple-300 transition"
            >
              "{hint}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
