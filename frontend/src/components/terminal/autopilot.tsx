"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CircleStop, Loader2, Radar, ShieldAlert, Zap } from "lucide-react";
import type { Position } from "./order-ticket";
import type { Quote } from "@/hooks/use-market";
import { fmtINR } from "@/lib/market/engine";

type Idea = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  product: "MIS" | "CNC" | "MTF";
  entry: number;
  target: number;
  stop: number;
  confidence: number;
  thesis: string;
};

type AutoTrade = {
  id: string;
  ts: number;
  idea: Idea;
  pnl: number;
};

const SCAN_INTERVAL_MS = 75_000;
const MAX_SESSION_TRADES = 12;

export default function Autopilot({
  quotes,
  positions,
  onExecute,
}: {
  quotes: Record<string, Quote>;
  positions: Position[];
  onExecute: (o: { symbol: string; side: "BUY" | "SELL"; qty: number; price: number; type: "LIMIT"; product: "MIS" | "CNC" | "MTF" }) => void;
}) {
  const [running, setRunning] = useState(false);
  const [threshold, setThreshold] = useState(72);
  const [maxOpen, setMaxOpen] = useState(4);
  const [trades, setTrades] = useState<AutoTrade[]>([]);
  const [skipped, setSkipped] = useState<{ symbol: string; reason: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const busy = useRef(false);
  const runningRef = useRef(false);
  const tradesRef = useRef<AutoTrade[]>([]);

  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  const hunt = useCallback(async () => {
    if (busy.current || !runningRef.current) return;
    busy.current = true;
    setScanning(true);
    try {
      const prices = Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, v.price]));
      const res = await fetch("/api/ai-core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "ideas", prices }),
      });
      const data = (await res.json()) as { ok: boolean; ideas?: Idea[] };
      if (!runningRef.current) return;
      if (!data.ok || !data.ideas) return;

      const sessionCount = tradesRef.current.length;
      if (sessionCount >= MAX_SESSION_TRADES) {
        setRunning(false);
        runningRef.current = false;
        return;
      }

      const skippedLocal: { symbol: string; reason: string }[] = [];
      let openAuto = tradesRef.current.length;
      for (const idea of [...(data.ideas ?? [])].sort((a, b) => b.confidence - a.confidence)) {
        if (!quotes[idea.symbol]) continue;
        if (idea.confidence < threshold) {
          skippedLocal.push({ symbol: idea.symbol, reason: `confidence ${Math.round(idea.confidence)}% < ${threshold}%` });
          continue;
        }
        if (openAuto >= maxOpen) {
          skippedLocal.push({ symbol: idea.symbol, reason: `max open auto positions (${maxOpen})` });
          continue;
        }
        if (tradesRef.current.some((t) => t.idea.symbol === idea.symbol && t.idea.side === idea.side)) {
          skippedLocal.push({ symbol: idea.symbol, reason: "already in auto book" });
          continue;
        }
        if (positions.some((p) => p.symbol === idea.symbol && p.side === idea.side)) {
          skippedLocal.push({ symbol: idea.symbol, reason: "manual position exists" });
          continue;
        }
        if (tradesRef.current.length >= MAX_SESSION_TRADES) break;

        const qty = Math.max(1, Math.round(idea.qty));
        const px = Number.isFinite(idea.entry) && idea.entry > 0 ? idea.entry : quotes[idea.symbol].price;
        onExecute({
          symbol: idea.symbol,
          side: idea.side === "SELL" ? "SELL" : "BUY",
          qty,
          price: Math.round(px * 100) / 100,
          type: "LIMIT",
          product: idea.product === "CNC" ? "CNC" : idea.product === "MTF" ? "MTF" : "MIS",
        });
        openAuto += 1;
        setTrades((t) => [
          { id: `auto-${Date.now()}-${idea.symbol}`, ts: Date.now(), idea: { ...idea, qty, entry: Math.round(px * 100) / 100 }, pnl: 0 },
          ...t,
        ]);
      }
      setSkipped(skippedLocal.slice(0, 4));
      setLastScan(Date.now());
    } catch {
      /* autopilot tolerates a failed scan; next cycle retries */
    } finally {
      busy.current = false;
      setScanning(false);
    }
  }, [quotes, threshold, maxOpen, positions, onExecute]);

  const huntRef = useRef(hunt);
  huntRef.current = hunt;

  useEffect(() => {
    if (!running) return;
    runningRef.current = true;
    const kick = setTimeout(() => void huntRef.current(), 800);
    const t = setInterval(() => void huntRef.current(), SCAN_INTERVAL_MS);
    return () => {
      runningRef.current = false;
      clearTimeout(kick);
      clearInterval(t);
    };
  }, [running]);

  // live P&L for auto trades
  const liveTrades = trades.map((t) => {
    const ltp = quotes[t.idea.symbol]?.price ?? t.idea.entry;
    const pnl = (t.idea.side === "BUY" ? ltp - t.idea.entry : t.idea.entry - ltp) * t.idea.qty;
    return { ...t, pnl };
  });
  const totalPnl = liveTrades.reduce((a, t) => a + t.pnl, 0);

  const toggle = () => setRunning((r) => !r);
  const countdown = lastScan && running ? Math.max(0, Math.ceil((lastScan + SCAN_INTERVAL_MS - Date.now()) / 1000)) : null;

  return (
    <div className="space-y-3 px-3.5 py-3">
      {/* status strip */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2.5 w-2.5 ${running ? "" : "opacity-40"}`}>
            {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${running ? "bg-emerald-400" : "bg-white/40"}`} />
          </span>
          <div className="leading-none">
            <div className="text-[12px] font-bold text-white/85">{running ? (scanning ? "SCANNING TAPE…" : "HUNTING ALPHA") : "STANDBY"}</div>
            <div className="mt-1 text-[9.5px] text-white/45">
              {running
                ? countdown !== null
                  ? `next LLM scan in ${countdown}s · every 75s`
                  : "LLM scans every 75s"
                : "autopilot disengaged"}
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11.5px] font-bold transition active:scale-95 ${
            running
              ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/30"
              : "bg-gradient-to-b from-emerald-400 to-emerald-600 text-black hover:brightness-110"
          }`}
        >
          {running ? <CircleStop className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          {running ? "KILL SWITCH" : "ENGAGE"}
        </button>
      </div>

      {/* safety notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-[10px] leading-relaxed text-amber-200/80">
        <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
        Simulated paper trading only — no real funds. The AI executes its own LLM ideas into the paper book. Session cap: {MAX_SESSION_TRADES} trades.
      </div>

      {/* knobs */}
      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <div className="flex justify-between text-[10px] font-semibold text-white/55">
            <span>MIN CONFIDENCE</span>
            <span className="font-mono text-fuchsia-300">{threshold}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="mt-2 w-full accent-fuchsia-500"
            aria-label="Minimum confidence threshold"
          />
        </label>
        <label className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <div className="flex justify-between text-[10px] font-semibold text-white/55">
            <span>MAX OPEN POSITIONS</span>
            <span className="font-mono text-fuchsia-300">{maxOpen}</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={maxOpen}
            onChange={(e) => setMaxOpen(Number(e.target.value))}
            className="mt-2 w-full accent-fuchsia-500"
            aria-label="Maximum open auto positions"
          />
        </label>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <div className="text-[9.5px] font-sans text-white/40">AUTO TRADES</div>
          <div className="mt-0.5 text-[15px] font-bold text-white/90">{trades.length}<span className="text-[10px] text-white/35">/{MAX_SESSION_TRADES}</span></div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <div className="text-[9.5px] font-sans text-white/40">SESSION P&L</div>
          <div className={`mt-0.5 text-[15px] font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnl >= 0 ? "+" : "−"}{fmtINR(Math.abs(totalPnl))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <div className="text-[9.5px] font-sans text-white/40">WINNERS</div>
          <div className="mt-0.5 text-[15px] font-bold text-white/90">
            {liveTrades.filter((t) => t.pnl > 0).length}<span className="text-[10px] text-white/35">/{liveTrades.length}</span>
          </div>
        </div>
      </div>

      {/* activity feed */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          <Radar className="h-3 w-3" /> Auto-deployment log
        </div>
        {liveTrades.length === 0 && skipped.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/12 px-3 py-4 text-center text-[11px] text-white/40">
            {running ? "First LLM scan in progress…" : "Engage the autopilot — it will scan, decide and deploy paper trades by itself."}
          </div>
        )}
        <div className="space-y-1.5">
          {liveTrades.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/4 px-3 py-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-amber-300" />
                <span className="font-mono text-[11.5px] font-bold text-white/85">{t.idea.symbol}</span>
                <span className={`rounded px-1 py-0.5 font-mono text-[9px] font-bold ${t.idea.side === "BUY" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {t.idea.side} {t.idea.qty}
                </span>
                <span className="font-mono text-[9.5px] text-white/35">@ ₹{t.idea.entry.toFixed(1)}</span>
              </div>
              <span className={`font-mono text-[11px] font-bold ${t.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {t.pnl >= 0 ? "+" : "−"}{fmtINR(Math.abs(t.pnl))}
              </span>
            </div>
          ))}
          {skipped.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-white/8 bg-transparent px-3 py-1.5">
              <span className="font-mono text-[10.5px] text-white/45">{s.symbol} · skipped</span>
              <span className="text-[9.5px] text-white/30">{s.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
