"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, Lightbulb, Sparkles, AlertTriangle } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  mins: number;
  desc: string;
  sections: { heading: string; points: string[] }[];
  example: string;
  mistake: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

const LESSONS: Lesson[] = [
  {
    id: "candlesticks",
    title: "Reading Candlesticks",
    level: "Beginner",
    mins: 6,
    desc: "Bodies, wicks and rejection — how a single candle tells a story about buyers vs sellers.",
    sections: [
      {
        heading: "1. Anatomy of a Candle (OHLC)",
        points: [
          "Open & Close form the thick Body: Green (bullish) means Close > Open; Red (bearish) means Close < Open.",
          "High & Low form the thin Wicks (shadows): they show the extreme prices tested during that timeframe.",
          "A long lower wick at support shows buyers stepped in aggressively and rejected lower prices.",
        ],
      },
      {
        heading: "2. High-Probability Patterns",
        points: [
          "Hammer / Pin Bar: Small body at top, long lower wick (2x+ body) — signals bullish reversal near support.",
          "Bullish Engulfing: A strong green candle whose body completely covers the previous red candle.",
          "Doji: Open ≈ Close — indicates indecision between buyers and sellers before a big move.",
        ],
      },
    ],
    example: "Suppose RELIANCE drops to ₹1,327 support, leaves a long lower wick, and closes green near ₹1,340. That rejection wick shows institutional buyers absorbed the selling pressure.",
    mistake: "Trading a single Hammer or Doji in the middle of nowhere without checking Support/Resistance or Volume.",
    quiz: {
      question: "What does a long lower wick near a strong support level usually indicate?",
      options: [
        "Sellers are in complete control",
        "Buyers rejected lower prices and stepped in",
        "The market is closed",
      ],
      correctIndex: 1,
      explanation: "A long lower wick shows price went down, but buyers pushed it back up before the candle closed — strong demand rejection.",
    },
  },
  {
    id: "support-resistance",
    title: "Support & Resistance",
    level: "Beginner",
    mins: 8,
    desc: "Why prices remember levels, and how to draw zones you can actually trade from.",
    sections: [
      {
        heading: "1. Zones, Not Thin Lines",
        points: [
          "Support is a demand zone where buyers historically step in and stop a fall.",
          "Resistance is a supply zone where sellers take profits and stall a rally.",
          "Always treat S/R as a price band (e.g., ₹1,398–₹1,405) rather than a single exact rupee.",
        ],
      },
      {
        heading: "2. Role Reversal Rule",
        points: [
          "Once Resistance breaks cleanly on high volume, it often turns into new Support on a pullback.",
          "Once Support breaks down, it acts as Resistance on any relief bounce.",
        ],
      },
    ],
    example: "If HDFCBANK faces rejection 3 times at ₹850 and finally breaks above ₹850 with 1.8x volume, ₹850 becomes your pullback buy zone with SL just below ₹842.",
    mistake: "Buying right into strong resistance before a confirmed breakout, or placing stop-loss right on the exact support number where stop-hunts happen.",
    quiz: {
      question: "When a strong resistance level is broken upward on high volume, what does it often become?",
      options: [
        "A new support zone on a retest",
        "Irrelevant forever",
        "An automatic sell signal",
      ],
      correctIndex: 0,
      explanation: "Under the Role Reversal principle, broken resistance frequently acts as new support when price retests it.",
    },
  },
  {
    id: "rsi-myths",
    title: "RSI Without the Myths",
    level: "Intermediate",
    mins: 10,
    desc: "Overbought doesn't mean sell. Learn divergence, range behaviour and RSI regimes.",
    sections: [
      {
        heading: "1. Stop Shorting Just Because RSI > 70",
        points: [
          "In a strong uptrend, RSI can stay between 60 and 85 for weeks while price keeps climbing.",
          "RSI > 70 simply confirms strong bullish momentum — never short blindly without a reversal trigger.",
        ],
      },
      {
        heading: "2. RSI Regimes & Divergence",
        points: [
          "Bullish Regime: RSI holds 40–45 as support on dips and pushes above 70 on rallies.",
          "Bearish Divergence: Price makes a Higher High, but RSI makes a Lower High — momentum is fading.",
          "Bullish Divergence: Price makes a Lower Low, but RSI makes a Higher Low — sellers are exhausting.",
        ],
      },
    ],
    example: "In TradeX PRO, if RELIANCE prints RSI 85 in a strong breakout, wait for a pullback toward MA20 instead of shorting against the trend.",
    mistake: "Selling a winning momentum stock solely because RSI crossed 70.",
    quiz: {
      question: "If price makes a Higher High while RSI makes a Lower High, what is this called?",
      options: [
        "Golden Cross",
        "Bearish Divergence (weakening momentum)",
        "Oversold Bounce",
      ],
      correctIndex: 1,
      explanation: "Bearish divergence warns that upside momentum is weakening even though price pushed slightly higher.",
    },
  },
  {
    id: "mis-cnc-mtf",
    title: "MIS vs CNC vs MTF",
    level: "Beginner",
    mins: 5,
    desc: "Intraday leverage, delivery and margin funding — what each product really costs you.",
    sections: [
      {
        heading: "1. Choosing the Right Product Type",
        points: [
          "MIS (Intraday · 5x): Requires only 20% margin, but positions auto-square off before market close (3:20 PM IST).",
          "CNC (Delivery · 1x): Pay 100% cash, hold stocks overnight or for years with zero interest cost.",
          "MTF (Margin Trading · 4x): Carry leveraged positions overnight across days, but incurs daily interest on borrowed funds.",
        ],
      },
      {
        heading: "2. Golden Rule of Leverage",
        points: [
          "5x MIS amplifies both profit AND loss by 5x — a 2% adverse move equals a 10% hit on your margin.",
          "Never use MIS without a predefined Stop-Loss.",
        ],
      },
    ],
    example: "With ₹1,00,000 capital: CNC lets you buy ₹1,00,000 worth of TCS. MIS (5x) gives ₹5,00,000 buying power for intraday only.",
    mistake: "Holding an MIS trade expecting it to turn around, only to get auto-squared off at 3:20 PM at a loss.",
    quiz: {
      question: "Which order product lets you hold stocks overnight with 100% cash and zero margin interest?",
      options: ["MIS (Intraday)", "CNC (Delivery)", "MTF (Margin Funding)"],
      correctIndex: 1,
      explanation: "CNC (Cash & Carry / Delivery) uses 100% capital with zero borrowing interest and no intraday square-off.",
    },
  },
  {
    id: "position-sizing",
    title: "Position Sizing & Risk",
    level: "Intermediate",
    mins: 12,
    desc: "The 1% rule, R-multiples and why survivability beats win rate in the long run.",
    sections: [
      {
        heading: "1. The 1% Capital Risk Rule",
        points: [
          "Never risk more than 1% to 2% of your total trading capital on a single trade.",
          "Formula: Quantity = (Max Risk in ₹) ÷ (Entry Price − Stop-Loss Price).",
          "Even 10 losing trades in a row only draw down ~10% if you follow the 1% rule.",
        ],
      },
      {
        heading: "2. Why Risk-to-Reward (R:R) Matters",
        points: [
          "With a 1:2 R:R ratio (risk ₹1,000 to make ₹2,000), you only need a 40% win rate to be profitable!",
          "Always define your Stop-Loss BEFORE clicking Buy or Sell.",
        ],
      },
    ],
    example: "On ₹10,00,000 TradeX paper capital, 1% max risk = ₹10,000. If your SL is ₹20 below entry, buy ₹10,000 ÷ ₹20 = 500 shares max.",
    mistake: "Buying random round quantities (like 1,000 shares) without checking how much money is lost if the Stop-Loss hits.",
    quiz: {
      question: "If your capital is ₹10,00,000 and you follow the 1% risk rule with a ₹25 stop-loss distance, what is your max quantity?",
      options: ["400 shares", "1,000 shares", "100 shares"],
      correctIndex: 0,
      explanation: "1% of ₹10,00,000 is ₹10,000 max risk. ₹10,000 ÷ ₹25 stop-loss distance = 400 shares.",
    },
  },
  {
    id: "options-basics",
    title: "Options Basics: CE & PE",
    level: "Advanced",
    mins: 15,
    desc: "Intrinsic vs time value, the Greeks in plain words, and why most buyers lose.",
    sections: [
      {
        heading: "1. Call (CE) vs Put (PE)",
        points: [
          "CE (Call Option): Gains value when the underlying index/stock moves UP above the strike price.",
          "PE (Put Option): Gains value when the underlying index/stock moves DOWN below the strike price.",
        ],
      },
      {
        heading: "2. Option Premium & Time Decay (Theta)",
        points: [
          "Option Premium = Intrinsic Value + Time Value.",
          "Theta (Time Decay): Every day closer to expiry, option buyers lose time value — accelerating sharply in the final week.",
          "Delta: Measures how much the option price moves for every ₹1 move in the underlying.",
        ],
      },
    ],
    example: "If NIFTY is at 25,350, a 25,400 CE is Out-of-The-Money (OTM) and has zero intrinsic value — 100% of its price is time value that decays daily.",
    mistake: "Buying far OTM options on expiry day hoping for a lottery jackpot — Theta decay wipes them out rapidly if price stalls.",
    quiz: {
      question: "Which Option Greek represents the daily loss in an option's value due to time passing?",
      options: ["Delta", "Theta", "Vega"],
      correctIndex: 1,
      explanation: "Theta measures time decay — the rate at which an option loses value as each day passes toward expiration.",
    },
  },
];

const STORAGE_KEY = "tradex_academy_completed";

export default function Academy() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCompleted(parsed);
      }
    } catch {}
  }, []);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const activeLesson = LESSONS.find((l) => l.id === activeId) ?? null;
  const pct = Math.round((completed.length / LESSONS.length) * 100);

  if (activeLesson) {
    const isDone = completed.includes(activeLesson.id);
    const quizAnswered = selectedOpt !== null;
    const quizCorrect = selectedOpt === activeLesson.quiz.correctIndex;

    return (
      <div className="tx-scroll h-full min-h-0 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto max-w-3xl space-y-4 pb-6">
          {/* Top Navigation */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveId(null);
                setSelectedOpt(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-[11.5px] font-semibold text-white/75 transition hover:border-amber-500/40 hover:text-amber-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Academy
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10.5px] text-white/45">{activeLesson.mins} min read</span>
              <button
                type="button"
                onClick={() => markComplete(activeLesson.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isDone ? "Completed ✓" : "Mark Complete"}
              </button>
            </div>
          </div>

          {/* Lesson Header */}
          <div className="tx-panel p-5">
            <span
              className={`rounded px-2 py-0.5 text-[9.5px] font-bold tracking-wider ${
                activeLesson.level === "Beginner"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : activeLesson.level === "Intermediate"
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {activeLesson.level.toUpperCase()}
            </span>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-white">{activeLesson.title}</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">{activeLesson.desc}</p>
          </div>

          {/* Lesson Sections */}
          {activeLesson.sections.map((sec) => (
            <div key={sec.heading} className="tx-panel p-4 sm:p-5">
              <h3 className="text-[13.5px] font-bold text-amber-300">{sec.heading}</h3>
              <ul className="mt-2.5 space-y-2">
                {sec.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-white/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Real Market Example & Common Mistake */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-300">
                <Lightbulb className="h-4 w-4" /> Real Market Example
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/75">{activeLesson.example}</p>
            </div>
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-4">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-rose-300">
                <AlertTriangle className="h-4 w-4" /> Common Mistake
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/75">{activeLesson.mistake}</p>
            </div>
          </div>

          {/* Interactive Knowledge Check Quiz */}
          <div className="tx-panel border-purple-500/30 p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-purple-300">
              <Sparkles className="h-4 w-4" /> Quick Knowledge Check
            </div>
            <p className="mt-2 text-[12.5px] font-semibold text-white">{activeLesson.quiz.question}</p>
            <div className="mt-3 space-y-2">
              {activeLesson.quiz.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isRight = idx === activeLesson.quiz.correctIndex;
                let cls = "border-white/10 bg-white/4 text-white/75 hover:border-white/25 hover:text-white";
                if (quizAnswered) {
                  if (isRight) cls = "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
                  else if (isSelected) cls = "border-rose-500/50 bg-rose-500/15 text-rose-200";
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedOpt(idx);
                      if (idx === activeLesson.quiz.correctIndex) {
                        markComplete(activeLesson.id);
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2 text-left text-[12px] transition ${cls}`}
                  >
                    <span>{opt}</span>
                    {quizAnswered && isRight && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {quizAnswered && (
              <div
                className={`mt-3 rounded-lg border p-2.5 text-[11.5px] ${
                  quizCorrect
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                }`}
              >
                <strong>{quizCorrect ? "Correct! Lesson completed ✓ — " : "Not quite — "}</strong>
                {activeLesson.quiz.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <div className="font-mono text-[11px] text-amber-300">
            {completed.length} / {LESSONS.length} completed
          </div>
          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {LESSONS.map((l) => {
          const isDone = completed.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setActiveId(l.id);
                setSelectedOpt(null);
              }}
              className="tx-panel group cursor-pointer p-4 text-left transition hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(240,185,11,0.08)] active:scale-[0.99]"
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
                <div className="flex items-center gap-2">
                  {isDone && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" /> DONE
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-white/35">{l.mins} min</span>
                </div>
              </div>
              <h3 className="mt-2.5 text-[14px] font-bold tracking-tight transition group-hover:text-amber-300">
                {l.title}
              </h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/50">{l.desc}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300/80 group-hover:text-amber-300">
                <BookOpen className="h-3.5 w-3.5" /> {isDone ? "Review lesson" : "Start lesson"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
