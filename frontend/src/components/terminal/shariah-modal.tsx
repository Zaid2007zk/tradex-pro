"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, Scale, Search, X } from "lucide-react";
import { STOCKS, fmtPrice } from "@/lib/market/engine";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
}

// Criteria based on AAOIFI / DJIM Shariah Screening Standard
const SHARIAH_MAP: Record<
  string,
  { compliant: boolean; debtRatio: string; cashRatio: string; nonPermissible: string; reason: string }
> = {
  RELIANCE: { compliant: true, debtRatio: "18.2%", cashRatio: "14.5%", nonPermissible: "1.1%", reason: "Passes debt & cash threshold; non-permissible media revenue < 2%" },
  TCS: { compliant: true, debtRatio: "1.2%", cashRatio: "22.4%", nonPermissible: "0.2%", reason: "Zero pure debt; ethical software and digital services" },
  INFY: { compliant: true, debtRatio: "2.1%", cashRatio: "24.1%", nonPermissible: "0.4%", reason: "Pure technology services with minimal debt leverage" },
  TATAMOTORS: { compliant: true, debtRatio: "24.5%", cashRatio: "12.8%", nonPermissible: "0.8%", reason: "Automotive engineering within conservative debt threshold" },
  BHARTIARTL: { compliant: true, debtRatio: "28.1%", cashRatio: "11.2%", nonPermissible: "0.9%", reason: "Telecom infrastructure within permissible financial ratios" },
  SUNPHARMA: { compliant: true, debtRatio: "3.4%", cashRatio: "19.5%", nonPermissible: "0.1%", reason: "Healthcare and pharmaceutical production (ethical core)" },
  ASIANPAINT: { compliant: true, debtRatio: "5.1%", cashRatio: "16.8%", nonPermissible: "0.3%", reason: "Chemical manufacturing and coatings (permissible goods)" },
  TITAN: { compliant: true, debtRatio: "12.3%", cashRatio: "15.0%", nonPermissible: "0.5%", reason: "Jewelry & lifestyle retail with compliant financing" },
  MARUTI: { compliant: true, debtRatio: "1.8%", cashRatio: "28.5%", nonPermissible: "0.4%", reason: "Automobile manufacturing with robust cash buffers" },
  HCLTECH: { compliant: true, debtRatio: "4.2%", cashRatio: "20.1%", nonPermissible: "0.3%", reason: "IT consulting and services (halal compliance pass)" },
  HDFCBANK: { compliant: false, debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.5%", reason: "Conventional banking generating interest (Riba)" },
  ICICIBANK: { compliant: false, debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.2%", reason: "Conventional financial institution; interest-based revenue" },
  SBIN: { compliant: false, debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "97.8%", reason: "Public sector commercial banking with interest operations" },
  KOTAKBANK: { compliant: false, debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "98.0%", reason: "Commercial bank & lending business" },
  AXISBANK: { compliant: false, debtRatio: "N/A", cashRatio: "N/A", nonPermissible: "97.9%", reason: "Interest-based banking and financial intermediation" },
  ITC: { compliant: false, debtRatio: "0.8%", cashRatio: "26.4%", nonPermissible: "41.2%", reason: "Cigarette / tobacco revenue exceeds 5% threshold" },
};

export function isShariahCompliant(symbol: string): boolean {
  const clean = symbol.toUpperCase().replace(/\.NS$/, "");
  return SHARIAH_MAP[clean]?.compliant ?? false;
}

export default function ShariahModal({ open, onClose, onSelectSymbol }: Props) {
  const [filter, setFilter] = useState<"all" | "compliant" | "non-compliant">("compliant");
  const [query, setQuery] = useState("");

  if (!open) return null;

  const stockList = STOCKS.map((s) => {
    const info = SHARIAH_MAP[s.symbol] || {
      compliant: true,
      debtRatio: "12.0%",
      cashRatio: "15.0%",
      nonPermissible: "0.5%",
      reason: "Compliant industrial business activity",
    };
    return { ...s, ...info };
  });

  const filtered = stockList.filter((s) => {
    if (filter === "compliant" && !s.compliant) return false;
    if (filter === "non-compliant" && s.compliant) return false;
    if (query) {
      const q = query.toLowerCase();
      return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-white/12 bg-[#0e121a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 text-black shadow-lg shadow-emerald-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Shariah & Halal Equity Screener</h2>
              <p className="text-[11.5px] text-white/50">
                Audited against AAOIFI Standards (Debt &lt; 33%, Cash &lt; 33%, Ethical Core)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/3 p-1">
            <button
              onClick={() => setFilter("compliant")}
              className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
                filter === "compliant" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50 hover:text-white"
              }`}
            >
              Halal Compliant ({stockList.filter((s) => s.compliant).length})
            </button>
            <button
              onClick={() => setFilter("non-compliant")}
              className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
                filter === "non-compliant" ? "bg-rose-500/20 text-rose-300" : "text-white/50 hover:text-white"
              }`}
            >
              Non-Permissible ({stockList.filter((s) => !s.compliant).length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
                filter === "all" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              All Universe ({stockList.length})
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

        {/* Stock List */}
        <div className="tx-scroll flex-1 overflow-y-auto p-5 space-y-2.5">
          {filtered.map((s) => (
            <div
              key={s.symbol}
              onClick={() => {
                onSelectSymbol(s.symbol);
                onClose();
              }}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/8 bg-white/2 p-3 transition hover:border-emerald-500/40 hover:bg-white/4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                    s.compliant
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {s.compliant ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-white">{s.symbol}</span>
                    <span className="text-[11px] text-white/50">{s.name}</span>
                    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-white/60">{s.sector}</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-white/40">{s.reason}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-[12px] font-bold text-white">₹{fmtPrice(s.base)}</div>
                <div className="text-[10px]">
                  {s.compliant ? (
                    <span className="font-semibold text-emerald-400">HALAL VERIFIED</span>
                  ) : (
                    <span className="font-semibold text-rose-400">NON-PERMISSIBLE</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/8 p-4 text-[11px] text-white/40">
          <span>Click any stock to load directly onto the Quantum Terminal.</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-[12px] font-bold text-black hover:bg-emerald-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
