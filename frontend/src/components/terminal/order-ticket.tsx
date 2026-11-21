"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import { STOCKS, fmtINR, fmtPrice, r2 } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import { useToast } from "@/hooks/use-toast";
import { playOrderSound } from "@/lib/market/sound";

export type ProductType = "MIS" | "CNC" | "MTF";
export type OrderType = "MARKET" | "LIMIT";

export type Order = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  type: OrderType;
  product: ProductType;
  ts: number;
};

export type Position = Order & { ltp: number };

type Props = {
  symbol: string;
  quote: Quote;
  balance: number;
  onExecute: (o: Omit<Order, "id" | "ts">) => void;
  defaultSide?: "BUY" | "SELL";
};

const PRODUCTS: { key: ProductType; hint: string }[] = [
  { key: "MIS", hint: "Intraday · 5x" },
  { key: "CNC", hint: "Delivery" },
  { key: "MTF", hint: "Margin · 4x" },
];

export default function OrderTicket({ symbol, quote, balance, onExecute, defaultSide = "BUY" }: Props) {
  const [side, setSide] = useState<"BUY" | "SELL">(defaultSide);

  // Sync side if defaultSide changes externally (e.g. from mobile quick action)
  useEffect(() => {
    if (defaultSide) setSide(defaultSide);
  }, [defaultSide]);
  const [product, setProduct] = useState<ProductType>("MIS");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [qty, setQty] = useState(10);
  const [limit, setLimit] = useState(quote.price);
  const { toast } = useToast();

  const def = STOCKS.find((s) => s.symbol === symbol)!;
  const price = orderType === "MARKET" ? quote.price : limit;
  const leverage = product === "MIS" ? 5 : product === "MTF" ? 4 : 1;
  const total = price * qty;
  const margin = total / leverage;
  const affordable = Math.floor((balance * leverage) / quote.price);

  // qty quick presets
  const presets = useMemo(
    () => [def.lot * 5, def.lot * 25, def.lot * 50, Math.max(def.lot, Math.floor(affordable / 4))].map((v) => Math.max(def.lot, v)),
    [def.lot, affordable]
  );

  const setSafeQty = (v: number) => setQty(Math.max(def.lot, Math.min(99999, Math.round(v))));

  const submit = () => {
    if (qty <= 0) return;
    playOrderSound(side);
    onExecute({ symbol, side, qty, price: r2(price), type: orderType, product });
    toast({
      title: `${side} order filled`,
      description: `${qty} × ${symbol} @ ₹${fmtPrice(price)} · ${product} · Paper trade`,
    });
  };

  const isBuy = side === "BUY";
  const accent = isBuy ? "emerald" : "rose";

  return (
    <div className="tx-panel flex shrink-0 flex-col">
      <div className="tx-panel-head flex items-center justify-between px-3.5 py-2.5">
        <span className="text-[12.5px] font-semibold tracking-wide">Order Ticket</span>
        <span className="font-mono text-[10px] text-white/40">{symbol}</span>
      </div>

      {/* BUY / SELL segmented */}
      <div className="grid grid-cols-2 gap-1.5 p-3 pb-0">
        {(["BUY", "SELL"] as const).map((s) => {
          const active = side === s;
          const buy = s === "BUY";
          return (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`h-9 rounded-lg text-[13px] font-bold tracking-wide transition ${
                active
                  ? buy
                    ? "bg-emerald-500 text-black shadow-[0_0_16px_rgba(14,203,129,0.35)]"
                    : "bg-rose-500 text-black shadow-[0_0_16px_rgba(246,70,93,0.35)]"
                  : "border border-white/10 bg-white/4 text-white/55 hover:text-white"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* product chips */}
      <div className="grid grid-cols-3 gap-1.5 px-3 pt-2.5">
        {PRODUCTS.map((p) => (
          <button
            key={p.key}
            onClick={() => setProduct(p.key)}
            className={`rounded-md border px-1.5 py-1.5 text-center transition ${
              product === p.key
                ? "border-amber-500/50 bg-amber-500/12"
                : "border-white/10 bg-white/3 hover:border-white/25"
            }`}
          >
            <div className={`text-[11px] font-bold ${product === p.key ? "text-amber-300" : "text-white/65"}`}>
              {p.key}
            </div>
            <div className="text-[8.5px] text-white/35">{p.hint}</div>
          </button>
        ))}
      </div>

      {/* order type */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5">
        {(["MARKET", "LIMIT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-semibold transition ${
              orderType === t ? "bg-white/12 text-white" : "text-white/45 hover:bg-white/6 hover:text-white/75"
            }`}
          >
            {t === "MARKET" && <Zap className="h-3 w-3" />}
            {t}
          </button>
        ))}
      </div>

      {/* qty + price */}
      <div className="grid grid-cols-2 gap-2 p-3">
        <div>
          <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-white/40">Quantity</div>
          <div className="flex h-9 items-center rounded-lg border border-white/12 bg-white/4">
            <button
              onClick={() => setSafeQty(qty - def.lot)}
              className="flex h-full w-8 items-center justify-center text-white/50 transition hover:text-white"
              aria-label="decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              value={qty}
              onChange={(e) => setSafeQty(parseInt(e.target.value.replace(/\D/, "") || "0", 10))}
              className="h-full w-full bg-transparent text-center font-mono text-[13px] font-semibold tabular-nums outline-none"
              inputMode="numeric"
            />
            <button
              onClick={() => setSafeQty(qty + def.lot)}
              className="flex h-full w-8 items-center justify-center text-white/50 transition hover:text-white"
              aria-label="increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-white/40">
            {orderType === "MARKET" ? "LTP" : "Limit ₹"}
          </div>
          <div
            className={`flex h-9 items-center justify-center rounded-lg border font-mono text-[13px] font-semibold tabular-nums ${
              orderType === "MARKET" ? "border-white/12 bg-white/4 text-white/80" : "border-white/12 bg-white/4 text-white"
            }`}
          >
            {orderType === "MARKET" ? fmtPrice(quote.price) : (
              <input
                value={limit}
                onChange={(e) => setLimit(Math.max(0.05, parseFloat(e.target.value.replace(/[^\d.]/g, "") || "0")))}
                className="h-full w-full bg-transparent text-center outline-none"
                inputMode="decimal"
              />
            )}
          </div>
        </div>
      </div>

      {/* qty presets */}
      <div className="flex gap-1.5 px-3 pb-1">
        {presets.map((v, i) => (
          <button
            key={i}
            onClick={() => setSafeQty(v)}
            className="flex-1 rounded border border-white/8 bg-white/3 py-1 font-mono text-[10px] text-white/50 transition hover:border-white/20 hover:text-white"
          >
            {v}
          </button>
        ))}
      </div>

      {/* summary */}
      <div className="mx-3 mt-1.5 rounded-lg border border-white/8 bg-white/3 px-3 py-2 font-mono text-[11px]">
        <Row label="Order value" value={`₹${fmtPrice(total)}`} />
        <Row label={`Margin (${leverage}x)`} value={fmtINR(margin)} strong />
        <Row label="Available funds" value={fmtINR(balance)} />
      </div>

      {/* submit */}
      <div className="p-3 pt-2.5">
        <button
          onClick={submit}
          className={`h-11 w-full rounded-xl text-[14px] font-bold tracking-wide text-black transition active:scale-[0.98] ${
            isBuy
              ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_20px_rgba(14,203,129,0.3)] hover:brightness-110"
              : "bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_4px_20px_rgba(246,70,93,0.3)] hover:brightness-110"
          }`}
        >
          {isBuy ? "BUY" : "SELL"} {qty} {symbol} · {fmtINR(margin)}
        </button>
        <p className="mt-1.5 text-center text-[9.5px] text-white/30">
          Simulated execution · No real funds involved
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-white/40">{label}</span>
      <span className={`tabular-nums ${strong ? "font-semibold text-amber-300" : "text-white/80"}`}>{value}</span>
    </div>
  );
}
