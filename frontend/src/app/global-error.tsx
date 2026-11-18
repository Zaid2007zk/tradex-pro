"use client";

import React, { useEffect } from "react";
import { RotateCcw, ShieldCheck, TrendingUp } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TradeX Global Exception caught:", error);
  }, [error]);

  const handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    reset();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden font-sans">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[#0D111A]/95 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_25px_rgba(59,130,246,0.25)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0D15] rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              <span>TradeX Pro Terminal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Terminal Auto-Recovery
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Workspace state discrepancy detected. TradeX institutional guard is ready to restore your workspace with zero loss.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore &amp; Enter Terminal →</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional State Guard Active</span>
          </div>
        </div>
      </body>
    </html>
  );
}
