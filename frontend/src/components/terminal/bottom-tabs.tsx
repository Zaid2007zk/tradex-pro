"use client";

import { Badge } from "@/components/ui/badge";
import { fmtPct, fmtPrice, fmtQty } from "@/lib/market/engine";
import type { Order, Position } from "./order-ticket";

type Props = {
  positions: Position[];
  orders: Order[];
};

export default function BottomTabs({ positions, orders }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid flex-1 grid-cols-1 min-h-0 lg:grid-cols-2 lg:gap-2">
        {/* Positions */}
        <div className="tx-panel flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="tx-panel-head flex items-center justify-between px-3 py-1.5 shrink-0">
            <span className="text-[12px] font-semibold tracking-wide">Positions</span>
            <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/50">
              {positions.length}
            </span>
          </div>
          <div className="tx-scroll min-h-0 flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-[11px] tabular-nums">
              <thead className="sticky top-0 bg-[#12161f] text-[9px] uppercase tracking-wider text-white/35">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Stock</th>
                  <th className="px-1 py-1.5 font-semibold">Side</th>
                  <th className="px-1 py-1.5 text-right font-semibold">Qty</th>
                  <th className="px-1 py-1.5 text-right font-semibold">Avg</th>
                  <th className="px-1 py-1.5 text-right font-semibold">LTP</th>
                  <th className="px-3 py-1.5 text-right font-semibold">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const pnl = (p.side === "BUY" ? p.ltp - p.price : p.price - p.ltp) * p.qty;
                  const pnlPct = ((p.side === "BUY" ? p.ltp - p.price : p.price - p.ltp) / p.price) * 100;
                  return (
                    <tr key={p.id} className="border-t border-white/5 hover:bg-white/3">
                      <td className="px-3 py-1.5 font-sans text-[11.5px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>{p.symbol}</span>
                          {p.isBracket && (
                            <span
                              className="rounded border border-purple-500/35 bg-purple-500/15 px-1 py-0.2 font-mono text-[8px] font-bold text-purple-300"
                              title={`SL: ₹${p.sl} · Target: ₹${p.target}`}
                            >
                              AI BRKT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-1.5">
                        <span className={`text-[10px] font-bold ${p.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                          {p.side === "BUY" ? "L" : "S"}
                        </span>
                      </td>
                      <td className="px-1 py-1.5 text-right text-white/70">{fmtQty(p.qty)}</td>
                      <td className="px-1 py-1.5 text-right text-white/70">{fmtPrice(p.price)}</td>
                      <td className="px-1 py-1.5 text-right text-white/70">{fmtPrice(p.ltp)}</td>
                      <td className={`px-3 py-1.5 text-right font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnl >= 0 ? "+" : "−"}₹{Math.abs(Math.round(pnl)).toLocaleString("en-IN")}
                        <span className="ml-1 text-[9px] opacity-70">({fmtPct(pnlPct)})</span>
                      </td>
                    </tr>
                  );
                })}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 text-center font-sans text-[11px] text-white/35">
                      No open positions — execute an order to start paper trading
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders */}
        <div className="tx-panel hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
          <div className="tx-panel-head flex items-center justify-between px-3 py-1.5 shrink-0">
            <span className="text-[12px] font-semibold tracking-wide">Order History</span>
            <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/50">{orders.length}</span>
          </div>
          <div className="tx-scroll min-h-0 flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-[11px] tabular-nums">
              <thead className="sticky top-0 bg-[#12161f] text-[9px] uppercase tracking-wider text-white/35">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Time</th>
                  <th className="px-1 py-1.5 font-semibold">Stock</th>
                  <th className="px-1 py-1.5 text-right font-semibold">Qty</th>
                  <th className="px-1 py-1.5 text-right font-semibold">Price</th>
                  <th className="px-1 py-1.5 font-semibold">Type</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5 hover:bg-white/3">
                    <td className="px-3 py-1.5 text-white/50">
                      {new Date(o.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-1 py-1.5 font-sans text-[11.5px] font-semibold">{o.symbol}</td>
                    <td className="px-1 py-1.5 text-right text-white/70">{fmtQty(o.qty)}</td>
                    <td className="px-1 py-1.5 text-right text-white/70">{fmtPrice(o.price)}</td>
                    <td className="px-1 py-1.5 text-[10px] text-white/50">
                      {o.side} · {o.product}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-300">
                        FILLED
                      </Badge>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 text-center font-sans text-[11px] text-white/35">
                      Executed orders will appear here
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
