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

export type ExchangeSegment = "NSE" | "MCX" | "FOREX" | "CRYPTO";

export type StockDef = {
  symbol: string;
  name: string;
  sector: string;
  base: number;
  volatility: number; // daily-ish vol factor
  capCr: number; // market cap in ₹ crore (for heatmap sizing)
  lot: number; // lot / step size for qty stepper
  exchange?: ExchangeSegment;
};

export const STOCKS: StockDef[] = [
  // --- 1. NSE EQUITIES ---
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", exchange: "NSE", base: 1351.0, volatility: 0.9, capCr: 1864000, lot: 1 },
  { symbol: "TCS", name: "Tata Consultancy Svcs", sector: "IT", exchange: "NSE", base: 2376.2, volatility: 0.8, capCr: 860000, lot: 1 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", exchange: "NSE", base: 817.8, volatility: 0.85, capCr: 1290000, lot: 1 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", exchange: "NSE", base: 1640.0, volatility: 0.9, capCr: 1150000, lot: 1 },
  { symbol: "INFY", name: "Infosys", sector: "IT", exchange: "NSE", base: 1098.0, volatility: 0.95, capCr: 456000, lot: 1 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", exchange: "NSE", base: 2161.7, volatility: 0.9, capCr: 1270000, lot: 1 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", exchange: "NSE", base: 1132.65, volatility: 1.05, capCr: 1040000, lot: 1 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", exchange: "NSE", base: 299.1, volatility: 0.6, capCr: 374000, lot: 1 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", exchange: "NSE", base: 4209.1, volatility: 1.0, capCr: 579000, lot: 1 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", exchange: "NSE", base: 2052.5, volatility: 0.6, capCr: 482000, lot: 1 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", exchange: "NSE", base: 502.85, volatility: 0.9, capCr: 355000, lot: 1 },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking", exchange: "NSE", base: 1446.0, volatility: 1.0, capCr: 446000, lot: 1 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", exchange: "NSE", base: 14011.0, volatility: 1.0, capCr: 440000, lot: 1 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", exchange: "NSE", base: 1884.9, volatility: 0.8, capCr: 452000, lot: 1 },
  { symbol: "HCLTECH", name: "HCL Technologies", sector: "IT", exchange: "NSE", base: 1344.4, volatility: 0.95, capCr: 365000, lot: 1 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", exchange: "NSE", base: 453.8, volatility: 1.3, capCr: 290000, lot: 1 },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Conglomerate", exchange: "NSE", base: 2709.0, volatility: 1.6, capCr: 308000, lot: 1 },
  { symbol: "TITAN", name: "Titan Company", sector: "Consumer", exchange: "NSE", base: 4620.0, volatility: 0.9, capCr: 410000, lot: 1 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", exchange: "NSE", base: 185.7, volatility: 1.0, capCr: 194000, lot: 1 },
  { symbol: "ETERNAL", name: "Eternal (Zomato)", sector: "Internet", exchange: "NSE", base: 362.1, volatility: 1.7, capCr: 236000, lot: 1 },

  // --- 2. MCX COMMODITIES ---
  { symbol: "GOLD", name: "Gold 10g", sector: "Precious Metals", exchange: "MCX", base: 77850.0, volatility: 0.7, capCr: 4500000, lot: 1 },
  { symbol: "SILVER", name: "Silver 1kg", sector: "Precious Metals", exchange: "MCX", base: 91400.0, volatility: 1.1, capCr: 2100000, lot: 1 },
  { symbol: "CRUDEOIL", name: "Crude Oil BBL", sector: "Energy", exchange: "MCX", base: 6120.0, volatility: 1.5, capCr: 1800000, lot: 1 },
  { symbol: "NATURALGAS", name: "Natural Gas mmBtu", sector: "Energy", exchange: "MCX", base: 268.5, volatility: 2.2, capCr: 450000, lot: 1 },
  { symbol: "COPPER", name: "Copper 1kg", sector: "Base Metals", exchange: "MCX", base: 842.3, volatility: 0.9, capCr: 850000, lot: 1 },

  // --- 3. FOREX / CURRENCY CDS ---
  { symbol: "USDINR", name: "US Dollar / Indian Rupee", sector: "Forex", exchange: "FOREX", base: 84.42, volatility: 0.25, capCr: 15000000, lot: 1 },
  { symbol: "EURINR", name: "Euro / Indian Rupee", sector: "Forex", exchange: "FOREX", base: 88.65, volatility: 0.35, capCr: 8000000, lot: 1 },
  { symbol: "GBPINR", name: "British Pound / INR", sector: "Forex", exchange: "FOREX", base: 106.30, volatility: 0.4, capCr: 6000000, lot: 1 },
  { symbol: "JPYINR", name: "100 Japanese Yen / INR", sector: "Forex", exchange: "FOREX", base: 54.80, volatility: 0.45, capCr: 4000000, lot: 1 },

  // --- 4. CRYPTO 24/7 ---
  { symbol: "BTC", name: "Bitcoin / INR", sector: "Digital Asset", exchange: "CRYPTO", base: 5682000.0, volatility: 1.8, capCr: 160000000, lot: 1 },
  { symbol: "ETH", name: "Ethereum / INR", sector: "Smart Contracts", exchange: "CRYPTO", base: 159800.0, volatility: 2.1, capCr: 35000000, lot: 1 },
  { symbol: "SOL", name: "Solana / INR", sector: "DeFi", exchange: "CRYPTO", base: 11200.0, volatility: 2.5, capCr: 9000000, lot: 1 },
  { symbol: "BNB", name: "Binance Coin / INR", sector: "Exchange Token", exchange: "CRYPTO", base: 45400.0, volatility: 1.6, capCr: 8000000, lot: 1 },
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
export function generateCandles(symbol: string, tf: Timeframe, targetPrice?: number): Candle[] {
  const def = STOCKS.find((s) => s.symbol === symbol) ?? STOCKS[0];
  const conf = TIMEFRAMES.find((t) => t.key === tf)!;
  const rng = mulberry32(hashCode(symbol + tf));
  const scale = tf === "1D" ? 0.05 : tf === "1W" ? 0.1 : tf === "1M" ? 0.22 : 0.4;
  const vol = def.volatility * scale;

  const anchor = typeof targetPrice === "number" && targetPrice > 0 ? targetPrice : def.base;

  // walk, then normalize so the final close ≈ anchor price
  const closes: number[] = [];
  let p = anchor;
  let drift = (rng() - 0.42) * vol * 0.35;
  for (let i = 0; i < conf.candles; i++) {
    closes.push(p);
    const shock = (rng() - 0.5) * 2 * vol * 0.24;
    drift = drift * 0.9 + shock * 0.1;
    p = p * (1 - drift - (rng() - 0.5) * vol * 0.12);
  }
  const norm = anchor / closes[0];
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
  { symbol: "NIFTY50", name: "NIFTY 50", base: 25349.65, weight: 1.0, exchange: "NSE", chgPts: -450.85, chgPct: -1.75 },
  { symbol: "BANKNIFTY", name: "NIFTY BANK", base: 62585.35, weight: 0.6, exchange: "NSE", chgPts: -2040.85, chgPct: -3.16 },
  { symbol: "NIFTYNEXT50", name: "NIFTY NEXT 50", base: 73207.25, weight: 0.5, exchange: "NSE", chgPts: 317.50, chgPct: 0.44 },
  { symbol: "NIFTYFIN", name: "NIFTY FIN SERVICE", base: 28153.50, weight: 0.5, exchange: "NSE", chgPts: -717.70, chgPct: -2.49 },
  { symbol: "SENSEX", name: "SENSEX", base: 82435.10, weight: 0.8, exchange: "BSE", chgPts: -1405.20, chgPct: -1.68 },
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

// ---------------------------------------------------------------------------
// Real-world Market Status (Indian Standard Time: UTC+5:30)
// Regular Market Hours: Monday to Friday, 09:15 to 15:30 IST
// ---------------------------------------------------------------------------

export type MarketStatus = {
  isOpen: boolean;
  label: string;
  badgeClass: string;
  subLabel: string;
  istTime: string;
};

export function getMarketStatusIST(now: Date = new Date()): MarketStatus {
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utc + istOffset);

  const day = istDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Trading days: Monday (1) to Friday (5)
  // Trading hours: 09:15 IST (555 mins) to 15:30 IST (930 mins)
  const isWeekday = day >= 1 && day <= 5;
  const isTradingHours = timeInMinutes >= 555 && timeInMinutes < 930;
  const isOpen = isWeekday && isTradingHours;

  const timeStr = istDate.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " IST";

  if (isOpen) {
    return {
      isOpen: true,
      label: "LIVE (NSE)",
      badgeClass: "border-emerald-500/30 bg-emerald-950/40 text-emerald-400",
      subLabel: "Market Open",
      istTime: timeStr,
    };
  }

  const isWeekend = day === 0 || day === 6;
  const reason = isWeekend ? "Weekend" : timeInMinutes < 555 ? "Pre-Market" : "Official Close";
  return {
    isOpen: false,
    label: "MARKET CLOSED (OFFICIAL CLOSE)",
    badgeClass: "border-amber-500/30 bg-amber-950/40 text-amber-400",
    subLabel: `Closed · ${reason}`,
    istTime: timeStr,
  };
}

export function getInstrumentMarketStatus(stock?: StockDef | null, now: Date = new Date()): MarketStatus {
  const exchange = stock?.exchange || "NSE";
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utc + istOffset);

  const day = istDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const timeStr = istDate.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " IST";

  if (exchange === "CRYPTO") {
    return {
      isOpen: true,
      label: "LIVE 24/7 (CRYPTO)",
      badgeClass: "border-purple-500/35 bg-purple-950/40 text-purple-300",
      subLabel: "Crypto Market Open 24/7",
      istTime: timeStr,
    };
  }

  const isWeekday = day >= 1 && day <= 5;

  if (exchange === "MCX") {
    // MCX trading: 09:00 to 23:30 / 23:55 IST
    const isOpen = isWeekday && timeInMinutes >= 540 && timeInMinutes < 1410;
    return {
      isOpen,
      label: isOpen ? "LIVE (MCX)" : "MCX CLOSED (OFFICIAL CLOSE)",
      badgeClass: isOpen ? "border-amber-500/35 bg-amber-950/40 text-amber-300" : "border-slate-500/30 bg-slate-950/40 text-slate-400",
      subLabel: isOpen ? "Commodities Open" : "Closed",
      istTime: timeStr,
    };
  }

  if (exchange === "FOREX") {
    // Forex trading: 09:00 to 17:00 IST
    const isOpen = isWeekday && timeInMinutes >= 540 && timeInMinutes < 1020;
    return {
      isOpen,
      label: isOpen ? "LIVE (CDS FOREX)" : "FOREX CLOSED",
      badgeClass: isOpen ? "border-cyan-500/35 bg-cyan-950/40 text-cyan-300" : "border-slate-500/30 bg-slate-950/40 text-slate-400",
      subLabel: isOpen ? "Currency Open" : "Closed",
      istTime: timeStr,
    };
  }

  // NSE Equities
  const isOpen = isWeekday && timeInMinutes >= 555 && timeInMinutes < 930;
  return {
    isOpen,
    label: isOpen ? "LIVE (NSE)" : "MARKET CLOSED (OFFICIAL CLOSE)",
    badgeClass: isOpen ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400" : "border-amber-500/30 bg-amber-950/40 text-amber-400",
    subLabel: isOpen ? "Market Open" : "Official Close",
    istTime: timeStr,
  };
}
