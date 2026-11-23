"use client";

import { useMemo, useState } from "react";
import { NotebookPen, Brain, HeartPulse, Download, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { fmtPrice, fmtQty } from "@/lib/market/engine";
import type { Order } from "./order-ticket";

export default function Journal({ orders }: { orders: Order[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const buyValue = orders.reduce((a, o) => a + (o.side === "BUY" ? o.price * o.qty : 0), 0);
  const sellValue = orders.reduce((a, o) => a + (o.side === "SELL" ? o.price * o.qty : 0), 0);

  // AI Psychology & Discipline Analytics
  const analytics = useMemo(() => {
    const total = orders.length;
    if (total === 0) {
      return {
        disciplineScore: 100,
        revengeCount: 0,
        diagnosis: "No trades recorded yet. Start with small positions and maintain stop losses.",
        overtrading: false,
      };
    }

    // Check for rapid revenge trading (trades placed < 90 seconds apart)
    let revengeCount = 0;
    for (let i = 0; i < orders.length - 1; i++) {
      const diff = Math.abs(orders[i].ts - orders[i + 1].ts);
      if (diff < 90_000) revengeCount++;
    }

    const overtrading = total > 12;
    let disciplineScore = 95 - revengeCount * 12 - (overtrading ? 15 : 0);
    disciplineScore = Math.max(30, Math.min(100, disciplineScore));

    let diagnosis = "Excellent execution discipline. Position sizing and pacing are well-controlled.";
    if (revengeCount > 1) {
      diagnosis = "⚠️ Revenge Trading Warning: Multiple rapid trades detected within 90 seconds. Take a 5-minute break after every exit.";
    } else if (overtrading) {
      diagnosis = "⚠️ Overtrading Detected: High order frequency. Stick to your top 3-4 highest conviction setups per session.";
    }

    return { disciplineScore, revengeCount, diagnosis, overtrading };
  }, [orders]);

  const exportCSV = () => {
    if (!orders.length) return;
    const headers = "ID,Timestamp,Symbol,Side,Qty,Price,Product,Type,Notes\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${new Date(o.ts).toISOString()}","${o.symbol}","${o.side}",${o.qty},${o.price},"${o.product}","${o.type}","${(notes[o.id] ?? "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradex_journal_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      {/* AI Trade Psychology Doctor Header Banner */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/25 border border-purple-500/40 text-purple-300">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ARIA AI Psychology & Discipline Coach</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold">
                  Score: {analytics.disciplineScore}/100
                </span>
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">{analytics.diagnosis}</div>
            </div>
          </div>
          <button
            onClick={exportCSV}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12 hover:text-white transition disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="tx-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="tx-panel-head flex items-center gap-2 px-3.5 py-2.5 shrink-0">
          <NotebookPen className="h-4 w-4 text-amber-300" />
          <span className="text-[13px] font-semibold tracking-wide">Trading Journal</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[9.5px] text-white/50">{orders.length} entries</span>
          <span className="ml-auto flex gap-3 font-mono text-[10.5px]">
            <span className="text-emerald-400">Buy ₹{buyValue.toLocaleString("en-IN")}</span>
            <span className="text-rose-400">Sell ₹{sellValue.toLocaleString("en-IN")}</span>
          </span>
        </div>
        <div className="tx-scroll min-h-0 flex-1 overflow-y-auto px-2.5 py-2">
          {orders.map((o) => (
            <div key={o.id} className="mb-1.5 rounded-lg border border-white/8 bg-white/4 p-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                    o.side === "BUY" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {o.side}
                </span>
                <span className="text-[12.5px] font-bold">{o.symbol}</span>
                <span className="font-mono text-[11px] tabular-nums text-white/65">
                  {fmtQty(o.qty)} × ₹{fmtPrice(o.price)}
                </span>
                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-white/50">
                  {o.product} · {o.type}
                </span>
                {o.isBracket && (
                  <span className="rounded border border-purple-500/35 bg-purple-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-purple-300">
                    SL ₹{o.sl} · TGT ₹{o.target}
                  </span>
                )}
                <span className="ml-auto font-mono text-[10px] text-white/40">
                  {new Date(o.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <input
                value={notes[o.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [o.id]: e.target.value }))}
                placeholder="Why did you take this trade? (thesis, setup, emotion…)"
                className="mt-2 h-8 w-full rounded-md border border-white/10 bg-black/25 px-2.5 text-[11.5px] text-white/80 outline-none transition placeholder:text-white/25 focus:border-amber-500/50"
              />
            </div>
          ))}
          {orders.length === 0 && (
            <p className="py-8 text-center text-[12px] text-white/35">
              Every paper trade you execute is auto-logged here — add your reasoning below each entry to build discipline.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
