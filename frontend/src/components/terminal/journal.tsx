"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { fmtPrice, fmtQty } from "@/lib/market/engine";
import type { Order } from "./order-ticket";

export default function Journal({ orders }: { orders: Order[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const buyValue = orders.reduce((a, o) => a + (o.side === "BUY" ? o.price * o.qty : 0), 0);
  const sellValue = orders.reduce((a, o) => a + (o.side === "SELL" ? o.price * o.qty : 0), 0);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="tx-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="tx-panel-head flex items-center gap-2 px-3.5 py-2.5">
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
