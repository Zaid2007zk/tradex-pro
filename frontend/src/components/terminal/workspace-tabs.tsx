"use client";

import {
  BookOpen,
  BrainCircuit,
  FlaskConical,
  LayoutDashboard,
  NotebookPen,
  Table2,
  Bot,
  Radar,
  Scale,
} from "lucide-react";

export type Workspace =
  | "terminal"
  | "options"
  | "multi"
  | "algo"
  | "backtest"
  | "journal"
  | "academy"
  | "autopilot"
  | "shariah";

const TABS: { key: Workspace; label: string; icon: React.ReactNode }[] = [
  { key: "terminal", label: "Chart & Terminal", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { key: "options", label: "Options Chain", icon: <Table2 className="h-3.5 w-3.5" /> },
  { key: "multi", label: "Multi-Chart", icon: <LayoutDashboard className="h-3.5 w-3.5 rotate-90" /> },
  { key: "algo", label: "Algo Studio", icon: <Bot className="h-3.5 w-3.5" /> },
  { key: "backtest", label: "Strategy Backtest", icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { key: "journal", label: "Journal", icon: <NotebookPen className="h-3.5 w-3.5" /> },
  { key: "academy", label: "Academy", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "autopilot", label: "AI Autopilot", icon: <Radar className="h-3.5 w-3.5" /> },
  { key: "shariah", label: "Shariah Screener", icon: <Scale className="h-3.5 w-3.5 text-emerald-400" /> },
];

export default function WorkspaceTabs({
  active,
  onChange,
}: {
  active: Workspace;
  onChange: (w: Workspace) => void;
}) {
  return (
    <nav
      aria-label="Workspace"
      className="tx-scroll flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-white/8 bg-[#0d1016]/80 px-1.5 py-1.5 backdrop-blur"
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold tracking-wide transition ${
              isActive
                ? "bg-amber-500/15 text-amber-300 shadow-[inset_0_0_0_1px_rgba(240,185,11,0.25)]"
                : "text-white/50 hover:bg-white/5 hover:text-white/85"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
      <div className="ml-auto hidden shrink-0 items-center gap-2 pr-2 2xl:flex">
        <BrainCircuit className="h-3.5 w-3.5 text-amber-400/70" />
        <span className="text-[10px] text-white/40">
          Aria is watching <span className="font-mono text-white/65">20 scripts</span> · Gemini-grade reasoning
        </span>
      </div>
    </nav>
  );
}
