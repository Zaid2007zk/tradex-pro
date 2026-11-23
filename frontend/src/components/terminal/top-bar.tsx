"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BrainCircuit, CandlestickChart, Command, Search, Wallet, Sparkles, Zap, Scale, User, ShieldCheck, SlidersHorizontal, Mic, Plus, Trash2 } from "lucide-react";
import { INDICES, STOCKS, computeIndexValue, fmtPct, fmtPrice, fmtINR } from "@/lib/market/engine";
import { useIndices, useMarketStatus, type Quote } from "@/hooks/use-market";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import AiSettingsModal from "./ai-settings-modal";
import BrokerGatewayModal from "./broker-gateway-modal";
import ShariahModal from "./shariah-modal";

type Props = {
  quotes: Record<string, Quote>;
  onSelect: (symbol: string) => void;
  balance: number;
  onOpenAiCore?: () => void;
  onOpenVoice?: () => void;
};

const chgColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-rose-400");

export default function TopBar({ quotes, onSelect, balance, onOpenAiCore, onOpenVoice }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [shariahModalOpen, setShariahModalOpen] = useState(false);

  const [alerts, setAlerts] = useState<
    { id: string; symbol: string; targetPrice: number; direction: "ABOVE" | "BELOW"; triggered: boolean; timeStr: string }[]
  >([
    { id: "a1", symbol: "RELIANCE", targetPrice: 1370, direction: "ABOVE", triggered: false, timeStr: "Target Alert" },
    { id: "a2", symbol: "TATAMOTORS", targetPrice: 450, direction: "BELOW", triggered: false, timeStr: "Support Alert" },
    { id: "a3", symbol: "NIFTY 50", targetPrice: 25400, direction: "ABOVE", triggered: true, timeStr: "Triggered · 12:04 pm" },
  ]);
  const [newSym, setNewSym] = useState("RELIANCE");
  const [newPrice, setNewPrice] = useState(1360);
  const [newDir, setNewDir] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [showAddAlert, setShowAddAlert] = useState(false);
  const { toast } = useToast();

  // Monitor active alerts
  useEffect(() => {
    alerts.forEach((a) => {
      if (a.triggered) return;
      const px = quotes[a.symbol]?.price;
      if (!px) return;
      if ((a.direction === "ABOVE" && px >= a.targetPrice) || (a.direction === "BELOW" && px <= a.targetPrice)) {
        setAlerts((prev) =>
          prev.map((item) =>
            item.id === a.id
              ? { ...item, triggered: true, timeStr: `Triggered at ₹${fmtPrice(px)}` }
              : item
          )
        );
        toast({
          title: `🔔 Price Alert Triggered: ${a.symbol}`,
          description: `Price reached ₹${fmtPrice(px)} (${a.direction === "ABOVE" ? "crossed above" : "dropped below"} ₹${a.targetPrice})`,
        });
      }
    });
  }, [quotes, alerts, toast]);

  const indexQuotes = useIndices();
  const marketStatus = useMarketStatus();

  const indexData = useMemo(() => {
    return INDICES.slice(0, 4).map((idx) => {
      const live = indexQuotes[idx.symbol];
      if (live && live.price > 0) {
        return {
          idx,
          value: live.price,
          chgPts: typeof live.chgPts === "number" ? live.chgPts : (idx.chgPts ?? 0),
          chgPct: typeof live.chgPct === "number" ? live.chgPct : (idx.chgPct ?? 0),
        };
      }
      const computed = computeIndexValue(
        idx,
        Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, v.price]))
      );
      return {
        idx,
        value: computed.value,
        chgPts: typeof computed.chgPts === "number" ? computed.chgPts : (idx.chgPts ?? 0),
        chgPct: typeof computed.chgPct === "number" ? computed.chgPct : (idx.chgPct ?? 0),
      };
    });
  }, [quotes, indexQuotes]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return STOCKS.slice(0, 8);
    return STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [q]);

  // ⌘K / Ctrl+K opens the market search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="flex h-13 shrink-0 items-center gap-3 border-b border-white/8 bg-[#0d1016]/95 px-4 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_18px_rgba(240,185,11,0.35)]">
            <CandlestickChart className="h-4.5 w-4.5 text-black" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-tight">
              TradeX <span className="tx-gold-text">PRO</span>
            </div>
            <div className="mt-0.5 hidden text-[9.5px] font-medium uppercase tracking-[0.18em] text-white/40 min-[480px]:block">
              Quantum Terminal
            </div>
          </div>
        </div>

        {/* Real-time Official Market Hours Status Pill */}
        <div className={`hidden 2xl:flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider shrink-0 ${marketStatus.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${marketStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          {marketStatus.label}
        </div>

        {/* Index pills */}
        <div className="hidden items-center gap-2 xl:flex">
          {indexData.map(({ idx, value, chgPts, chgPct }) => (
            <div
              key={idx.symbol}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5"
            >
              <div>
                <div className="text-[9.5px] font-semibold uppercase tracking-wider text-white/45">{idx.name}</div>
                <div className="font-mono text-[12.5px] font-semibold tabular-nums">{fmtPrice(value)}</div>
              </div>
              <div className="text-right">
                <span className={`block font-mono text-[11px] font-medium tabular-nums ${chgColor(chgPct)}`}>
                  {typeof chgPts === "number" && !isNaN(chgPts)
                    ? (chgPts >= 0 ? `+${chgPts.toFixed(2)}` : chgPts.toFixed(2))
                    : "+0.00"}
                </span>
                <span className={`block font-mono text-[9.5px] tabular-nums ${chgColor(chgPct)}`}>
                  ({fmtPct(typeof chgPct === "number" && !isNaN(chgPct) ? chgPct : 0)})
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex h-8 min-w-0 max-w-56 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 text-[12.5px] text-white/45 transition hover:border-white/20 hover:text-white/70 sm:w-56 sm:flex-none">
              <Search className="h-3.5 w-3.5" />
              <span className="min-w-0 flex-1 truncate text-left">Search markets…</span>
              <kbd className="hidden shrink-0 rounded border border-white/15 bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/50 sm:block">
                ⌘K
              </kbd>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 border-slate-700/70 bg-[#0a0d15] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[9999] ring-1 ring-white/10">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Symbol or company name…"
              className="mb-1.5 h-9 w-full rounded-md border border-white/12 bg-white/5 px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-amber-500/50"
            />
            <div className="tx-scroll max-h-72 overflow-y-auto">
              {results.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    onSelect(s.symbol);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-white/8"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-white">{s.symbol}</div>
                    <div className="text-[11px] text-white/45">{s.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[12px] tabular-nums text-white">
                      {fmtPrice(quotes[s.symbol]?.price ?? s.base)}
                    </div>
                    <div className={`font-mono text-[10.5px] ${chgColor(quotes[s.symbol]?.chgPct ?? 0)}`}>
                      {fmtPct(quotes[s.symbol]?.chgPct ?? 0)}
                    </div>
                  </div>
                </button>
              ))}
              {results.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-white/40">No matches</div>}
            </div>
          </PopoverContent>
        </Popover>

        {/* Feature Action Pills */}
        <div className="flex items-center gap-2">
          {/* AI Core Intelligence Launcher */}
          {onOpenAiCore && (
            <button
              onClick={onOpenAiCore}
              className="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 px-2.5 py-1.5 text-[11px] font-bold text-fuchsia-200 transition hover:from-fuchsia-500/30 hover:to-purple-600/30 shadow-sm"
              title="Open ARIA AI Core — Chat, Ideas, NewsWire & Reports"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-fuchsia-300" />
              <span className="hidden sm:inline">AI Core</span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </button>
          )}

          {/* Voice AI Assistant Button */}
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/35 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-bold text-purple-200 transition hover:bg-purple-500/20 shadow-sm"
              title="TradeX Voice AI Assistant (Speech-to-Trade)"
            >
              <Mic className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span className="hidden md:inline">Voice AI</span>
            </button>
          )}

          {/* AI Engine Button */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/35 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-bold text-purple-300 transition hover:bg-purple-500/20 shadow-sm"
            title="Configure AI Providers (Groq / Gemini / Autonomous)"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Config</span>
            <span className="rounded bg-emerald-500/25 px-1 py-0.5 text-[8.5px] font-bold text-emerald-300 font-mono">
              ACTIVE
            </span>
          </button>

          {/* Mobile Tools Popover (Visible on mobile screens) */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                aria-label="Terminal Tools"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 border-white/12 bg-[#0e121a] p-2 shadow-2xl z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-white/50 uppercase tracking-wider">Terminal Features</div>
              {onOpenVoice && (
                <button
                  onClick={onOpenVoice}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-purple-200 hover:bg-purple-500/10 transition"
                >
                  <Mic className="h-4 w-4 text-purple-400" />
                  <span>Voice AI Assistant</span>
                </button>
              )}
              <button
                onClick={() => setAiModalOpen(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-purple-300 hover:bg-purple-500/10 transition"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>AI Neural Engine</span>
              </button>
              <button
                onClick={() => setBrokerModalOpen(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 transition"
              >
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Broker DMA</span>
              </button>
              <button
                onClick={() => setShariahModalOpen(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
              >
                <Scale className="h-4 w-4 text-emerald-400" />
                <span>Halal Screener</span>
              </button>
            </PopoverContent>
          </Popover>

          {/* Broker DMA Button */}
          <button
            onClick={() => setBrokerModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-bold text-cyan-300 transition hover:bg-cyan-500/20 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Broker DMA</span>
          </button>

          {/* Shariah Screener Button */}
          <button
            onClick={() => setShariahModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/20 shadow-sm"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-400" />
            <span>Halal Screener</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Paper trading balance (Desktop & Tablet) */}
        <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5 sm:flex">
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <div className="leading-none">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300/70">Paper Funds</div>
            <div className="mt-0.5 font-mono text-[12.5px] font-semibold tabular-nums text-emerald-300">
              {fmtINR(balance)}
            </div>
          </div>
        </div>

        {/* Paper trading balance (Mobile compact) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-2 py-1 text-emerald-300 font-mono text-[11px] font-bold sm:hidden">
          <Wallet className="h-3 w-3 text-emerald-400" />
          <span>₹{(balance / 100000).toFixed(1)}L</span>
        </div>

        {/* Alerts */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-white/10 bg-white/4 transition hover:border-white/25"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4 text-white/65" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {alerts.filter((a) => a.triggered).length || alerts.length}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-84 border-slate-700/70 bg-[#0a0d15] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[9999] ring-1 ring-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/8">
              <span className="text-[12.5px] font-semibold text-white">Smart Price & Volatility Alerts</span>
              <button
                onClick={() => setShowAddAlert(!showAddAlert)}
                className="flex items-center gap-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10.5px] font-semibold hover:bg-amber-500/30 transition"
              >
                <Plus className="h-3 w-3" />
                <span>{showAddAlert ? "Close" : "New Alert"}</span>
              </button>
            </div>

            {showAddAlert && (
              <div className="my-2 p-2 rounded-lg border border-white/10 bg-white/4 space-y-2 font-mono text-[11px]">
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={newSym}
                    onChange={(e) => setNewSym(e.target.value)}
                    className="h-7 rounded border border-white/10 bg-[#0e121a] px-2 text-white outline-none text-[11px]"
                  >
                    {STOCKS.map((s) => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newDir}
                    onChange={(e) => setNewDir(e.target.value as any)}
                    className="h-7 rounded border border-white/10 bg-[#0e121a] px-2 text-white outline-none text-[11px]"
                  >
                    <option value="ABOVE">Price ≥ Target</option>
                    <option value="BELOW">Price ≤ Target</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Target Price"
                    className="h-7 flex-1 rounded border border-white/10 bg-[#0e121a] px-2 text-white outline-none text-[11px]"
                  />
                  <button
                    onClick={() => {
                      if (!newPrice) return;
                      const newAlert = {
                        id: `alt-${Date.now()}`,
                        symbol: newSym,
                        targetPrice: newPrice,
                        direction: newDir,
                        triggered: false,
                        timeStr: "Active Watch",
                      };
                      setAlerts([newAlert, ...alerts]);
                      setShowAddAlert(false);
                      toast({
                        title: `🔔 Alert Created for ${newSym}`,
                        description: `Will notify when price ${newDir === "ABOVE" ? "crosses above" : "drops below"} ₹${newPrice}`,
                      });
                    }}
                    className="h-7 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] transition"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            <div className="tx-scroll max-h-72 overflow-y-auto mt-2 space-y-1">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md px-2.5 py-1.5 transition hover:bg-white/6 text-[11.5px]">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        a.triggered ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-white/90">
                        {a.symbol} {a.direction === "ABOVE" ? "≥" : "≤"} ₹{fmtPrice(a.targetPrice)}
                      </div>
                      <div className="text-[9.5px] text-white/40">{a.timeStr}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAlerts(alerts.filter((item) => item.id !== a.id))}
                    className="text-white/30 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-br from-amber-500/25 to-amber-800/25 text-[12px] font-bold text-amber-300 transition hover:border-amber-400">
              P
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 border-slate-700/70 bg-[#0a0d15] p-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[9999] ring-1 ring-white/10">
            <div className="border-b border-white/8 pb-2.5">
              <div className="font-bold text-[13px] text-white">zaid@gmail.com</div>
              <span className="inline-block mt-1 rounded bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                PRO TERMINAL ACCESS
              </span>
            </div>
            <div className="mt-2.5 space-y-1 text-[12px]">
              <button
                onClick={() => setBrokerModalOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-white/8 transition"
              >
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Broker Gateway (DMA)</span>
              </button>
              <button
                onClick={() => setAiModalOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-white/8 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>AI Engine Settings</span>
              </button>
              <button
                onClick={() => setShariahModalOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-white/8 transition"
              >
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Halal Stock Screener</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {/* Modals */}
      <AiSettingsModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <BrokerGatewayModal open={brokerModalOpen} onClose={() => setBrokerModalOpen(false)} />
      <ShariahModal
        open={shariahModalOpen}
        onClose={() => setShariahModalOpen(false)}
        onSelectSymbol={onSelect}
      />
    </>
  );
}
