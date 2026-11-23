"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { STOCKS, fmtPct, fmtPrice } from "@/lib/market/engine";
import type { Quote } from "@/hooks/use-market";
import Sparkline from "./sparkline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (s: string) => void;
};

type Mode = "all" | "gainers" | "losers";
type Segment = "ALL" | "NSE" | "GLOBAL" | "MCX" | "FOREX" | "CRYPTO" | "BONDS";

const MODES: { key: Mode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
];

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NSE", label: "NSE" },
  { key: "GLOBAL", label: "US Tech" },
  { key: "MCX", label: "MCX / Agri" },
  { key: "FOREX", label: "Forex" },
  { key: "CRYPTO", label: "Crypto 24/7" },
  { key: "BONDS", label: "Bonds & SGB" },
];

export default function Watchlist({ quotes, selected, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>("all");
  const [segment, setSegment] = useState<Segment>("ALL");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const filtered = STOCKS.filter((s) => {
      const matchSegment = segment === "ALL" || (s.exchange || "NSE") === segment;
      const matchQuery =
        !q.trim() ||
        s.symbol.toLowerCase().includes(q.trim().toLowerCase()) ||
        s.name.toLowerCase().includes(q.trim().toLowerCase()) ||
        s.sector.toLowerCase().includes(q.trim().toLowerCase());
      return matchSegment && matchQuery;
    });
    const mapped = filtered.map((s) => ({ def: s, quote: quotes[s.symbol] }));
    if (mode === "gainers") mapped.sort((a, b) => (b.quote?.chgPct ?? 0) - (a.quote?.chgPct ?? 0));
    if (mode === "losers") mapped.sort((a, b) => (a.quote?.chgPct ?? 0) - (b.quote?.chgPct ?? 0));
    return mapped;
  }, [mode, segment, q, quotes]);

  const advancers = STOCKS.filter((s) => (quotes[s.symbol]?.chgPct ?? 0) >= 0).length;

  return (
    <aside className="tx-panel flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="tx-panel-head flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[12.5px] font-semibold tracking-wide">Watchlist</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[9.5px] text-white/50">{STOCKS.length}</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-0.5 text-[11px] text-white/45 transition hover:text-white">
              {segment === "ALL" ? "Markets" : segment} <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-76 border-white/10 bg-[#0f1219] p-3 shadow-2xl z-50">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <Clock className="h-3.5 w-3.5 text-emerald-400" /> Exchange Trading Sessions
            </div>
            <div className="mt-2 space-y-1.5 font-mono text-[11px] text-white/60">
              <div className="flex justify-between"><span>NSE · BSE Equities</span><span className="text-white/85">09:15 – 15:30 IST</span></div>
              <div className="flex justify-between"><span>US Markets (NASDAQ/NYSE)</span><span className="text-blue-400">19:00 – 01:30 IST</span></div>
              <div className="flex justify-between"><span>MCX Commodities & Agri</span><span className="text-amber-400">09:00 – 23:30 IST</span></div>
              <div className="flex justify-between"><span>Forex CDS & Bonds</span><span className="text-cyan-400">09:00 – 17:00 IST</span></div>
              <div className="flex justify-between"><span>Crypto 24/7 Markets</span><span className="text-purple-400 font-bold">24 Hours / 7 Days</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" /> Upcoming Holidays
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-white/60">
              <div className="flex justify-between"><span>Republic Day</span><span className="text-white/85">Jan 26</span></div>
              <div className="flex justify-between"><span>Independence Day</span><span className="text-white/85">Aug 15</span></div>
              <div className="flex justify-between"><span>Gandhi Jayanti</span><span className="text-white/85">Oct 02</span></div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Segment Selector Tabs (NSE, MCX, Forex, Crypto) */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSegment(s.key)}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap transition ${
              segment === s.key
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-sm"
                : "text-white/45 hover:text-white/70 bg-white/4 border border-white/5"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* search */}
      <div className="px-3 pb-2 pt-1.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter symbols, commodities, crypto…"
          className="h-8 w-full rounded-md border border-white/10 bg-white/4 px-2.5 text-[12px] text-white/85 outline-none transition placeholder:text-white/30 focus:border-amber-500/50"
        />
      </div>

      {/* mode tabs + breadth */}
      <div className="flex items-center gap-1 px-3 pb-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`rounded-md px-2 py-1 text-[10.5px] font-semibold transition ${
              mode === m.key ? "bg-amber-500/15 text-amber-300" : "text-white/45 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mx-3 mb-2 flex items-center gap-1.5">
        <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${(advancers / STOCKS.length) * 100}%` }}
          />
          <div className="h-full flex-1 bg-rose-500" />
        </div>
        <span className="flex items-center gap-0.5 font-mono text-[9.5px] text-emerald-400">
          <TrendingUp className="h-2.5 w-2.5" /> {advancers}
        </span>
        <span className="flex items-center gap-0.5 font-mono text-[9.5px] text-rose-400">
          <TrendingDown className="h-2.5 w-2.5" /> {STOCKS.length - advancers}
        </span>
      </div>

      {/* rows */}
      <div className="tx-scroll tx-divide min-h-0 flex-1 overflow-y-auto">
        {rows.map(({ def, quote }) => {
          const up = quote.chgPct >= 0;
          const isSel = selected === def.symbol;
          return (
            <button
              key={def.symbol}
              onClick={() => onSelect(def.symbol)}
              className={`relative flex w-full items-center gap-2 px-3 py-2 text-left transition ${
                isSel ? "bg-amber-500/10" : "hover:bg-white/4"
              }`}
            >
              {isSel && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-amber-400" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[12.5px] font-semibold ${isSel ? "text-amber-300" : "text-white/90"}`}>
                    {def.symbol}
                  </span>
                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-semibold ${
                    def.exchange === "CRYPTO" ? "bg-purple-500/15 text-purple-300 border border-purple-500/25" :
                    def.exchange === "MCX" ? "bg-amber-500/15 text-amber-300 border border-amber-500/25" :
                    def.exchange === "FOREX" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" :
                    def.exchange === "GLOBAL" ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" :
                    def.exchange === "BONDS" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" :
                    "bg-white/6 text-white/40 border border-white/10"
                  }`}>
                    {def.exchange === "GLOBAL" ? "US" : def.exchange || "NSE"}
                  </span>
                </div>
                <div className="truncate text-[10px] text-white/35">{def.sector}</div>
              </div>
              <Sparkline data={quote.history} up={up} width={56} height={22} />
              <div className="w-20 text-right">
                <div
                  key={quote.price}
                  className={`rounded font-mono text-[12px] font-semibold tabular-nums ${
                    quote.tickDir === 1 ? "tx-flash-up" : quote.tickDir === -1 ? "tx-flash-down" : ""
                  }`}
                >
                  {def.currency === "USD" ? "$" : "₹"}{fmtPrice(quote.price)}
                </div>
                <div className={`font-mono text-[10.5px] font-medium tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmtPct(quote.chgPct)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
