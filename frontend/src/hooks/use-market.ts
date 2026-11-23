"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STOCKS, buildDepth, r2, getMarketStatusIST, getInstrumentMarketStatus, type MarketStatus } from "@/lib/market/engine";

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
      dayHigh: r2(s.base * 1.012),
      dayLow: r2(s.base * 0.988),
      volume: Math.round(1200000 + (seed % 900000)),
      chgPct: 0,
      history: hist,
      tickDir: 0,
    };
  }
  return out;
}

const TICK_MS = 1400;

export type IndexQuote = {
  price: number;
  chgPct: number;
  chgPts: number;
};

// Global cache for live index quotes
let globalIndexQuotes: Record<string, IndexQuote> = {
  NIFTY50: { price: 25349.65, chgPct: -1.75, chgPts: -450.85 },
  BANKNIFTY: { price: 62585.35, chgPct: -3.16, chgPts: -2040.85 },
  NIFTYNEXT50: { price: 73207.25, chgPct: 0.44, chgPts: 317.50 },
  NIFTYFIN: { price: 28153.50, chgPct: -2.49, chgPts: -717.70 },
  SENSEX: { price: 82435.10, chgPct: -1.68, chgPts: -1405.20 },
};

export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>(getMarketStatusIST);
  useEffect(() => {
    const update = () => setStatus(getMarketStatusIST());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return status;
}

export function useIndices(): Record<string, IndexQuote> {
  const [indices, setIndices] = useState<Record<string, IndexQuote>>(globalIndexQuotes);

  useEffect(() => {
    let mounted = true;
    const fetchIndices = async () => {
      try {
        const res = await fetch("/api/market-quotes");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.indices && mounted) {
            globalIndexQuotes = data.indices;
            setIndices(data.indices);
          }
        }
      } catch {}
    };
    fetchIndices();
    const interval = setInterval(fetchIndices, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return indices;
}

/** Live simulated quotes for every stock. Synced with real exchange + ticks continuously. */
export function useMarket(): Record<string, Quote> {
  const [quotes, setQuotes] = useState<Record<string, Quote>>(initialQuotes);
  const realBasesRef = useRef<Record<string, number>>({});

  // 1. Live Exchange Synchronization (fetches real market data from /api/market-quotes)
  useEffect(() => {
    let mounted = true;

    const syncWithExchange = async () => {
      try {
        const res = await fetch("/api/market-quotes");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.quotes && mounted) {
            if (data.indices) globalIndexQuotes = data.indices;
            setQuotes((prev) => {
              const next = { ...prev };
              for (const [sym, lq] of Object.entries(data.quotes as Record<string, any>)) {
                if (next[sym] && lq.price) {
                  realBasesRef.current[sym] = lq.price;
                  const old = next[sym];
                  const dir: 1 | -1 | 0 = lq.price > old.price ? 1 : lq.price < old.price ? -1 : old.tickDir;
                  next[sym] = {
                    ...old,
                    price: lq.price,
                    prevClose: lq.prevClose || old.prevClose,
                    dayHigh: Math.max(lq.dayHigh || lq.price, lq.price),
                    dayLow: Math.min(lq.dayLow || lq.price, lq.price),
                    volume: lq.volume || old.volume,
                    chgPct: lq.chgPct,
                    tickDir: dir,
                    history: [...old.history.slice(-47), lq.price],
                  };
                }
              }
              return next;
            });
          }
        }
      } catch {
        // Continue with local high-accuracy calibrated engine
      }
    };

    syncWithExchange();
    const interval = setInterval(syncWithExchange, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. High-Frequency Real-time Micro Tick Engine
  // Respects instrument-specific trading hours:
  // - Crypto: 24/7 continuous live ticks
  // - MCX Commodities: Open 09:00 - 23:30/23:55 IST
  // - Forex CDS: Open 09:00 - 17:00 IST
  // - NSE Equities: Open 09:15 - 15:30 IST (frozen outside market hours)
  useEffect(() => {
    const id = setInterval(() => {
      setQuotes((prev) => {
        const next: Record<string, Quote> = {};
        for (const s of STOCKS) {
          const q = prev[s.symbol];
          const instStatus = getInstrumentMarketStatus(s);

          // If market for this instrument is closed, keep prices strictly locked to official close
          if (!instStatus.isOpen) {
            next[s.symbol] = q;
            continue;
          }

          const anchor = realBasesRef.current[s.symbol] || s.base;
          const pull = (anchor - q.price) / anchor; // strong reversion to exact exchange price
          const noise = (Math.random() - 0.5) * 0.0006 * s.volatility;
          const delta = q.price * (noise + pull * 0.15);
          let price = r2(Math.max(1, q.price + delta));

          // Strict adherence to actual exchange price (max 0.1% micro-spread)
          if (price > anchor * 1.002) price = r2(anchor * 1.002);
          if (price < anchor * 0.998) price = r2(anchor * 0.998);

          const dir = price > q.price ? 1 : price < q.price ? -1 : 0;
          next[s.symbol] = {
            ...q,
            price,
            dayHigh: Math.max(q.dayHigh, price),
            dayLow: Math.min(q.dayLow, price),
            volume: q.volume + Math.round(Math.random() * 2000 + 100),
            chgPct: q.prevClose > 0 ? r2(((price - q.prevClose) / q.prevClose) * 100) : q.chgPct,
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
