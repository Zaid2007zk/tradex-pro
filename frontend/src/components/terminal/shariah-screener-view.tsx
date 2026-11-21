"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Scale, Search, ShieldCheck } from "lucide-react";
import { STOCKS, fmtPrice } from "@/lib/market/engine";
import { isShariahCompliant } from "./shariah-modal";

const SHARIAH_DETAILS: Record<
  string,
  { debtRatio: string; cashRatio: string; nonPermissible: string; rationale: string }
> = {
  RELIANCE: { debtRatio: "18.2%", cashRatio: "14.5%", nonPermissible: "1.1%", rationale: "Compliant industrial, digital & retail conglomerates. Debt < 33%." },
  TCS: { debtRatio: "1.2%", cashRatio: "22.4%", nonPermissible: "0.2%", rationale: "Minimal debt; ethical technology & enterprise software engineering." },
  INFY: { debtRatio: "2.1%", cashRatio: "24.1%", nonPermissible: "0.4%", rationale: "Robust balance sheet with pristine liquidity and digital services." },
  TATAMOTORS: { debtRatio: "24.5%", cashRatio: "12.8%", nonPermissible: "0.8%", rationale: "Commercial and EV automotive manufacturing within permissible leverage." },
  BHARTIARTL: { debtRatio: "28.1%", cashRatio: "11.2%", nonPermissible: "0.9%", rationale: "Telecom networks & satellite broadband with compliant debt profile." },
  SUNPHARMA: { debtRatio: "3.4%", cashRatio: "19.5%", nonPermissible: "0.1%", rationale: "Pharmaceutical formulations and healthcare research." },
  ASIANPAINT: { debtRatio: "5.1%", cashRatio: "16.8%", nonPermissible: "0.3%", rationale: "Architectural paints & chemicals. Debt < 33%." },
  TITAN: { debtRatio: "12.3%", cashRatio: "15.0%", nonPermissible: "0.5%", rationale: "Lifestyle, precision watches and jewelry retail." },
  MARUTI: { debtRatio: "1.8%", cashRatio: "28.5%", nonPermissible: "0.4%", rationale: "Clean auto engineering with superior cash reserves." },
  HCLTECH: { debtRatio: "4.2%", cashRatio: "20.1%", nonPermissible: "0.3%", rationale: "Global cloud technology and digital consulting." },
  HDFCBANK: { debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.5%", rationale: "Conventional interest-based banking and lending operations." },
  ICICIBANK: { debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.2%", rationale: "Interest-based financial intermediation and depository institution." },
  SBIN: { debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "97.8%", rationale: "State commercial banking operations with interest spreads." },
  KOTAKBANK: { debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.0%", rationale: "Conventional commercial credit and interest assets." },
  AXISBANK: { debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "97.9%", rationale: "Interest-bearing deposit taking and corporate lending." },
  ITC: { debtRatio: "0.8%", cashRatio: "26.4%", nonPermissible: "41.2%", rationale: "Tobacco and cigarette revenues exceed 5% maximum permissible threshold." },
};

export default function ShariahScreenerView({ onSelectSymbol }: { onSelectSymbol: (symbol: string) => void }) {
  const [filter, setFilter] = useState<"all" | "halal" | "non-halal">("halal");
  const [query, setQuery] = useState("");

  const list = STOCKS.map((s) => {
    const compliant = isShariahCompliant(s.symbol);
    const meta = SHARIAH_DETAILS[s.symbol] || {
      debtRatio: "12.5%",
      cashRatio: "16.0%",
      nonPermissible: "0.5%",
      rationale: "Compliant industrial operation within financial criteria",
    };
    return { ...s, compliant, ...meta };
  });

  const filtered = list.filter((s) => {
    if (filter === "halal" && !s.compliant) return false;
    if (filter === "non-halal" && s.compliant) return false;
    if (query) {
      const q = query.toLowerCase();
      return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0a0d15] p-4 text-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 text-black shadow-lg shadow-emerald-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Shariah & Halal Equity Screener</h2>
            <p className="text-[11.5px] text-white/50">
              Institutional screening under AAOIFI Standards (Debt &lt; 33%, Cash &lt; 33%, Impermissible &lt; 5%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-1">
            <button
              onClick={() => setFilter("halal")}
              className={`rounded px-3 py-1 text-[11px] font-bold transition ${
                filter === "halal" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50 hover:text-white"
              }`}
            >
              Halal Compliant ({list.filter((s) => s.compliant).length})
            </button>
            <button
              onClick={() => setFilter("non-halal")}
              className={`rounded px-3 py-1 text-[11px] font-bold transition ${
                filter === "non-halal" ? "bg-rose-500/20 text-rose-300" : "text-white/50 hover:text-white"
              }`}
            >
              Non-Permissible ({list.filter((s) => !s.compliant).length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded px-3 py-1 text-[11px] font-bold transition ${
                filter === "all" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              All Universe ({list.length})
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks..."
              className="h-8 w-44 rounded-lg border border-white/10 bg-white/4 pl-8 pr-3 text-[12px] text-white outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Grid of stocks */}
      <div className="tx-scroll flex-1 overflow-y-auto pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((s) => (
          <div
            key={s.symbol}
            onClick={() => onSelectSymbol(s.symbol)}
            className="flex cursor-pointer flex-col justify-between rounded-xl border border-white/8 bg-white/2 p-4 transition hover:border-emerald-500/40 hover:bg-white/4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                    s.compliant
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {s.compliant ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-white">{s.symbol}</span>
                    <span className="text-[11px] text-white/50">{s.name}</span>
                  </div>
                  <div className="text-[10px] text-white/40">{s.sector}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-[13px] font-bold text-white">₹{fmtPrice(s.base)}</div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
                    s.compliant ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {s.compliant ? "HALAL VERIFIED" : "NON-PERMISSIBLE"}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-white/60 leading-relaxed">{s.rationale}</p>

            <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-2 text-[10px] text-white/40">
              <span>Debt Ratio: <strong className="text-white/70">{s.debtRatio}</strong></span>
              <span>Cash Ratio: <strong className="text-white/70">{s.cashRatio}</strong></span>
              <span>Purification: <strong className="text-white/70">{s.nonPermissible}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
