"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle, Timeframe } from "@/lib/market/engine";
import { sma, detectChartPatterns, STOCKS } from "@/lib/market/engine";
import { Sparkles } from "lucide-react";

type Props = {
  symbol: string;
  candles: Candle[];
  timeframe: Timeframe;
  price: number;
};

type Hover = { index: number; x: number; y: number } | null;

const UP = "#0ecb81";
const DOWN = "#f6465d";
const GRID = "rgba(255,255,255,0.05)";
const TEXT = "rgba(230,233,239,0.55)";

export default function CandleChart({ symbol, candles, timeframe, price }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<Hover>(null);
  const [showMa, setShowMa] = useState(true);
  const [showAiLevels, setShowAiLevels] = useState(true);

  const def = useMemo(() => STOCKS.find((s) => s.symbol === symbol) || STOCKS[0], [symbol]);
  const currSym = def.currency === "USD" ? "$" : "₹";
  const patternResult = useMemo(() => detectChartPatterns(candles, currSym), [candles, currSym]);

  // Smooth crosshair reset on symbol or timeframe transition
  useEffect(() => {
    setHover(null);
  }, [symbol, timeframe]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const maSeries = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const ma20: (number | null)[] = [];
    const ma50: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      ma20.push(i >= 19 ? sma(closes.slice(0, i + 1), 20) : null);
      ma50.push(i >= 49 ? sma(closes.slice(0, i + 1), 50) : null);
    }
    return { ma20, ma50 };
  }, [candles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w || !size.h || candles.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = size.w;
    const H = size.h;
    const padR = 74; // Dedicated width for Y-axis price scale
    const padT = 12; // Breathing room on top
    const volH = Math.min(26, H * 0.10); // Compact volume bars
    const padB = volH + 20; // Clear separation above volume
    const chartW = W - padR; // Right boundary of chart grid
    const rightOffset = Math.max(38, Math.min(54, chartW * 0.08)); // TradingView-style breathing room after latest candle
    const candleAreaW = chartW - rightOffset;

    const view = candles;
    const n = view.length;
    const step = candleAreaW / n;
    const bodyW = Math.max(2.5, Math.min(8.5, step * 0.65));

    let lo = Infinity;
    let hi = -Infinity;
    for (const c of view) {
      lo = Math.min(lo, c.low);
      hi = Math.max(hi, c.high);
    }
    if (showMa) {
      for (const v of maSeries.ma20) if (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      for (const v of maSeries.ma50) if (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    }
    if (price > 0) {
      lo = Math.min(lo, price);
      hi = Math.max(hi, price);
    }
    if (showAiLevels && patternResult) {
      if (patternResult.resistance > 0) hi = Math.max(hi, patternResult.resistance);
      if (patternResult.support > 0) lo = Math.min(lo, patternResult.support);
    }

    // Comfortable 12% vertical margin so candles never hit top or bottom bounds
    const pad = Math.max((hi - lo) * 0.12, 1.0);
    lo -= pad;
    hi += pad;
    const y = (p: number) => padT + ((hi - p) / (hi - lo)) * (H - padT - padB);
    const maxVol = Math.max(...view.map((c) => c.volume), 1);
    const vy = (v: number) => H - 18 - (v / maxVol) * volH;

    ctx.clearRect(0, 0, W, H);

    // Dedicated right-side Y-axis background strip
    ctx.fillStyle = "rgba(10, 13, 20, 0.45)";
    ctx.fillRect(chartW, 0, padR, H);

    // Subtle vertical separator line between chart and price scale
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartW, 0);
    ctx.lineTo(chartW, H);
    ctx.stroke();

    // Subtle watermark centered in candle area
    ctx.font = "700 32px var(--font-geist-sans), sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.textAlign = "center";
    ctx.fillText(`${symbol} · NSE`, candleAreaW / 2, H / 2 - 12);
    ctx.font = "500 11px var(--font-geist-mono), monospace";
    ctx.fillText(`${timeframe} · CANDLES`, candleAreaW / 2, H / 2 + 10);

    // Badge Y positions for smart collision detection
    const lp = y(price);
    const hasLp = lp >= padT && lp <= H - padB;
    const ry = (showAiLevels && patternResult && patternResult.resistance > 0) ? y(patternResult.resistance) : null;
    const hasRy = ry !== null && ry >= padT && ry <= H - padB;
    const sy = (showAiLevels && patternResult && patternResult.support > 0) ? y(patternResult.support) : null;
    const hasSy = sy !== null && sy >= padT && sy <= H - padB;

    // Horizontal grid lines across chart & collision-free labels on Y-axis
    ctx.font = "400 10.5px var(--font-geist-mono), monospace";
    ctx.textAlign = "left";
    const gridN = Math.max(3, Math.min(5, Math.floor((H - padT - padB) / 60)));
    for (let i = 0; i <= gridN; i++) {
      const p = lo + ((hi - lo) * i) / gridN;
      const gy = y(p);

      // Grid line only across chart area
      ctx.strokeStyle = GRID;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(chartW, gy);
      ctx.stroke();

      // Smart collision suppression: Skip grid label if within 15px of any active badge
      const nearLp = hasLp && Math.abs(gy - lp) < 15;
      const nearRy = hasRy && Math.abs(gy - ry!) < 15;
      const nearSy = hasSy && Math.abs(gy - sy!) < 15;

      if (!nearLp && !nearRy && !nearSy) {
        ctx.fillStyle = TEXT;
        ctx.fillText(p.toFixed(p > 1000 ? 1 : 2), chartW + 8, gy + 3.5);
      }
    }

    // Vertical grid lines every 10 candles
    for (let i = 0; i < n; i += 10) {
      const gx = i * step + step / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, H - 18);
      ctx.stroke();
    }

    // Candles + Volume
    view.forEach((c, i) => {
      const cx = i * step + step / 2;
      const up = c.close >= c.open;
      const col = up ? UP : DOWN;

      // Volume bar
      ctx.fillStyle = up ? "rgba(14,203,129,0.22)" : "rgba(246,70,93,0.22)";
      const vy0 = vy(c.volume);
      ctx.fillRect(cx - bodyW / 2, vy0, bodyW, H - 18 - vy0);

      // Wick
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, y(c.high));
      ctx.lineTo(cx, y(c.low));
      ctx.stroke();

      // Body with subtle roundness
      const yo = y(c.open);
      const yc = y(c.close);
      const top = Math.min(yo, yc);
      const hgt = Math.max(1.5, Math.abs(yc - yo));
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(cx - bodyW / 2, top, bodyW, hgt, 0.8);
      ctx.fill();
    });

    // Moving averages
    const drawLine = (series: (number | null)[], color: string, width: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      series.forEach((v, i) => {
        if (v == null) return;
        const px = i * step + step / 2;
        const py = y(v);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      });
      ctx.stroke();
    };
    if (showMa) {
      drawLine(maSeries.ma20, "rgba(240,185,11,0.85)", 1.4);
      drawLine(maSeries.ma50, "rgba(230,233,239,0.4)", 1.2);
    }

    // Last price line extending smoothly across empty gap to badge
    if (hasLp) {
      ctx.strokeStyle = "rgba(240,185,11,0.7)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lp);
      ctx.lineTo(chartW, lp);
      ctx.stroke();
      ctx.setLineDash([]);

      // Solid yellow badge on Y-axis
      const label = price.toFixed(2);
      ctx.font = "700 10.5px var(--font-geist-mono), monospace";
      const tw = ctx.measureText(label).width + 12;
      const bw = Math.max(tw, padR - 8);
      ctx.fillStyle = "#f0b90b";
      ctx.beginPath();
      ctx.roundRect(chartW + 4, lp - 9, bw, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#090c12";
      ctx.fillText(label, chartW + 9, lp + 3.5);
    }

    // AI Support & Resistance Levels (Solid high-contrast containers with zero bleed-through)
    if (showAiLevels && patternResult) {
      if (hasRy && ry !== null) {
        ctx.strokeStyle = "rgba(246,70,93,0.65)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(chartW, ry);
        ctx.stroke();
        ctx.setLineDash([]);

        // Solid opaque dark-red background
        ctx.fillStyle = "#200b11";
        ctx.strokeStyle = "rgba(248,113,113,0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chartW + 4, ry - 8.5, padR - 8, 17, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fca5a5";
        ctx.font = "700 9px var(--font-geist-mono), monospace";
        ctx.fillText(`RES ${currSym}${patternResult.resistance}`, chartW + 7, ry + 3.5);
      }

      if (hasSy && sy !== null) {
        ctx.strokeStyle = "rgba(14,203,129,0.65)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(chartW, sy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Solid opaque dark-green background
        ctx.fillStyle = "#081d13";
        ctx.strokeStyle = "rgba(74,222,128,0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chartW + 4, sy - 8.5, padR - 8, 17, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#86efac";
        ctx.font = "700 9px var(--font-geist-mono), monospace";
        ctx.fillText(`SUP ${currSym}${patternResult.support}`, chartW + 7, sy + 3.5);
      }
    }

    // Crosshair with price pill on Y-axis
    if (hover) {
      const cx = hover.index * step + step / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, H - 18);
      ctx.moveTo(0, hover.y);
      ctx.lineTo(chartW, hover.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw hover price pill on Y-axis if within chart bounds
      if (hover.y >= padT && hover.y <= H - padB) {
        const hoverPrice = hi - ((hover.y - padT) / (H - padT - padB)) * (hi - lo);
        const hpLabel = hoverPrice.toFixed(hoverPrice > 1000 ? 1 : 2);
        ctx.fillStyle = "#1e2430";
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chartW + 4, hover.y - 8, padR - 8, 16, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 9px var(--font-geist-mono), monospace";
        ctx.fillText(hpLabel, chartW + 8, hover.y + 3.5);
      }
    }
  }, [candles, size, hover, price, symbol, timeframe, maSeries, showMa, showAiLevels, patternResult, currSym]);

  const onMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const rect = canvas.getBoundingClientRect();
    const padR = 74;
    const chartW = rect.width - padR;
    const rightOffset = Math.max(38, Math.min(54, chartW * 0.08));
    const candleAreaW = chartW - rightOffset;
    const x = e.clientX - rect.left;
    const yv = e.clientY - rect.top;

    if (x > candleAreaW + 15) {
      setHover(null);
      return;
    }
    const clampedX = Math.max(0, Math.min(candleAreaW, x));
    const idx = Math.max(0, Math.min(candles.length - 1, Math.floor((clampedX / candleAreaW) * candles.length)));
    setHover({ index: idx, x: clampedX, y: yv });
  };

  const hoverCandle = hover ? candles[hover.index] : null;
  const prev = hover && hover.index > 0 ? candles[hover.index - 1] : null;
  const hoverUp = hoverCandle ? hoverCandle.close >= hoverCandle.open : true;

  return (
    <div ref={wrapRef} className="relative h-full w-full select-none" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair" />

      {/* Top Legend Bar (TradingView style: clean, horizontal, never covers candles or price axis!) */}
      <div className="pointer-events-none absolute left-3 top-2 right-[215px] flex items-center gap-3 text-[10.5px] font-mono z-10 overflow-hidden">
        {showMa && (
          <div className="flex items-center gap-1.5 text-[9.5px] shrink-0">
            <span className="text-amber-400 font-semibold">MA20</span>
            <span className="text-white/40 font-semibold">MA50</span>
          </div>
        )}

        {/* Live OHLC Bar on Hover (clean, inline, zero-overlap) */}
        {hover && hoverCandle ? (
          <div className="flex items-center gap-2.5 text-[10px] tabular-nums shrink-0">
            <span className="text-white/40">
              {new Date(hoverCandle.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span><span className="text-white/35">O:</span> {hoverCandle.open.toFixed(1)}</span>
            <span><span className="text-white/35">H:</span> {hoverCandle.high.toFixed(1)}</span>
            <span><span className="text-white/35">L:</span> {hoverCandle.low.toFixed(1)}</span>
            <span className={hoverUp ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
              <span className="text-white/35">C:</span> {hoverCandle.close.toFixed(1)}
            </span>
            {prev && (
              <span className={`font-semibold ${hoverUp ? "text-emerald-400" : "text-rose-400"}`}>
                {hoverUp ? "+" : ""}{(((hoverCandle.close - prev.close) / prev.close) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        ) : showAiLevels && patternResult ? (
          <div className="flex items-center gap-1.5 rounded border border-purple-500/30 bg-[#0d1016]/90 px-2 py-0.5 text-[9.5px] font-sans font-medium backdrop-blur shrink-0">
            <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-semibold">{patternResult.pattern}</span>
            <span
              className={`font-mono font-bold text-[9px] ${
                patternResult.bias === "BULLISH"
                  ? "text-emerald-400"
                  : patternResult.bias === "BEARISH"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              ({patternResult.confidence}%)
            </span>
          </div>
        ) : null}
      </div>

      {/* Control Buttons (Right aligned outside the Y-axis scale) */}
      <div className="absolute right-[82px] top-2 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setShowAiLevels((s) => !s)}
          className={`rounded border px-2 py-0.5 text-[10px] font-semibold backdrop-blur transition ${
            showAiLevels
              ? "border-purple-500/40 bg-purple-500/20 text-purple-200"
              : "border-white/10 bg-black/40 text-white/50 hover:text-white"
          }`}
          title="Toggle AI Support / Resistance Levels & Chart Patterns"
        >
          {showAiLevels ? "AI Levels ON" : "AI Levels OFF"}
        </button>
        <button
          onClick={() => setShowMa((s) => !s)}
          className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-white/60 backdrop-blur transition hover:text-white"
        >
          {showMa ? "Hide MA" : "Show MA"}
        </button>
      </div>
    </div>
  );
}
