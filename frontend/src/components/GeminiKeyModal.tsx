"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Shield,
  Cpu,
  Zap,
  Flame,
  Check,
} from "lucide-react";
import {
  AIProvider,
  getActiveAIProvider,
  setActiveAIProvider,
  getStoredGroqKey,
  setStoredGroqKey,
  getStoredGroqModel,
  setStoredGroqModel,
  hasActiveGroqKey,
  verifyAndTestGroqModel,
  GROQ_MODELS,
  getStoredGeminiKey,
  setStoredGeminiKey,
  getStoredGeminiModel,
  hasActiveGeminiKey,
  verifyAndDiscoverGeminiModel,
} from "@/services/geminiAiService";

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [providerTab, setProviderTab] = useState<AIProvider>("groq");
  
  // Groq State
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  
  // Gemini State
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setProviderTab(getActiveAIProvider());
      setGroqKey(getStoredGroqKey());
      setGroqModel(getStoredGroqModel());
      setGeminiKey(getStoredGeminiKey());
      setGeminiModel(getStoredGeminiModel());

      const active = getActiveAIProvider();
      if (active === "groq" && hasActiveGroqKey()) {
        setStatus("success");
        setStatusMsg(`Groq Cloud (${getStoredGroqModel()}) is active and armed.`);
      } else if (active === "gemini" && hasActiveGeminiKey()) {
        setStatus("success");
        setStatusMsg(`Google Gemini (${getStoredGeminiModel()}) is active and armed.`);
      } else if (active === "autonomous") {
        setStatus("success");
        setStatusMsg("TradeX Autonomous Conversational Engine is active.");
      } else {
        setStatus("idle");
        setStatusMsg("");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGroq = async () => {
    if (!groqKey.trim()) {
      setStoredGroqKey("");
      setActiveAIProvider("autonomous");
      setStatus("idle");
      setStatusMsg("Groq key cleared. Reverted to TradeX Autonomous Engine.");
      if (onKeyUpdated) onKeyUpdated();
      return;
    }

    setStatus("testing");
    setStatusMsg(`Testing Groq API connection with ${groqModel}...`);

    const res = await verifyAndTestGroqModel(groqKey.trim(), groqModel);
    if (res.success) {
      setGroqModel(res.model);
      setStatus("success");
      setStatusMsg(res.message);
      setActiveAIProvider("groq");
      if (onKeyUpdated) onKeyUpdated();
      setTimeout(() => onClose(), 1200);
    } else {
      setStatus("error");
      setStatusMsg(res.message);
    }
  };

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) {
      setStoredGeminiKey("");
      setActiveAIProvider("autonomous");
      setStatus("idle");
      setStatusMsg("Gemini key cleared. Reverted to TradeX Autonomous Engine.");
      if (onKeyUpdated) onKeyUpdated();
      return;
    }

    setStatus("testing");
    setStatusMsg("Discovering supported Gemini model and validating key...");

    const res = await verifyAndDiscoverGeminiModel(geminiKey.trim());
    if (res.success) {
      setGeminiModel(res.model);
      setStatus("success");
      setStatusMsg(res.message);
      setActiveAIProvider("gemini");
      if (onKeyUpdated) onKeyUpdated();
      setTimeout(() => onClose(), 1200);
    } else {
      setStatus("error");
      setStatusMsg(res.message);
    }
  };

  const handleActivateAutonomous = () => {
    setActiveAIProvider("autonomous");
    setStatus("success");
    setStatusMsg("TradeX Autonomous Multi-Factor Engine active. No API keys required.");
    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121622] border border-[#212738] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#171B26] via-[#121622] to-[#121622] border-b border-[#212738] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>TradeX Universal AI Engine Settings</span>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                  Ultra-Fast
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure Groq, Google Gemini, or Built-in Autonomous Financial Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Switcher Tabs */}
        <div className="flex border-b border-[#212738] bg-[#0A0D15] p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setProviderTab("groq");
              setStatus("idle");
              setStatusMsg("");
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              providerTab === "groq"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Groq Cloud (Recommended)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProviderTab("gemini");
              setStatus("idle");
              setStatusMsg("");
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              providerTab === "gemini"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Google Gemini</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProviderTab("autonomous");
              setStatus("idle");
              setStatusMsg("");
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              providerTab === "autonomous"
                ? "bg-emerald-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Free Auto AI</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* TAB 1: GROQ CLOUD */}
          {providerTab === "groq" && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#0B0E17] border border-[#212738] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Groq LPU™ Ultra-Low Latency Inference</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    &lt;400ms Speed
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Groq provides instant LLaMA 3.3 70B responses with human-grade Hinglish/English reasoning. Free API keys have high limits.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>Groq API Key</span>
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold underline"
                  >
                    <span>Get Free Groq Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder:text-slate-600 font-mono transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Select Groq Model</label>
                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07090F] border border-[#212738] text-white focus:border-blue-500 focus:outline-none text-xs"
                >
                  {GROQ_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE GEMINI */}
          {providerTab === "gemini" && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#0B0E17] border border-[#212738] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Google Gemini Generative AI</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                    Gemini 2.0 / 1.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Connect your Google AI Studio API key to activate multimodal financial intelligence and dynamic model discovery.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>Google Gemini API Key</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold underline"
                  >
                    <span>Get Free Gemini Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder:text-slate-600 font-mono transition"
                />
              </div>
            </div>
          )}

          {/* TAB 3: AUTONOMOUS ZERO-KEY MODE */}
          {providerTab === "autonomous" && (
            <div className="p-4 rounded-xl bg-[#0B0E17] border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Zero-Key Autonomous AI Mode (Ready for Presentation)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                No external API keys required! TradeX Pro's built-in conversational neural engine will answer all trading queries dynamically in natural Hinglish or English using live mathematical market telemetry.
              </p>
              <button
                type="button"
                onClick={handleActivateAutonomous}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Activate Free Autonomous AI Now</span>
              </button>
            </div>
          )}

          {/* Status Feedback Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                status === "success"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : status === "error"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : status === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              )}
              <span className="leading-snug">{statusMsg}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>API keys are stored strictly in client localStorage; never transmitted to external databases.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#212738] bg-[#0A0D15] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>

          {providerTab === "groq" && (
            <button
              type="button"
              onClick={handleSaveGroq}
              disabled={status === "testing"}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>{status === "testing" ? "Testing Groq..." : "Save & Activate Groq AI"}</span>
            </button>
          )}

          {providerTab === "gemini" && (
            <button
              type="button"
              onClick={handleSaveGemini}
              disabled={status === "testing"}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{status === "testing" ? "Discovering..." : "Save & Activate Gemini"}</span>
            </button>
          )}

          {providerTab === "autonomous" && (
            <span className="text-[11px] text-emerald-400 font-bold">100% Armed &amp; Ready</span>
          )}
        </div>
      </div>
    </div>
  );
};
