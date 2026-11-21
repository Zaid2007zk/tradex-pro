"use client";

import { BookOpen, GraduationCap } from "lucide-react";

const LESSONS = [
  {
    title: "Reading Candlesticks",
    level: "Beginner",
    mins: 6,
    desc: "Bodies, wicks and rejection — how a single candle tells a story about buyers vs sellers.",
  },
  {
    title: "Support & Resistance",
    level: "Beginner",
    mins: 8,
    desc: "Why prices remember levels, and how to draw zones you can actually trade from.",
  },
  {
    title: "RSI Without the Myths",
    level: "Intermediate",
    mins: 10,
    desc: "Overbought doesn't mean sell. Learn divergence, range behaviour and RSI regimes.",
  },
  {
    title: "MIS vs CNC vs MTF",
    level: "Beginner",
    mins: 5,
    desc: "Intraday leverage, delivery and margin funding — what each product really costs you.",
  },
  {
    title: "Position Sizing & Risk",
    level: "Intermediate",
    mins: 12,
    desc: "The 1% rule, R-multiples and why survivability beats win rate in the long run.",
  },
  {
    title: "Options Basics: CE & PE",
    level: "Advanced",
    mins: 15,
    desc: "Intrinsic vs time value, the Greeks in plain words, and why most buyers lose.",
  },
];

export default function Academy() {
  return (
    <div className="tx-scroll h-full min-h-0 overflow-y-auto p-3">
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/12 to-transparent px-4 py-3">
        <GraduationCap className="h-6 w-6 text-amber-300" />
        <div>
          <div className="text-[14px] font-bold tracking-wide">TradeX Academy</div>
          <div className="text-[11px] text-white/50">
            6 structured lessons · finish with the paper-trading terminal for practice
          </div>
        </div>
        <div className="ml-auto hidden text-right sm:block">
          <div className="font-mono text-[11px] text-amber-300">0 / 6 completed</div>
          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[4%] rounded-full bg-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {LESSONS.map((l) => (
          <article
            key={l.title}
            className="tx-panel group cursor-pointer p-4 transition hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(240,185,11,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
                  l.level === "Beginner"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : l.level === "Intermediate"
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {l.level.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-white/35">{l.mins} min</span>
            </div>
            <h3 className="mt-2.5 text-[14px] font-bold tracking-tight transition group-hover:text-amber-300">
              {l.title}
            </h3>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/50">{l.desc}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300/80">
              <BookOpen className="h-3.5 w-3.5" /> Start lesson
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
