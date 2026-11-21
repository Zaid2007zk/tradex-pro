"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STOCKS, buildDepth, r2 } from "@/lib/market/engine";

export type Quote = {
  symbol: string;
  price: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  chgPct: number;
  history: number[]; // last ~48 ticks for sparklines
  tickDir: 1 | -1 | 0;
};

function initialQuotes(): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const s of STOCKS) {
    const hist: number[] = [];
    // deterministic seedable pseudo-history for SSR/CSR parity
    let p = s.base * 0.997;
    let seed = s.symbol.length * 977 + Math.round(s.base);
    for (let i = 0; i < 48; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const r = (seed / 2147483648 - 0.5) * s.volatility * 0.0035;
      p = p * (1 + r);
      hist.push(r2(p));
    }
    hist[hist.length - 1] = s.base;
    out[s.symbol] = {
      symbol: s.symbol,
      price: s.base,
      prevClose: s.base,
      dayHigh: s.base,
      dayLow: s.base,
      volume: Math.round(120000 + (seed % 900000)),
      chgPct: 0,
      history: hist,
      tickDir: 0,
    };
  }
  return out;
}

const TICK_MS = 1400;

/** Live simulated quotes for every stock. Ticks on an interval after mount. */
export function useMarket(): Record<string, Quote> {
  const [quotes, setQuotes] = useState<Record<string, Quote>>(initialQuotes);
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      setQuotes((prev) => {
        const next: Record<string, Quote> = {};
        for (const s of STOCKS) {
          const q = prev[s.symbol];
          const pull = (s.base - q.price) / s.base; // mean reversion
          const noise = (Math.random() - 0.5) * 0.0022 * s.volatility;
          const momentum = q.tickDir === 1 ? 0.0004 : q.tickDir === -1 ? -0.0004 : 0;
          const delta = q.price * (noise + pull * 0.05 + momentum);
          let price = r2(Math.max(1, q.price + delta));
          if (price > s.base * 1.09) price = s.base * 1.09;
          if (price < s.base * 0.91) price = s.base * 0.91;
          const dir = price > q.price ? 1 : price < q.price ? -1 : 0;
          next[s.symbol] = {
            ...q,
            price,
            dayHigh: Math.max(q.dayHigh, price),
            dayLow: Math.min(q.dayLow, price),
            volume: q.volume + Math.round(Math.random() * 26000 + 1200),
            chgPct: ((price - q.prevClose) / q.prevClose) * 100,
            history: [...q.history.slice(-47), price],
            tickDir: dir,
          };
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return quotes;
}

/** Market depth derived from a live price, refreshed on each tick. */
export function useDepth(price: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => buildDepth(price, tick), [price, tick]);
}
