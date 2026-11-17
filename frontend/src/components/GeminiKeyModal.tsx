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
} from "lucide-react";
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  hasActiveGeminiKey,
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
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiKey());
      setStatus(hasActiveGeminiKey() ? "success" : "idle");
      setStatusMsg(hasActiveGeminiKey() ? "Gemini Generative AI is active" : "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setStoredGeminiKey("");
      setStatus("idle");
      setStatusMsg("Cleared. Falling back to TradeX Autonomous Neural Engine.");
      if (onKeyUpdated) onKeyUpdated();
      return;
    }

    setStatus("testing");
    setStatusMsg("Testing connection with Google Gemini...");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with 'OK'" }] }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      setStoredGeminiKey(apiKey.trim());
      setStatus("success");
      setStatusMsg("Connected! TradeX Pro is now running 100% Google Gemini Generative AI.");
      if (onKeyUpdated) onKeyUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(e.message || "Failed to verify key. Check permissions.");
    }
  };

  const handleRemove = () => {
    setStoredGeminiKey("");
    setApiKey("");
    setStatus("idle");
    setStatusMsg("Key removed. Switched to TradeX Autonomous Neural Engine.");
    if (onKeyUpdated) onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#171B26] via-[#1E222D] to-[#1E222D] border-b border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2962FF] to-[#7B1FA2] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Connect Google Gemini Generative AI</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                  Live LLM
                </span>
              </h3>
              <p className="text-[11px] text-[#787B86]">
                Make TradeX Pro 100% AI-Powered with natural conversational reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[#131722] border border-[#2A2E39] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Active AI Engine</span>
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  status === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {status === "success" ? "Google Gemini 1.5 Flash (Active)" : "TradeX Neural Engine (Autonomous)"}
              </span>
            </div>
            <p className="text-[11px] text-[#787B86] leading-relaxed">
              Google Gemini API se connect karke aap kisi bhi bhasha (Hindi, Hinglish, English) mein natural baat kar sakte hain. Free Google AI Studio API key 100% free hai.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D1D4DC] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini API Key</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <span>Get Free Key (Google AI Studio)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              placeholder="Paste your Gemini API key (starts with AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#131722] border border-[#2A2E39] focus:border-[#2962FF] rounded-lg px-3 py-2 text-xs text-white placeholder-[#787B86] outline-none transition font-mono"
            />
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                status === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : status === "error"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {status === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {status === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
              {status === "testing" && <Zap className="w-4 h-4 shrink-0 animate-spin" />}
              <span className="leading-tight">{statusMsg}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[10px] text-[#787B86] pt-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Aapki API key aapke hi browser (localStorage) mein secure rehti hai. Kisi server par save nahi hoti.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131722] border-t border-[#2A2E39] flex items-center justify-between gap-2">
          {hasActiveGeminiKey() ? (
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
            >
              Disconnect Key
            </button>
          ) : (
            <span className="text-[11px] text-[#787B86]">No key needed for autonomous mode</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#2A2E39] hover:bg-[#3E4452] text-xs font-semibold text-white transition"
            >
              Close
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={status === "testing"}
              className="px-4 py-1.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {status === "testing" ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save &amp; Activate AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
