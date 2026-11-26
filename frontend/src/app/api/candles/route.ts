import { NextResponse } from "next/server";
import { STOCKS, generateCandles, type Candle, type Timeframe, r2 } from "@/lib/market/engine";

export const maxDuration = 20;

const BINANCE_SYMBOLS: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
};

const YAHOO_MAP: Record<string, string[]> = {
  RELIANCE: ["RELIANCE.NS"],
  TCS: ["TCS.NS"],
  HDFCBANK: ["HDFCBANK.NS"],
  ICICIBANK: ["ICICIBANK.NS"],
  INFY: ["INFY.NS"],
  BHARTIARTL: ["BHARTIARTL.NS"],
  SBIN: ["SBIN.NS"],
  ITC: ["ITC.NS"],
  LT: ["LT.NS"],
  HINDUNILVR: ["HINDUNILVR.NS"],
  KOTAKBANK: ["KOTAKBANK.NS"],
  AXISBANK: ["AXISBANK.NS"],
  MARUTI: ["MARUTI.NS"],
  SUNPHARMA: ["SUNPHARMA.NS"],
  HCLTECH: ["HCLTECH.NS"],
  TATAMOTORS: ["TMCV.NS", "TATAMOTORS.NS"],
  ADANIENT: ["ADANIENT.NS"],
  TITAN: ["TITAN.NS"],
  WIPRO: ["WIPRO.NS"],
  ETERNAL: ["ZOMATO.NS", "ETERNAL.NS"],
  GOLD: ["GOLDBEES.NS", "GC=F"],
  SILVER: ["SILVERBEES.NS", "SI=F"],
  CRUDEOIL: ["CL=F"],
  NATURALGAS: ["NG=F"],
  COPPER: ["HG=F"],
  USDINR: ["USDINR=X"],
  EURINR: ["EURINR=X"],
  GBPINR: ["GBPINR=X"],
  JPYINR: ["JPYINR=X"],
  NVDA: ["NVDA"],
  AAPL: ["AAPL"],
  TSLA: ["TSLA"],
  MSFT: ["MSFT"],
  GOOGL: ["GOOGL"],
  AMZN: ["AMZN"],
  META: ["META"],
  GIFTNIFTY: ["^NSEI"],
  INDIA10Y: ["^TNX"],
  SGB: ["GOLDBEES.NS", "GC=F"],
  JEERA: ["GOLDBEES.NS"],
};

const candleCache = new Map<string, { ts: number; source: string; candles: Candle[] }>();

async function fetchUsdInr(): Promise<number> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1d", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      const px = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (typeof px === "number" && px > 50) return px;
    }
  } catch {}
  return 84.5;
}

async function fetchBinanceKlines(symbol: string, tf: Timeframe): Promise<Candle[] | null> {
  const pair = BINANCE_SYMBOLS[symbol];
  if (!pair) return null;

  const intervalMap: Record<Timeframe, { interval: string; limit: number }> = {
    "1s": { interval: "1s", limit: 60 },
    "1m": { interval: "1m", limit: 75 },
    "5m": { interval: "5m", limit: 78 },
    "15m": { interval: "15m", limit: 78 },
    "1H": { interval: "1h", limit: 72 },
    "1D": { interval: "1d", limit: 78 },
    "1W": { interval: "1w", limit: 64 },
    "1M": { interval: "1M", limit: 48 },
  };
  const cfg = intervalMap[tf];
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${pair}&interval=${cfg.interval}&limit=${cfg.limit}`;

  try {
    const [res, usdInr] = await Promise.all([
      fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 15 } }),
      fetchUsdInr(),
    ]);
    if (!res.ok) return null;
    const rows = (await res.json()) as unknown[][];
    if (!Array.isArray(rows) || rows.length < 10) return null;

    return rows.map((k) => ({
      time: Number(k[0]),
      open: r2(parseFloat(String(k[1])) * usdInr),
      high: r2(parseFloat(String(k[2])) * usdInr),
      low: r2(parseFloat(String(k[3])) * usdInr),
      close: r2(parseFloat(String(k[4])) * usdInr),
      volume: Math.max(1, Math.round(parseFloat(String(k[5])))),
    }));
  } catch {
    return null;
  }
}

async function fetchYahooCandles(symbol: string, tf: Timeframe): Promise<Candle[] | null> {
  const candidates = YAHOO_MAP[symbol] || [`${symbol}.NS`];
  const cfgMap: Record<Timeframe, { range: string; interval: string }> = {
    "1s": { range: "1d", interval: "1m" },
    "1m": { range: "1d", interval: "1m" },
    "5m": { range: "5d", interval: "5m" },
    "15m": { range: "5d", interval: "15m" },
    "1H": { range: "1mo", interval: "1h" },
    "1D": { range: "3mo", interval: "1d" },
    "1W": { range: "1y", interval: "1wk" },
    "1M": { range: "2y", interval: "1mo" },
  };
  const cfg = cfgMap[tf];

  for (const ticker of candidates) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${cfg.range}&interval=${cfg.interval}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        next: { revalidate: 30 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      const timestamps: number[] | undefined = result?.timestamp;
      const q = result?.indicators?.quote?.[0];
      if (!timestamps || !q || timestamps.length < 10) continue;

      const out: Candle[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const o = q.open?.[i];
        const h = q.high?.[i];
        const l = q.low?.[i];
        const c = q.close?.[i];
        const v = q.volume?.[i] ?? 100000;
        if (
          typeof o !== "number" ||
          typeof h !== "number" ||
          typeof l !== "number" ||
          typeof c !== "number" ||
          !Number.isFinite(c) ||
          c <= 0
        ) {
          continue;
        }
        // Smart MCX ETF scaling if needed
        const scale = symbol === "GOLD" && c < 1000 ? 755.4 : symbol === "SILVER" && c < 1000 ? 1000 : 1;
        out.push({
          time: timestamps[i] * 1000,
          open: r2(o * scale),
          high: r2(h * scale),
          low: r2(l * scale),
          close: r2(c * scale),
          volume: Math.max(1, Math.round(v)),
        });
      }
      if (out.length >= 12) {
        return out.slice(-84);
      }
    } catch {}
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "RELIANCE").toUpperCase();
  const tfRaw = searchParams.get("timeframe") || "1D";
  const validTfs: Timeframe[] = ["1s", "1m", "5m", "15m", "1H", "1D", "1W", "1M"];
  const tf: Timeframe = validTfs.find((t) => t.toLowerCase() === tfRaw.toLowerCase()) ?? "1D";

  const cacheTtl = tf === "1s" ? 3000 : tf === "1m" ? 8000 : 30000;
  const cacheKey = `${symbol}:${tf}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < cacheTtl) {
    return NextResponse.json({
      ok: true,
      symbol,
      timeframe: tf,
      source: cached.source,
      candles: cached.candles,
    });
  }

  let candles: Candle[] | null = null;
  let source = "calibrated_simulation";

  if (BINANCE_SYMBOLS[symbol]) {
    candles = await fetchBinanceKlines(symbol, tf);
    if (candles) source = "binance_vision_klines";
  } else {
    candles = await fetchYahooCandles(symbol, tf);
    if (candles) source = "yahoo_historical";
  }

  if (!candles || candles.length === 0) {
    const def = STOCKS.find((s) => s.symbol === symbol);
    candles = generateCandles(symbol, tf, def?.base);
    source = "calibrated_simulation";
  }

  candleCache.set(cacheKey, { ts: Date.now(), source, candles });

  return NextResponse.json({
    ok: true,
    symbol,
    timeframe: tf,
    source,
    candles,
  });
}
