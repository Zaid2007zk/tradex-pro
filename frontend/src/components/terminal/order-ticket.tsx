"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Zap, Sparkles, Target, ShieldAlert, ChevronRight } from "lucide-react";
import { STOCKS, fmtINR, fmtPrice, r2, computeSignals, type Candle } from "@/lib/market/engine";
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
  sl?: number;
  target?: number;
  isBracket?: boolean;
};

export type Position = Order & { ltp: number };

type Props = {
  symbol: string;
  quote: Quote;
  balance: number;
  onExecute: (o: Omit<Order, "id" | "ts">) => void;
  defaultSide?: "BUY" | "SELL";
  candles?: Candle[];
  onCollapse?: () => void;
  prefilledBracket?: { sl: number; tgt: number; side?: "BUY" | "SELL" } | null;
};

const PRODUCTS: { key: ProductType; hint: string }[] = [
  { key: "MIS", hint: "Intraday · 5x" },
  { key: "CNC", hint: "Delivery" },
  { key: "MTF", hint: "Margin · 4x" },
];

export default function OrderTicket({ symbol, quote, balance, onExecute, defaultSide = "BUY", candles, onCollapse, prefilledBracket }: Props) {
  const def = STOCKS.find((s) => s.symbol === symbol) || STOCKS[0];
  const currSym = def.currency === "USD" ? "$" : "₹";
  const [side, setSide] = useState<"BUY" | "SELL">(defaultSide);
  const sig = useMemo(() => (candles && candles.length ? computeSignals(candles) : null), [candles]);

  const [isBracket, setIsBracket] = useState(false);
  const [stopLoss, setStopLoss] = useState<number | undefined>();
  const [takeProfit, setTakeProfit] = useState<number | undefined>();

  // Sync with AI Panel 1-click level application
  useEffect(() => {
    if (prefilledBracket && prefilledBracket.sl && prefilledBracket.tgt) {
      if (prefilledBracket.side) setSide(prefilledBracket.side);
      setStopLoss(prefilledBracket.sl);
      setTakeProfit(prefilledBracket.tgt);
      setIsBracket(true);
    }
  }, [prefilledBracket]);

  const aiSl = useMemo(
    () => (quote.price ? r2(quote.price * (side === "SELL" ? 1.015 : 0.985)) : 0),
    [quote.price, side]
  );
  const aiTgt = useMemo(
    () => (quote.price ? r2(quote.price * (side === "SELL" ? 0.97 : 1.03)) : 0),
    [quote.price, side]
  );

  // Sync side if defaultSide changes externally (e.g. from mobile quick action)
  useEffect(() => {
    if (defaultSide) setSide(defaultSide);
  }, [defaultSide]);
  const [product, setProduct] = useState<ProductType>("MIS");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [qty, setQty] = useState(10);
  const [limit, setLimit] = useState(quote.price);
  const { toast } = useToast();

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
    const finalSl = isBracket ? (stopLoss ?? aiSl) : undefined;
    const finalTgt = isBracket ? (takeProfit ?? aiTgt) : undefined;
    onExecute({
      symbol,
      side,
      qty,
      price: r2(price),
      type: orderType,
      product,
      sl: finalSl,
      target: finalTgt,
      isBracket,
    });
    toast({
      title: `${side} order filled ${isBracket ? "· AI Bracket Armed ⚡" : ""}`,
      description: `${qty} × ${symbol} @ ${currSym}${fmtPrice(price)} · ${product}${isBracket ? ` · SL ${currSym}${finalSl} | TGT ${currSym}${finalTgt}` : ""}`,
    });
  };

  const isBuy = side === "BUY";
  const accent = isBuy ? "emerald" : "rose";

  return (
    <div className="tx-panel flex shrink-0 flex-col">
      <div className="tx-panel-head flex items-center justify-between px-3 py-1.5">
        <span className="text-[12px] font-semibold tracking-wide">Order Ticket</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/40">{symbol}</span>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Trade Panel"
              className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-white/50 hover:bg-white/15 hover:text-white transition"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BUY / SELL segmented */}
      <div className="grid grid-cols-2 gap-1.5 p-2.5 pb-0">
        {(["BUY", "SELL"] as const).map((s) => {
          const active = side === s;
          const buy = s === "BUY";
          return (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`h-8 rounded-lg text-[12.5px] font-bold tracking-wide transition ${
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
      <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.key}
            onClick={() => setProduct(p.key)}
            className={`rounded-md border px-1.5 py-1 text-center transition ${
              product === p.key
                ? "border-amber-500/50 bg-amber-500/12"
                : "border-white/10 bg-white/3 hover:border-white/25"
            }`}
          >
            <div className={`text-[10.5px] font-bold ${product === p.key ? "text-amber-300" : "text-white/65"}`}>
              {p.key}
            </div>
            <div className="text-[8px] text-white/35">{p.hint}</div>
          </button>
        ))}
      </div>

      {/* order type */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2">
        {(["MARKET", "LIMIT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
              orderType === t ? "bg-white/12 text-white" : "text-white/45 hover:bg-white/6 hover:text-white/75"
            }`}
          >
            {t === "MARKET" && <Zap className="h-2.5 w-2.5" />}
            {t}
          </button>
        ))}
      </div>

      {/* qty + price */}
      <div className="grid grid-cols-2 gap-1.5 p-2.5 py-1.5">
        <div>
          <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/40">Quantity</div>
          <div className="flex h-8 items-center rounded-lg border border-white/12 bg-white/4">
            <button
              onClick={() => setSafeQty(qty - def.lot)}
              className="flex h-full w-7 items-center justify-center text-white/50 transition hover:text-white"
              aria-label="decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              value={qty}
              onChange={(e) => setSafeQty(parseInt(e.target.value.replace(/\D/, "") || "0", 10))}
              className="h-full w-full bg-transparent text-center font-mono text-[12px] font-semibold tabular-nums outline-none"
              inputMode="numeric"
            />
            <button
              onClick={() => setSafeQty(qty + def.lot)}
              className="flex h-full w-7 items-center justify-center text-white/50 transition hover:text-white"
              aria-label="increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div>
          <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/40">
            {orderType === "MARKET" ? "LTP" : `Limit ${currSym}`}
          </div>
          <div
            className={`flex h-8 items-center justify-center rounded-lg border font-mono text-[12px] font-semibold tabular-nums ${
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
      <div className="flex gap-1 px-2.5 pb-1">
        {presets.map((v, i) => (
          <button
            key={i}
            onClick={() => setSafeQty(v)}
            className="flex-1 rounded border border-white/8 bg-white/3 py-0.5 font-mono text-[9.5px] text-white/50 transition hover:border-white/20 hover:text-white"
          >
            {v}
          </button>
        ))}
      </div>

      {/* summary */}
      <div className="mx-2.5 rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 font-mono text-[10.5px]">
        <Row label="Order value" value={`${currSym}${fmtPrice(total)}`} />
        <Row label={`Margin (${leverage}x)`} value={fmtINR(margin)} strong />
        <Row label="Available funds" value={fmtINR(balance)} />
      </div>

      {/* ARIA AI Neural Edge */}
      {sig && (
        <div className="mx-2.5 mt-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2 font-mono text-[10px]">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
              <span className="font-sans font-bold text-purple-300">ARIA AI Signal</span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                sig.verdict.includes("BUY")
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : sig.verdict.includes("SELL")
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {sig.verdict} ({Math.abs(sig.score)}%)
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5 text-[9.5px] text-white/55">
            <span className="flex items-center gap-1">
              <ShieldAlert className="h-2.5 w-2.5 text-rose-400" /> SL:{" "}
              <strong className="text-rose-300">
                {currSym}{fmtPrice(quote.price * (sig.verdict.includes("SELL") ? 1.015 : 0.985))}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-2.5 w-2.5 text-emerald-400" /> TGT:{" "}
              <strong className="text-emerald-300">
                {currSym}{fmtPrice(quote.price * (sig.verdict.includes("SELL") ? 0.97 : 1.03))}
              </strong>
            </span>
            <span className="text-white/40">R:R 1:2</span>
          </div>

          {/* 1-Click AI Smart Bracket Order Trigger */}
          <button
            type="button"
            onClick={() => {
              const nextState = !isBracket;
              setIsBracket(nextState);
              if (nextState) {
                setStopLoss(aiSl);
                setTakeProfit(aiTgt);
              }
            }}
            className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border py-1 font-sans text-[10px] font-bold transition active:scale-[0.98] ${
              isBracket
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(14,203,129,0.2)]"
                : "border-purple-500/40 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
            }`}
          >
            <Zap className="h-3 w-3 text-amber-300" />
            <span>{isBracket ? "✓ AI Bracket Active (Auto Exit)" : "⚡ Arm AI Smart Bracket"}</span>
          </button>

          {isBracket && (
            <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[9.5px]">
              <div>
                <span className="text-[8.5px] text-rose-300/80 uppercase">Stop Loss ({currSym})</span>
                <input
                  value={stopLoss ?? aiSl}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="mt-0.5 h-6.5 w-full rounded border border-rose-500/30 bg-black/40 px-1 text-center font-bold text-rose-300 outline-none"
                  inputMode="decimal"
                />
              </div>
              <div>
                <span className="text-[8.5px] text-emerald-300/80 uppercase">Target ({currSym})</span>
                <input
                  value={takeProfit ?? aiTgt}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="mt-0.5 h-6.5 w-full rounded border border-emerald-500/30 bg-black/40 px-1 text-center font-bold text-emerald-300 outline-none"
                  inputMode="decimal"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* submit */}
      <div className="p-2.5 pt-1.5">
        <button
          onClick={submit}
          className={`h-9 w-full rounded-xl text-[13px] font-bold tracking-wide text-black transition active:scale-[0.98] ${
            isBuy
              ? "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_20px_rgba(14,203,129,0.3)] hover:brightness-110"
              : "bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_4px_20px_rgba(246,70,93,0.3)] hover:brightness-110"
          }`}
        >
          {isBuy ? "BUY" : "SELL"} {qty} {symbol} · {fmtINR(margin)}
        </button>
        <p className="mt-1 text-center text-[9px] text-white/30">
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
