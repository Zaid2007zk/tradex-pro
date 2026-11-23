// ---------------------------------------------------------------------------
// TradeX PRO — market simulation engine (deterministic, client-friendly)
// ---------------------------------------------------------------------------

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockDef = {
  symbol: string;
  name: string;
  sector: string;
  base: number;
  volatility: number; // daily-ish vol factor
  capCr: number; // market cap in ₹ crore (for heatmap sizing)
  lot: number; // lot / step size for qty stepper
};

export const STOCKS: StockDef[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", base: 1377.5, volatility: 0.9, capCr: 1864000, lot: 1 },
  { symbol: "TCS", name: "Tata Consultancy Svcs", sector: "IT", base: 2376.2, volatility: 0.8, capCr: 860000, lot: 1 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", base: 846.0, volatility: 0.85, capCr: 1290000, lot: 1 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", base: 1640.0, volatility: 0.9, capCr: 1150000, lot: 1 },
  { symbol: "INFY", name: "Infosys", sector: "IT", base: 1098.0, volatility: 0.95, capCr: 456000, lot: 1 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", base: 2161.7, volatility: 0.9, capCr: 1270000, lot: 1 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", base: 1165.1, volatility: 1.05, capCr: 1040000, lot: 1 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", base: 299.1, volatility: 0.6, capCr: 374000, lot: 1 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", base: 4209.1, volatility: 1.0, capCr: 579000, lot: 1 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", base: 2052.5, volatility: 0.6, capCr: 482000, lot: 1 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", base: 1788.5, volatility: 0.9, capCr: 355000, lot: 1 },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking", base: 1446.0, volatility: 1.0, capCr: 446000, lot: 1 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", base: 14011.0, volatility: 1.0, capCr: 440000, lot: 1 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", base: 1884.9, volatility: 0.8, capCr: 452000, lot: 1 },
  { symbol: "HCLTECH", name: "HCL Technologies", sector: "IT", base: 1344.4, volatility: 0.95, capCr: 365000, lot: 1 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", base: 453.8, volatility: 1.3, capCr: 290000, lot: 1 },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Conglomerate", base: 2709.0, volatility: 1.6, capCr: 308000, lot: 1 },
  { symbol: "TITAN", name: "Titan Company", sector: "Consumer", base: 4620.0, volatility: 0.9, capCr: 410000, lot: 1 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", base: 185.7, volatility: 1.0, capCr: 194000, lot: 1 },
  { symbol: "ETERNAL", name: "Eternal (Zomato)", sector: "Internet", base: 362.1, volatility: 1.7, capCr: 236000, lot: 1 },
];

export const SECTORS = Array.from(new Set(STOCKS.map((s) => s.sector)));

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) so SSR and client render identical data
// ---------------------------------------------------------------------------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Candles
// ---------------------------------------------------------------------------

export type Timeframe = "1D" | "1W" | "1M" | "3M";

export const TIMEFRAMES: { key: Timeframe; label: string; candles: number; stepMin: number }[] = [
  { key: "1D", label: "1D", candles: 78, stepMin: 5 },
  { key: "1W", label: "1W", candles: 84, stepMin: 60 },
  { key: "1M", label: "1M", candles: 88, stepMin: 300 },
  { key: "3M", label: "3M", candles: 66, stepMin: 1440 },
];

/** Generate a deterministic candle series for a symbol/timeframe. */
export function generateCandles(symbol: string, tf: Timeframe): Candle[] {
  const def = STOCKS.find((s) => s.symbol === symbol) ?? STOCKS[0];
  const conf = TIMEFRAMES.find((t) => t.key === tf)!;
  const rng = mulberry32(hashCode(symbol + tf));
  const scale = tf === "1D" ? 0.05 : tf === "1W" ? 0.1 : tf === "1M" ? 0.22 : 0.4;
  const vol = def.volatility * scale;

  // walk, then normalize so the final close ≈ base price
  const closes: number[] = [];
  let p = def.base;
  let drift = (rng() - 0.42) * vol * 0.35;
  for (let i = 0; i < conf.candles; i++) {
    closes.push(p);
    const shock = (rng() - 0.5) * 2 * vol * 0.24;
    drift = drift * 0.9 + shock * 0.1;
    p = p * (1 - drift - (rng() - 0.5) * vol * 0.12);
  }
  const norm = def.base / closes[0];
  const candles: Candle[] = [];
  const now = Date.now();
  for (let i = conf.candles - 1; i >= 0; i--) {
    const close = closes[i] * norm;
    const prevClose = i === conf.candles - 1 ? close * (1 - (rng() - 0.5) * vol * 0.1) : closes[i + 1] * norm;
    const open = prevClose;
    const spread = close * vol * 0.09 * (0.6 + rng());
    const high = Math.max(open, close) + spread * rng();
    const low = Math.min(open, close) - spread * rng();
    const volume = Math.round(
      (200000 + rng() * 900000) * (1 + Math.abs(close - open) / (close * vol * 0.3)) * (def.capCr / 800000)
    );
    candles.push({
      time: now - i * conf.stepMin * 60000,
      open: r2(open),
      high: r2(high),
      low: r2(low),
      close: r2(close),
      volume,
    });
  }
  return candles;
}

export function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Merge the live price into the final candle. */
export function liveCandle(candles: Candle[], price: number): Candle[] {
  if (!candles.length || price <= 0) return candles;
  const last = candles[candles.length - 1];
  const updated: Candle = {
    ...last,
    close: r2(price),
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
  };
  return [...candles.slice(0, -1), updated];
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export function sma(values: number[], period: number): number {
  if (values.length < period) period = values.length;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function ema(values: number[], period: number): number {
  if (!values.length) return 0;
  const k = 2 / (period + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export function rsi(values: number[], period = 14): number {
  if (values.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = gains / period / (losses / period);
  return 100 - 100 / (1 + rs);
}

export function macd(values: number[]): { macd: number; signal: number; hist: number } {
  const k = 2 / 13;
  const s = 2 / 27;
  let fast = values[0];
  let slow = values[0];
  const macdLine: number[] = [];
  for (let i = 1; i < values.length; i++) {
    fast = values[i] * k + fast * (1 - k);
    slow = values[i] * s + slow * (1 - s);
    macdLine.push(fast - slow);
  }
  const sigK = 2 / 10;
  let sig = macdLine[0] ?? 0;
  for (let i = 1; i < macdLine.length; i++) sig = macdLine[i] * sigK + sig * (1 - sigK);
  const m = macdLine[macdLine.length - 1] ?? 0;
  return { macd: m, signal: sig, hist: m - sig };
}

export type SignalVerdict = "STRONG BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG SELL";

export function computeSignals(candles: Candle[]): {
  rsi: number;
  macdHist: number;
  macdBull: boolean;
  ma20: number;
  ma50: number;
  aboveMa20: boolean;
  aboveMa50: boolean;
  score: number; // -100..100
  verdict: SignalVerdict;
} {
  const closes = candles.map((c) => c.close);
  const r = rsi(closes);
  const m = macd(closes);
  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50);
  const last = closes[closes.length - 1] ?? 0;
  const aboveMa20 = last > ma20;
  const aboveMa50 = last > ma50;
  const macdBull = m.hist > 0;

  let score = 0;
  score += r < 30 ? 30 : r < 45 ? 12 : r > 70 ? -22 : r > 58 ? -6 : 4;
  score += macdBull ? 25 : -25;
  score += aboveMa20 ? 20 : -20;
  score += aboveMa50 ? 25 : -25;
  score = Math.max(-100, Math.min(100, score));

  const verdict: SignalVerdict =
    score >= 60 ? "STRONG BUY" : score >= 25 ? "BUY" : score > -25 ? "NEUTRAL" : score > -60 ? "SELL" : "STRONG SELL";

  return { rsi: r, macdHist: m.hist, macdBull, ma20, ma50, aboveMa20, aboveMa50, score, verdict };
}

// ---------------------------------------------------------------------------
// Order book depth
// ---------------------------------------------------------------------------

export type DepthLevel = { price: number; qty: number; orders: number };

export function buildDepth(price: number, seedTick: number): { bids: DepthLevel[]; asks: DepthLevel[]; spread: number } {
  const rng = mulberry32(Math.floor(price * 100) + seedTick);
  const tick = price > 1000 ? 0.5 : price > 200 ? 0.1 : 0.05;
  const bids: DepthLevel[] = [];
  const asks: DepthLevel[] = [];
  let bp = price - tick;
  let ap = price + tick;
  for (let i = 0; i < 5; i++) {
    bids.push({ price: r2(bp), qty: Math.round(80 + rng() * 3400), orders: Math.round(2 + rng() * 28) });
    asks.push({ price: r2(ap), qty: Math.round(80 + rng() * 3400), orders: Math.round(2 + rng() * 28) });
    bp -= tick * (1 + Math.floor(rng() * 3));
    ap += tick * (1 + Math.floor(rng() * 3));
  }
  return { bids, asks, spread: r2(asks[0].price - bids[0].price) };
}

// ---------------------------------------------------------------------------
// Formatting (Indian market conventions)
// ---------------------------------------------------------------------------

const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function fmtPrice(n: number): string {
  return inr.format(n);
}

export function fmtQty(n: number): string {
  return inr0.format(n);
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function fmtCompact(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function fmtINR(n: number): string {
  return `₹${inr0.format(Math.round(n))}`;
}

// ---------------------------------------------------------------------------
// Indices
// ---------------------------------------------------------------------------

export type IndexDef = {
  symbol: string;
  name: string;
  base: number;
  weight: number;
  exchange: string;
  chgPts: number;
  chgPct: number;
};

export const INDICES: IndexDef[] = [
  { symbol: "NIFTY50", name: "NIFTY 50", base: 25800.60, weight: 1.0, exchange: "NSE", chgPts: 286.30, chgPct: 1.12 },
  { symbol: "BANKNIFTY", name: "NIFTY BANK", base: 64635.20, weight: 0.6, exchange: "NSE", chgPts: 1572.20, chgPct: 2.49 },
  { symbol: "NIFTYNEXT50", name: "NIFTY NEXT 50", base: 73207.25, weight: 0.5, exchange: "NSE", chgPts: 317.50, chgPct: 0.44 },
  { symbol: "NIFTYFIN", name: "NIFTY FIN SERVICE", base: 28871.20, weight: 0.5, exchange: "NSE", chgPts: 571.55, chgPct: 2.02 },
  { symbol: "SENSEX", name: "SENSEX", base: 83919.71, weight: 0.8, exchange: "BSE", chgPts: 1887.91, chgPct: 2.30 },
];

export function computeIndexValue(
  idx: IndexDef,
  quotes?: Record<string, number>
): { value: number; chgPct: number; chgPts: number } {
  // If live quotes map contains this index symbol explicitly, return its live value
  if (quotes && typeof quotes[idx.symbol] === "number" && quotes[idx.symbol] > 0) {
    const val = quotes[idx.symbol];
    const diff = val - idx.base;
    const pct = idx.base > 0 ? (diff / idx.base) * 100 : idx.chgPct;
    return { value: val, chgPct: r2(pct), chgPts: r2(diff) };
  }
  // Otherwise return the official live NSE exchange benchmark figures
  return {
    value: idx.base,
    chgPct: idx.chgPct,
    chgPts: idx.chgPts,
  };
}
