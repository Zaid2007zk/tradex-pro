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

const MODES: { key: Mode; label: string }[] = [
  { key: "all", label: "NIFTY 50" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
];

export default function Watchlist({ quotes, selected, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let list = STOCKS.filter(
      (s) =>
        !q.trim() ||
        s.symbol.toLowerCase().includes(q.trim().toLowerCase()) ||
        s.name.toLowerCase().includes(q.trim().toLowerCase())
    );
    list = list.map((s) => ({ def: s, quote: quotes[s.symbol] }));
    if (mode === "gainers") list.sort((a, b) => b.quote.chgPct - a.quote.chgPct);
    if (mode === "losers") list.sort((a, b) => a.quote.chgPct - b.quote.chgPct);
    return list;
  }, [mode, q, quotes]);

  const advancers = STOCKS.filter((s) => quotes[s.symbol].chgPct >= 0).length;

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
              NSE <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 border-white/10 bg-[#0f1219] p-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <Clock className="h-3.5 w-3.5 text-emerald-400" /> Exchange Timings
            </div>
            <div className="mt-2 space-y-1.5 font-mono text-[11px] text-white/60">
              <div className="flex justify-between"><span>NSE · BSE Equity</span><span className="text-white/85">09:15 – 15:30 IST</span></div>
              <div className="flex justify-between"><span>Pre-open</span><span className="text-white/85">09:00 – 09:15 IST</span></div>
              <div className="flex justify-between"><span>Post-close</span><span className="text-white/85">15:40 – 16:00 IST</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" /> Upcoming Holidays
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-white/60">
              <div className="flex justify-between"><span>Republic Day</span><span className="text-white/85">Jan 26</span></div>
              <div className="flex justify-between"><span>Independence Day</span><span className="text-white/85">Aug 15</span></div>
              <div className="flex justify-between"><span>Gandhi Jayanti</span><span className="text-white/85">Oct 02</span></div>
              <div className="flex justify-between"><span>Christmas</span><span className="text-white/85">Dec 25</span></div>
            </div>
            <p className="mt-2.5 text-[9.5px] text-white/30">Session is simulated — feed runs 24×7 for practice.</p>
          </PopoverContent>
        </Popover>
      </div>

      {/* search */}
      <div className="px-3 pb-2 pt-2.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter symbols…"
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
                  {fmtPrice(quote.price)}
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
