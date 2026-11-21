"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Shield, Activity, Zap, ExternalLink, RefreshCw, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const BROKERS = [
  {
    id: "zerodha",
    name: "Zerodha Kite DMA",
    tagline: "India's largest institutional retail gateway",
    status: "CONNECTED",
    latency: "12ms",
    type: "Ultra-Low Latency DMA",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "upstox",
    name: "Upstox Pro HFT",
    tagline: "High-frequency API gateway with co-location routing",
    status: "READY",
    latency: "18ms",
    type: "Smart Order Routing",
    color: "from-purple-500 to-indigo-700",
  },
  {
    id: "angel",
    name: "Angel One SmartAPI",
    tagline: "Automated algorithmic trading execution engine",
    status: "READY",
    latency: "24ms",
    type: "Full-Service DMA",
    color: "from-red-500 to-orange-600",
  },
  {
    id: "groww",
    name: "Groww Direct API",
    tagline: "Simplified direct execution pipeline",
    status: "STANDBY",
    latency: "35ms",
    type: "Standard Retail Gateway",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "icici",
    name: "ICICI Direct Breeze",
    tagline: "Banking integrated institutional execution",
    status: "STANDBY",
    latency: "42ms",
    type: "Institutional Multi-Leg",
    color: "from-amber-500 to-orange-700",
  },
];

export default function BrokerGatewayModal({ open, onClose }: Props) {
  const [activeBroker, setActiveBroker] = useState("zerodha");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tradex_active_broker") || "zerodha";
      setActiveBroker(saved);
    }
  }, [open]);

  if (!open) return null;

  const handleSelect = (id: string) => {
    setActiveBroker(id);
    localStorage.setItem("tradex_active_broker", id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/12 bg-[#0e121a] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-cyan-700 text-black shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Direct Market Access (DMA) Gateway</h2>
              <p className="text-[11.5px] text-white/50">Simulated Indian Exchange execution conduit for NSE/BSE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Broker List */}
        <div className="mt-5 space-y-2.5">
          {BROKERS.map((b) => {
            const isSelected = activeBroker === b.id;
            return (
              <div
                key={b.id}
                onClick={() => handleSelect(b.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                  isSelected
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                    : "border-white/8 bg-white/2 hover:border-white/20 hover:bg-white/4"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${b.color} text-white font-bold text-xs shadow-md`}>
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-white">{b.name}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white/70">
                        {b.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40">{b.tagline}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-emerald-400">{b.latency}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-white/50">
                    {isSelected ? "PRIMARY ROUTE" : b.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security badge */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/8 bg-white/2 p-3 text-[11px] text-white/50">
          <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Paper execution routes mimic real exchange order book ticks with zero capital risk.</span>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-white/8 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-[12px] font-bold text-black transition hover:bg-emerald-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
