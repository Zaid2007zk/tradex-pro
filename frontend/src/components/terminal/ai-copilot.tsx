"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowUp, BrainCircuit, Sparkles, X } from "lucide-react";
import {
  computeSignals,
  generateCandles,
  liveCandle,
  STOCKS,
  fmtPct,
  fmtPrice,
  INDICES,
  computeIndexValue,
} from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";

type Msg = { role: "user" | "aria"; text: string };

const QUICK = ["How is RELIANCE looking?", "Top gainers today", "Market overview", "Any golden cross?"];

function findSymbol(q: string): string | null {
  const up = q.toUpperCase();
  const hit = STOCKS.find(
    (s) => up.includes(s.symbol) || q.toLowerCase().includes(s.name.toLowerCase().split(" ")[0].toLowerCase())
  );
  return hit?.symbol ?? null;
}

export default function AiCopilot({ quotes }: { quotes: Record<string, Quote> }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "aria",
      text: "Hi, I'm Aria — your market copilot. Ask me about any stock's price, RSI, trend or patterns. I read the live simulated feed in real time.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const candlesBySymbol = useMemo(() => {
    const out: Record<string, ReturnType<typeof generateCandles>> = {};
    for (const s of STOCKS) out[s.symbol] = liveCandle(generateCandles(s.symbol, "1D"), quotes[s.symbol].price);
    return out;
  }, [quotes]);

  const answer = (q: string): string => {
    const text = q.toLowerCase();
    const sym = findSymbol(q);

    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      return "Hello! Try asking: price of HDFCBANK, RSI of SBIN, top gainers, market overview, or any golden cross setups.";
    }
    if (text.includes("overview") || text.includes("market") || text.includes("indices") || text.includes("nifty")) {
      const parts = INDICES.slice(0, 3).map((idx) => {
        const { value, chgPct } = computeIndexValue(idx, Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, v.price])));
        return `${idx.name} ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (${fmtPct(chgPct)})`;
      });
      const adv = STOCKS.filter((s) => quotes[s.symbol].chgPct >= 0).length;
      return `Market snapshot — ${parts.join(" · ")}. Breadth: ${adv} advancers vs ${STOCKS.length - adv} decliners across the top-20 universe. Sentiment is ${adv > 12 ? "constructive" : adv > 8 ? "mixed" : "defensive"}.`;
    }
    if (text.includes("gainer")) {
      const top = [...STOCKS].sort((a, b) => quotes[b.symbol].chgPct - quotes[a.symbol].chgPct).slice(0, 3);
      return `Top gainers: ${top.map((s) => `${s.symbol} ${fmtPct(quotes[s.symbol].chgPct)}`).join(", ")}. Momentum favours ${top[0].sector.toLowerCase()} names right now.`;
    }
    if (text.includes("loser")) {
      const top = [...STOCKS].sort((a, b) => quotes[a.symbol].chgPct - quotes[b.symbol].chgPct).slice(0, 3);
      return `Biggest decliners: ${top.map((s) => `${s.symbol} ${fmtPct(quotes[s.symbol].chgPct)}`).join(", ")}. Watch for support holds before averaging down.`;
    }
    if (text.includes("cross") || text.includes("pattern") || text.includes("setup")) {
      const rows = STOCKS.map((s) => {
        const closes = candlesBySymbol[s.symbol].map((c) => c.close);
        const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
        const ma20old = closes.slice(0, -25).slice(-20).reduce((a, b) => a + b, 0) / 20;
        const ma50old = closes.slice(0, -25).slice(-50).reduce((a, b) => a + b, 0) / 50;
        return { s, golden: ma20 > ma50 && ma20old <= ma50old };
      }).filter((r) => r.golden);
      const list = rows.map((r) => r.s.symbol);
      return list.length
        ? `Golden Cross candidates on the daily timeframe: ${list.join(", ")}. MA20 has crossed above MA50 — historically strongest when volume expands on the breakout. Open Algo Studio to track them live.`
        : `No fresh golden crosses in the top-20 universe right now. I'm watching MA20/MA50 crossovers on every tick — open Algo Studio's Quant Scanner for the full signal board.`;
    }
    if (sym) {
      const q2 = quotes[sym];
      const sig = computeSignals(candlesBySymbol[sym]);
      if (text.includes("rsi")) {
        return `${sym} RSI(14) is at ${sig.rsi.toFixed(1)} — ${sig.rsi > 70 ? "overbought, momentum may cool" : sig.rsi < 30 ? "oversold, a bounce is plausible" : "in neutral territory"}. Quant verdict: ${sig.verdict} (score ${sig.score > 0 ? "+" : ""}${sig.score}).`;
      }
      if (text.includes("trend") || text.includes("signal") || text.includes("verdict") || text.includes("buy") || text.includes("sell")) {
        return `${sym} trades at ₹${fmtPrice(q2.price)} (${fmtPct(q2.chgPct)} today). It is ${sig.aboveMa20 ? "above" : "below"} MA20 and ${sig.aboveMa50 ? "above" : "below"} MA50, MACD is ${sig.macdBull ? "bullish" : "bearish"}. Composite verdict: ${sig.verdict}. Use the order ticket to paper-trade the idea.`;
      }
      return `${sym} is at ₹${fmtPrice(q2.price)}, ${fmtPct(q2.chgPct)} today (day range ₹${fmtPrice(q2.dayLow)}–₹${fmtPrice(q2.dayHigh)}). Ask me for its RSI, trend verdict or check its options chain for positioning.`;
    }
    return "I track prices, RSI, trend verdicts, patterns, breadth and indices across the top-20 NSE universe. Try: \"RSI of TATA MOTORS\", \"top losers\" or \"market overview\".";
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 999999 }));

    try {
      const res = await fetch("/api/ai-core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "chat",
          question: q,
          prices: Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, v.price])),
        }),
      });
      const data = await res.json();
      if (data.ok && data.text) {
        setMsgs((m) => [...m, { role: "aria", text: data.text }]);
        setTyping(false);
        requestAnimationFrame(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
        return;
      }
    } catch {}

    setMsgs((m) => [...m, { role: "aria", text: answer(q) }]);
    setTyping(false);
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
  };

  return (
    <>
      {/* floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-12 right-5 z-40 flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2.5 text-[13px] font-bold text-black shadow-[0_6px_24px_rgba(240,185,11,0.35)] transition hover:brightness-110 active:scale-95"
        aria-label="Open Aria AI Copilot"
      >
        {open ? <X className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
        {open ? "Close Aria" : "Ask Aria"}
      </button>

      {/* drawer */}
      {open && (
        <div className="fixed bottom-36 right-5 z-40 flex h-105 w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0d1016]/95 shadow-2xl backdrop-blur-xl">
          <div className="tx-shimmer flex items-center gap-2 px-4 py-3">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <div className="leading-none">
              <div className="text-[13px] font-bold">Aria · AI Copilot</div>
              <div className="mt-0.5 text-[9.5px] text-white/45">Gemini-grade market reasoning · live feed aware</div>
            </div>
          </div>

          <div ref={listRef} className="tx-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-amber-500/20 text-amber-100"
                      : "rounded-bl-sm border border-white/10 bg-white/6 text-white/80"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/6 px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300/80"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="tx-scroll flex gap-1.5 overflow-x-auto px-3.5 pb-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10.5px] text-white/60 transition hover:border-amber-500/40 hover:text-amber-300"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/8 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any stock, RSI, patterns…"
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/12 bg-white/5 px-3 text-[12.5px] text-white/85 outline-none transition placeholder:text-white/30 focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-black transition hover:brightness-110 disabled:opacity-40"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
