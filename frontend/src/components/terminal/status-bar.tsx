"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, ShieldCheck, Wifi } from "lucide-react";

export default function StatusBar({ fps }: { fps: number }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-white/8 bg-[#0d1016]/90 px-4 font-mono text-[10px] text-white/45 backdrop-blur">
      <span className="flex items-center gap-1.5">
        <span className="tx-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
        NSE · OPEN
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        BSE · CLOSED
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
        {now ? now.toLocaleTimeString("en-IN", { hour12: false }) : "--:--:--"} IST
      </span>
    </footer>
  );
}
