"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Flame,
  Layers,
  Zap,
  Wallet,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { generateCandles, liveCandle, fmtINR, fmtPrice, type Timeframe } from "@/lib/market/engine";
import { useMarket } from "@/hooks/use-market";
import { TIMEFRAMES } from "@/lib/market/engine";
import TopBar from "./top-bar";
import TickerTape from "./ticker-tape";
import WorkspaceTabs, { type Workspace } from "./workspace-tabs";
import Watchlist from "./watchlist";
import SymbolHeader from "./symbol-header";
import CandleChart from "./candle-chart";
import Heatmap from "./heatmap";
import OrderTicket, { type Order, type Position } from "./order-ticket";
import MarketDepth from "./market-depth";
import AiPanel from "./ai-panel";
import BottomTabs from "./bottom-tabs";
import StatusBar from "./status-bar";
import OptionsChain from "./options-chain";
import MultiChart from "./multi-chart";
import AlgoStudio from "./algo-studio";
import Backtest from "./backtest";
import Journal from "./journal";
import Academy from "./academy";
import AiCore from "./ai-core";
import Autopilot from "./autopilot";
import ShariahScreenerView from "./shariah-screener-view";
import VoiceAssistantModal from "./voice-assistant-modal";
import { useToast } from "@/hooks/use-toast";

const START_BALANCE = 1_000_000;

export type MobileTab = "chart" | "watchlist" | "trade" | "positions" | "depth";

export default function Terminal() {
  const { toast } = useToast();
  const quotes = useMarket();
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [view, setView] = useState<"chart" | "heatmap">("chart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>("terminal");
  const [fps, setFps] = useState(60);
  const rafCount = useRef(0);

  // Responsive Layout States
  const [mobileTab, setMobileTab] = useState<MobileTab>("chart");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [prefilledBracket, setPrefilledBracket] = useState<{ sl: number; tgt: number; side?: "BUY" | "SELL" } | null>(null);
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const [rightRailCollapsed, setRightRailCollapsed] = useState(false);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [aiCoreOpen, setAiCoreOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const quote = quotes[symbol];

  const handleApplyAiLevels = useCallback(
    (appliedSide: "BUY" | "SELL", sl: number, tgt: number) => {
      setOrderSide(appliedSide);
      setPrefilledBracket({ sl, tgt, side: appliedSide });
      toast({
        title: `⚡ AI Setup Applied to Order Ticket`,
        description: `${symbol} ${appliedSide} · Target ₹${tgt} | Stop Loss ₹${sl}`,
      });
    },
    [symbol, toast]
  );

  // FPS meter
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      rafCount.current += 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const id = setInterval(() => {
      setFps(Math.min(60, rafCount.current));
      rafCount.current = 0;
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const basePrice = quote?.prevClose || quote?.price;
  const baseCandles = useMemo(
    () => generateCandles(symbol, timeframe, basePrice),
    [symbol, timeframe, Math.round(basePrice || 0)]
  );
  const candles = useMemo(() => liveCandle(baseCandles, quote.price), [baseCandles, quote.price]);

  const marginUsed = positions.reduce(
    (a, p) => a + (p.price * p.qty) / (p.product === "MIS" ? 5 : p.product === "MTF" ? 4 : 1),
    0
  );
  const balance = START_BALANCE - marginUsed;

  const onExecute = useCallback((o: Omit<Order, "id" | "ts">) => {
    const order: Order = { ...o, id: `ord-${Date.now()}-${Math.floor(Math.random() * 999)}`, ts: Date.now() };
    setOrders((prev) => [order, ...prev].slice(0, 60));
    setPositions((prev) => {
      const existing = prev.find((p) => p.symbol === o.symbol && p.side === o.side);
      if (existing) {
        const newQty = existing.qty + o.qty;
        const avg = (existing.price * existing.qty + o.price * o.qty) / newQty;
        return prev.map((p) =>
          p.id === existing.id ? { ...p, qty: newQty, price: Math.round(avg * 100) / 100, ltp: o.price } : p
        );
      }
      const opp = prev.find((p) => p.symbol === o.symbol && p.side !== o.side);
      if (opp) {
        if (opp.qty === o.qty) {
          return prev.filter((p) => p.id !== opp.id);
        }
        if (opp.qty > o.qty) {
          return prev.map((p) => (p.id === opp.id ? { ...p, qty: p.qty - o.qty, ltp: o.price } : p));
        }
        // Position flip (e.g. was Short 10, now Buy 25 -> becomes Long 15)
        const remQty = o.qty - opp.qty;
        return [...prev.filter((p) => p.id !== opp.id), { ...order, qty: remQty, ltp: o.price }];
      }
      return [...prev, { ...order, ltp: o.price }];
    });
  }, []);

  const livePositions = useMemo(
    () => positions.map((p) => ({ ...p, ltp: quotes[p.symbol]?.price ?? p.ltp })),
    [positions, quotes]
  );

  const totalPnl = livePositions.reduce((a, p) => {
    const pnl = (p.side === "BUY" ? p.ltp - p.price : p.price - p.ltp) * p.qty;
    return a + pnl;
  }, 0);

  const triggeredBracketRef = useRef<Set<string>>(new Set());

  // Automated Bracket Order Trigger Monitor (Auto Exit on Stop Loss or Target Hit)
  useEffect(() => {
    positions.forEach((p) => {
      if (!p.isBracket || triggeredBracketRef.current.has(p.id)) return;
      const curPrice = quotes[p.symbol]?.price;
      if (!curPrice) return;

      let triggered = false;
      let isTarget = false;

      if (p.side === "BUY") {
        if (p.target && curPrice >= p.target) {
          triggered = true;
          isTarget = true;
        } else if (p.sl && curPrice <= p.sl) {
          triggered = true;
          isTarget = false;
        }
      } else if (p.side === "SELL") {
        if (p.target && curPrice <= p.target) {
          triggered = true;
          isTarget = true;
        } else if (p.sl && curPrice >= p.sl) {
          triggered = true;
          isTarget = false;
        }
      }

      if (triggered) {
        triggeredBracketRef.current.add(p.id);
        const exitSide = p.side === "BUY" ? "SELL" : "BUY";
        const pnl = (p.side === "BUY" ? curPrice - p.price : p.price - curPrice) * p.qty;
        // Close position
        onExecute({
          symbol: p.symbol,
          side: exitSide,
          qty: p.qty,
          price: curPrice,
          type: "MARKET",
          product: p.product,
        });

        toast({
          title: isTarget ? `🎯 AI Target Hit (+₹${fmtPrice(Math.abs(pnl))})` : `🛑 AI Stop Loss Hit (-₹${fmtPrice(Math.abs(pnl))})`,
          description: `${p.symbol} auto-closed at ₹${fmtPrice(curPrice)} · Bracket Auto-Exit`,
        });
      }
    });
  }, [quotes, positions, onExecute, toast]);

  // When a stock is selected from Watchlist on mobile, auto-switch to chart
  const handleSelectSymbol = useCallback((sym: string) => {
    setSymbol(sym);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileTab("chart");
    }
  }, []);

  return (
    <div className="tx-terminal flex h-screen max-h-screen w-screen max-w-screen flex-col overflow-hidden select-none">
      {/* 1. Global Header Bar */}
      <TopBar
        quotes={quotes}
        onSelect={handleSelectSymbol}
        balance={balance}
        onOpenAiCore={() => setAiCoreOpen((o) => !o)}
        onOpenVoice={() => setVoiceModalOpen(true)}
      />

      {/* 2. Ticker Tape */}
      <TickerTape quotes={quotes} onSelect={handleSelectSymbol} />

      {/* 3. Workspace Selector Tabs */}
      <div className="mx-2 mt-1.5 shrink-0">
        <WorkspaceTabs active={workspace} onChange={setWorkspace} />
      </div>

      {/* 4. Mobile Segmented Tab Switcher (Visible on Phones & Tablets < 1024px) */}
      <div className="flex lg:hidden items-center justify-between rounded-xl border border-white/10 bg-[#0e121a]/90 p-1 mx-2 mt-1.5 shrink-0 backdrop-blur">
        <button
          onClick={() => setMobileTab("chart")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition ${
            mobileTab === "chart"
              ? "bg-amber-500/20 text-amber-300 shadow-[inset_0_0_0_1px_rgba(240,185,11,0.3)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <LineChart className="h-3.5 w-3.5" />
          <span>Chart</span>
        </button>
        <button
          onClick={() => setMobileTab("watchlist")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition ${
            mobileTab === "watchlist"
              ? "bg-amber-500/20 text-amber-300 shadow-[inset_0_0_0_1px_rgba(240,185,11,0.3)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Watchlist</span>
        </button>
        <button
          onClick={() => setMobileTab("trade")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition ${
            mobileTab === "trade"
              ? "bg-emerald-500/20 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(14,203,129,0.3)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Trade</span>
        </button>
        <button
          onClick={() => setMobileTab("positions")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition ${
            mobileTab === "positions"
              ? "bg-cyan-500/20 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.3)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setMobileTab("depth")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition ${
            mobileTab === "depth"
              ? "bg-purple-500/20 text-purple-300 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.3)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Depth</span>
        </button>
      </div>

      {/* 5. Main Content Area */}
      <main className="flex min-h-0 flex-1 flex-col gap-1.5 p-1.5 lg:flex-row lg:overflow-hidden">
        {/* ========================================================================= */}
        {/* A. DESKTOP / LAPTOP LAYOUT (Width >= 1024px)                                */}
        {/* ========================================================================= */}
        <div className="hidden lg:contents">
          {/* Left Rail (Watchlist) with Smooth Collapse / Expand */}
          <div
            className={`transition-all duration-300 ease-in-out shrink-0 flex flex-col min-h-0 overflow-hidden ${
              leftRailCollapsed ? "w-11 items-center" : "w-60 xl:w-72 2xl:w-80"
            }`}
          >
            {leftRailCollapsed ? (
              <div className="tx-panel flex h-full w-full flex-col items-center py-3 gap-3">
                <button
                  onClick={() => setLeftRailCollapsed(false)}
                  title="Expand Watchlist"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="[writing-mode:vertical-rl] rotate-180 font-mono text-[11px] font-bold tracking-wider text-white/40">
                  WATCHLIST · {quotes[symbol]?.symbol}
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-0 flex flex-col overflow-hidden">
                <Watchlist
                  quotes={quotes}
                  selected={symbol}
                  onSelect={handleSelectSymbol}
                  onCollapse={() => setLeftRailCollapsed(true)}
                />
              </div>
            )}
          </div>

          {/* Center Column (Chart & Bottom Tabs OR Specialized Workspace) */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden pr-0.5">
            {workspace === "terminal" ? (
              <>
                <div className="tx-panel shrink-0">
                  <SymbolHeader symbol={symbol} quote={quote} candles={candles} />
                </div>

                {/* Chart / Heatmap panel */}
                <div
                  className={`tx-panel flex flex-col overflow-hidden transition-all duration-200 ${
                    chartExpanded
                      ? "flex-1 min-h-0"
                      : "flex-1 min-h-[140px]"
                  }`}
                >
                  <div className="tx-panel-head flex items-center justify-between px-3 py-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setView("chart")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                          view === "chart"
                            ? "bg-amber-500/15 text-amber-300"
                            : "text-white/45 hover:bg-white/5 hover:text-white/75"
                        }`}
                      >
                        <LineChart className="h-3.5 w-3.5" /> Chart
                      </button>
                      <button
                        onClick={() => setView("heatmap")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                          view === "heatmap"
                            ? "bg-amber-500/15 text-amber-300"
                            : "text-white/45 hover:bg-white/5 hover:text-white/75"
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" /> Heatmap
                      </button>
                      {view === "chart" && (
                        <div className="ml-3 flex items-center gap-0.5 rounded-md border border-white/10 bg-white/4 p-0.5">
                          {TIMEFRAMES.map((t) => (
                            <button
                              key={t.key}
                              onClick={() => setTimeframe(t.key)}
                              className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                                timeframe === t.key
                                  ? "bg-white/14 text-white"
                                  : "text-white/45 hover:text-white/80"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-white/40">
                        <span className="tx-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE NSE FEED
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/4 px-2 py-1 font-mono text-[10px] text-white/55">
                        P&amp;L{" "}
                        <span className={totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {totalPnl >= 0 ? "+" : "−"}
                          {fmtINR(Math.abs(totalPnl))}
                        </span>
                      </span>
                      <button
                        onClick={() => setChartExpanded(!chartExpanded)}
                        title={chartExpanded ? "Restore Normal View (Show Positions)" : "Expand Chart View (Hide Bottom Panels)"}
                        className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/70 hover:bg-white/15 hover:text-white transition"
                      >
                        {chartExpanded ? (
                          <>
                            <Minimize2 className="h-3 w-3 text-amber-400" />
                            <span className="hidden xl:inline">Normal View</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="h-3 w-3 text-amber-400" />
                            <span className="hidden xl:inline">Expand Chart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 relative">
                    {view === "chart" ? (
                      <CandleChart symbol={symbol} candles={candles} timeframe={timeframe} price={quote.price} />
                    ) : (
                      <Heatmap quotes={quotes} onSelect={handleSelectSymbol} />
                    )}
                  </div>
                </div>

                {/* Bottom Tabs (Positions & Orders - Perfectly balanced height for full visibility) */}
                {!chartExpanded && (
                  <div className="h-36 xl:h-40 2xl:h-44 shrink-0 overflow-hidden">
                    <BottomTabs positions={livePositions} orders={orders} />
                  </div>
                )}
              </>
            ) : (
              <div className="tx-panel flex min-h-0 flex-1 flex-col overflow-hidden">
                {workspace === "options" && <OptionsChain symbol={symbol} quote={quote} />}
                {workspace === "multi" && <MultiChart symbol={symbol} quotes={quotes} onSelect={handleSelectSymbol} />}
                {workspace === "algo" && <AlgoStudio symbol={symbol} quotes={quotes} onSelect={handleSelectSymbol} />}
                {workspace === "backtest" && <Backtest symbol={symbol} quotes={quotes} />}
                {workspace === "journal" && <Journal orders={orders} />}
                {workspace === "academy" && <Academy />}
                {workspace === "autopilot" && (
                  <Autopilot quotes={quotes} positions={livePositions} onExecute={onExecute} />
                )}
                {workspace === "shariah" && <ShariahScreenerView onSelectSymbol={handleSelectSymbol} />}
              </div>
            )}
          </section>

          {/* Right Rail (Order Ticket, Depth, AI) with Collapse Toggle */}
          <div
            className={`transition-all duration-300 ease-in-out shrink-0 flex flex-col min-h-0 overflow-hidden ${
              rightRailCollapsed ? "w-11 items-center" : "w-72 xl:w-80 2xl:w-88"
            }`}
          >
            {rightRailCollapsed ? (
              <div className="tx-panel flex h-full w-full flex-col items-center py-3 gap-3">
                <button
                  onClick={() => setRightRailCollapsed(false)}
                  title="Expand Trade Panel"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="[writing-mode:vertical-rl] font-mono text-[11px] font-bold tracking-wider text-emerald-400">
                  TRADE & ORDER BOOK
                </div>
              </div>
            ) : (
              <aside className="tx-scroll relative flex h-full min-h-0 w-full flex-col gap-1.5 overflow-y-auto pb-4">
                <OrderTicket
                  symbol={symbol}
                  quote={quote}
                  balance={balance}
                  onExecute={onExecute}
                  defaultSide={orderSide}
                  candles={candles}
                  onCollapse={() => setRightRailCollapsed(true)}
                  prefilledBracket={prefilledBracket}
                />
                <MarketDepth price={quote.price} />
                <AiPanel symbol={symbol} candles={candles} onApplyLevels={handleApplyAiLevels} />
              </aside>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B. MOBILE & TABLET ADAPTIVE LAYOUT (Width < 1024px)                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col flex-1 min-h-0 lg:hidden overflow-y-auto tx-scroll">
          {workspace !== "terminal" ? (
            <div className="tx-panel flex-1 flex flex-col min-h-[500px] overflow-hidden">
              {workspace === "options" && <OptionsChain symbol={symbol} quote={quote} />}
              {workspace === "multi" && <MultiChart symbol={symbol} quotes={quotes} onSelect={handleSelectSymbol} />}
              {workspace === "algo" && <AlgoStudio symbol={symbol} quotes={quotes} onSelect={handleSelectSymbol} />}
              {workspace === "backtest" && <Backtest symbol={symbol} quotes={quotes} />}
              {workspace === "journal" && <Journal orders={orders} />}
              {workspace === "academy" && <Academy />}
              {workspace === "autopilot" && (
                <Autopilot quotes={quotes} positions={livePositions} onExecute={onExecute} />
              )}
              {workspace === "shariah" && <ShariahScreenerView onSelectSymbol={handleSelectSymbol} />}
            </div>
          ) : (
            <>
              {/* Tab 1: Live Chart View */}
              {mobileTab === "chart" && (
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                  <div className="tx-panel shrink-0">
                    <SymbolHeader symbol={symbol} quote={quote} candles={candles} />
                  </div>

                  <div className="tx-panel flex flex-col h-[400px] sm:h-[480px] overflow-hidden shrink-0">
                    <div className="tx-panel-head flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setView("chart")}
                          className={`rounded px-2 py-1 text-[11px] font-semibold ${
                            view === "chart" ? "bg-amber-500/15 text-amber-300" : "text-white/45"
                          }`}
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => setView("heatmap")}
                          className={`rounded px-2 py-1 text-[11px] font-semibold ${
                            view === "heatmap" ? "bg-amber-500/15 text-amber-300" : "text-white/45"
                          }`}
                        >
                          Heatmap
                        </button>
                        {view === "chart" && (
                          <div className="flex items-center gap-0.5 ml-2">
                            {TIMEFRAMES.map((t) => (
                              <button
                                key={t.key}
                                onClick={() => setTimeframe(t.key)}
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                                  timeframe === t.key ? "bg-white/14 text-white font-bold" : "text-white/45"
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    <div className="flex-1 min-h-0 relative">
                      {view === "chart" ? (
                        <CandleChart symbol={symbol} candles={candles} timeframe={timeframe} price={quote.price} />
                      ) : (
                        <Heatmap quotes={quotes} onSelect={handleSelectSymbol} />
                      )}
                    </div>
                  </div>

                  {/* Mobile 1-Tap Execution Bar */}
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-[#0e121a] shrink-0">
                    <button
                      onClick={() => {
                        setOrderSide("BUY");
                        setMobileTab("trade");
                      }}
                      className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <span>BUY {symbol}</span>
                      <span className="font-mono font-bold">₹{fmtPrice(quote.price)}</span>
                    </button>
                    <button
                      onClick={() => {
                        setOrderSide("SELL");
                        setMobileTab("trade");
                      }}
                      className="flex-1 py-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <span>SELL {symbol}</span>
                      <span className="font-mono font-bold">₹{fmtPrice(quote.price)}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Watchlist View */}
              {mobileTab === "watchlist" && (
                <div className="h-[600px] flex flex-col">
                  <Watchlist quotes={quotes} selected={symbol} onSelect={handleSelectSymbol} />
                </div>
              )}

              {/* Tab 3: Order Execution Ticket View */}
              {mobileTab === "trade" && (
                <div className="flex flex-col gap-2 pb-6">
                  <OrderTicket
                    symbol={symbol}
                    quote={quote}
                    balance={balance}
                    onExecute={onExecute}
                    defaultSide={orderSide}
                    candles={candles}
                    prefilledBracket={prefilledBracket}
                  />
                  <MarketDepth price={quote.price} />
                </div>
              )}

              {/* Tab 4: Positions & Orders View */}
              {mobileTab === "positions" && (
                <div className="h-[520px] flex flex-col">
                  <BottomTabs positions={livePositions} orders={orders} />
                </div>
              )}

              {/* Tab 5: Market Depth & AI Telemetry View */}
              {mobileTab === "depth" && (
                <div className="flex flex-col gap-2 pb-6">
                  <MarketDepth price={quote.price} />
                  <AiPanel
                    symbol={symbol}
                    candles={candles}
                    onApplyLevels={(side, sl, tgt) => {
                      handleApplyAiLevels(side, sl, tgt);
                      setMobileTab("trade");
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 6. Status Bar at Bottom */}
      <StatusBar fps={fps} onOpenAiCore={() => setAiCoreOpen((o) => !o)} />

      {/* 7. Institutional ARIA Neural AI Core */}
      <AiCore
        quotes={quotes}
        symbol={symbol}
        positions={livePositions}
        onSelect={handleSelectSymbol}
        onExecute={onExecute}
        isOpen={aiCoreOpen}
        onOpenChange={setAiCoreOpen}
      />

      {/* 8. Voice AI Assistant */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSelectSymbol={handleSelectSymbol}
        onExecuteOrder={onExecute}
        onOpenAiCore={() => setAiCoreOpen(true)}
        quotes={quotes}
        currentSymbol={symbol}
      />
    </div>
  );
}
