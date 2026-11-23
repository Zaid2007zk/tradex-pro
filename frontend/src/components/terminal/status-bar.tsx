"use client";

import { Activity, BrainCircuit, Clock, ShieldCheck, Wifi } from "lucide-react";
import { useMarketStatus } from "@/hooks/use-market";

export default function StatusBar({ fps, onOpenAiCore }: { fps: number; onOpenAiCore?: () => void }) {
  const marketStatus = useMarketStatus();

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-white/8 bg-[#0d1016]/90 px-4 font-mono text-[10px] text-white/45 backdrop-blur">
      <span className={`flex items-center gap-1.5 font-semibold ${marketStatus.isOpen ? "text-emerald-400" : "text-amber-400"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${marketStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
        {marketStatus.label}
      </span>
      <span className="hidden sm:flex items-center gap-1.5 text-white/40">
        BSE · {marketStatus.isOpen ? "OPEN" : "OFFICIAL CLOSE"}
      </span>
      <span className="hidden items-center gap-1 sm:flex">
        <Wifi className="h-3 w-3 text-emerald-400/80" /> 12ms
      </span>
      <span className="hidden items-center gap-1 md:flex">
        <Activity className="h-3 w-3" /> {fps} fps · feed live
      </span>
      <span className="hidden items-center gap-1 md:flex">
        <ShieldCheck className="h-3 w-3 text-amber-400/80" /> Paper trading session
      </span>
      <div className="ml-auto flex items-center gap-3">
        {onOpenAiCore && (
          <button
            onClick={onOpenAiCore}
            className="flex items-center gap-1.5 rounded border border-purple-500/35 bg-purple-500/15 px-2 py-0.5 text-[9.5px] font-bold text-purple-200 transition hover:bg-purple-500/25 active:scale-95"
            title="Toggle ARIA AI Core"
          >
            <BrainCircuit className="h-3 w-3 text-purple-300" />
            <span>AI CORE</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </button>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {marketStatus.istTime}
        </span>
      </div>
    </footer>
  );
}
