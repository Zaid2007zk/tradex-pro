"use client";

import { Activity, Clock, ShieldCheck, Wifi } from "lucide-react";
import { useMarketStatus } from "@/hooks/use-market";

export default function StatusBar({ fps }: { fps: number }) {
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
      <span className="ml-auto flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {marketStatus.istTime}
      </span>
    </footer>
  );
}
