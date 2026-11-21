"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle, Timeframe } from "@/lib/market/engine";
import { sma } from "@/lib/market/engine";

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
    const padR = 64;
    const padT = 14;
    const volH = Math.min(64, H * 0.16);
    const padB = volH + 24;
    const chartW = W - padR - 8;

    const view = candles;
    const n = view.length;
    const step = chartW / n;
    const bodyW = Math.max(2, Math.min(10, step * 0.62));

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
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
    const y = (p: number) => padT + ((hi - p) / (hi - lo)) * (H - padT - padB);
    const maxVol = Math.max(...view.map((c) => c.volume));
    const vy = (v: number) => H - 24 - (v / maxVol) * volH;

    ctx.clearRect(0, 0, W, H);

    // watermark
    ctx.font = "700 34px var(--font-geist-sans), sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    ctx.textAlign = "center";
    ctx.fillText(`${symbol} · NSE`, chartW / 2, H / 2 - 12);
    ctx.font = "500 12px var(--font-geist-mono), monospace";
    ctx.fillText(`${timeframe} · CANDLES`, chartW / 2, H / 2 + 12);

    // horizontal grid + price axis
    ctx.font = "400 10.5px var(--font-geist-mono), monospace";
    ctx.textAlign = "left";
    const gridN = 6;
    for (let i = 0; i <= gridN; i++) {
      const p = lo + ((hi - lo) * i) / gridN;
      const gy = y(p);
      ctx.strokeStyle = GRID;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(chartW, gy);
      ctx.stroke();
      ctx.fillStyle = TEXT;
      ctx.fillText(p.toFixed(p > 1000 ? 1 : 2), chartW + 6, gy + 3.5);
    }

    // vertical grid lines every ~10 candles
    for (let i = 0; i < n; i += 10) {
      const gx = i * step + step / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, H - 24);
      ctx.stroke();
    }

    // candles + volume
    view.forEach((c, i) => {
      const cx = i * step + step / 2;
      const up = c.close >= c.open;
      const col = up ? UP : DOWN;
      // volume
      ctx.fillStyle = up ? "rgba(14,203,129,0.28)" : "rgba(246,70,93,0.28)";
      const vy0 = vy(c.volume);
      ctx.fillRect(cx - bodyW / 2, vy0, bodyW, H - 24 - vy0);
      // wick
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, y(c.high));
      ctx.lineTo(cx, y(c.low));
      ctx.stroke();
      // body
      const yo = y(c.open);
      const yc = y(c.close);
      const top = Math.min(yo, yc);
      const hgt = Math.max(1.5, Math.abs(yc - yo));
      ctx.fillStyle = col;
      ctx.fillRect(cx - bodyW / 2, top, bodyW, hgt);
    });

    // moving averages
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

    // last price line + tag
    const lp = y(price);
    if (lp > padT && lp < H - padB) {
      ctx.strokeStyle = "rgba(240,185,11,0.65)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lp);
      ctx.lineTo(chartW, lp);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f0b90b";
      const label = price.toFixed(2);
      ctx.font = "600 10.5px var(--font-geist-mono), monospace";
      const tw = ctx.measureText(label).width + 10;
      ctx.beginPath();
      ctx.roundRect(chartW + 2, lp - 9, Math.max(tw, padR - 6), 18, 4);
      ctx.fill();
      ctx.fillStyle = "#0a0c10";
      ctx.fillText(label, chartW + 7, lp + 3.5);
    }

    // crosshair
    if (hover) {
      const cx = hover.index * step + step / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, H - 24);
      ctx.moveTo(0, hover.y);
      ctx.lineTo(chartW, hover.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, size, hover, price, symbol, timeframe, maSeries, showMa]);

  const onMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const rect = canvas.getBoundingClientRect();
    const chartW = rect.width - 72;
    const x = e.clientX - rect.left;
    const yv = e.clientY - rect.top;
    const idx = Math.max(0, Math.min(candles.length - 1, Math.floor((x / chartW) * candles.length)));
    setHover({ index: idx, x, y: yv });
  };

  const hoverCandle = hover ? candles[hover.index] : null;
  const prev = hover && hover.index > 0 ? candles[hover.index - 1] : null;
  const hoverUp = hoverCandle ? hoverCandle.close >= hoverCandle.open : true;

  return (
    <div ref={wrapRef} className="relative h-full w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair" />
      {showMa && (
        <div className="pointer-events-none absolute left-3 top-2 flex items-center gap-3 font-mono text-[10px]">
          <span className="text-amber-400">MA20</span>
          <span className="text-white/45">MA50</span>
        </div>
      )}
      <button
        onClick={() => setShowMa((s) => !s)}
        className="absolute right-[76px] top-2 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-white/60 backdrop-blur transition hover:text-white"
      >
        {showMa ? "Hide MA" : "Show MA"}
      </button>
      {hover && hoverCandle && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-[#0d1016]/95 px-3 py-2 font-mono text-[11px] shadow-xl backdrop-blur"
          style={{ left: Math.min(hover.x + 14, size.w - 190), top: 12 }}
        >
          <div className="mb-1 text-[10px] text-white/50">
            {new Date(hoverCandle.time).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-white/50">O</span>
            <span className="text-right text-white/85">{hoverCandle.open.toFixed(2)}</span>
            <span className="text-white/50">H</span>
            <span className="text-right text-white/85">{hoverCandle.high.toFixed(2)}</span>
            <span className="text-white/50">L</span>
            <span className="text-right text-white/85">{hoverCandle.low.toFixed(2)}</span>
            <span className="text-white/50">C</span>
            <span className={`text-right ${hoverUp ? "text-emerald-400" : "text-rose-400"}`}>
              {hoverCandle.close.toFixed(2)}
            </span>
          </div>
          {prev && (
            <div className={`mt-1 ${hoverUp ? "text-emerald-400" : "text-rose-400"}`}>
              {(((hoverCandle.close - prev.close) / prev.close) * 100).toFixed(2)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
