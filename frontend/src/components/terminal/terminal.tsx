"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, LineChart, Flame } from "lucide-react";
import { generateCandles, liveCandle, fmtINR, type Timeframe } from "@/lib/market/engine";
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
import AiCopilot from "./ai-copilot";
import AiCore from "./ai-core";
import Autopilot from "./autopilot";
import ShariahScreenerView from "./shariah-screener-view";

const START_BALANCE = 1_000_000;

export default function Terminal() {
  const quotes = useMarket();
  const [symbol, setSymbol] = useState("RELIANCE");
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [view, setView] = useState<"chart" | "heatmap">("chart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>("terminal");
  const [fps, setFps] = useState(60);
  const rafCount = useRef(0);

  const quote = quotes[symbol];

  // fps meter (proves the feed is live & smooth)
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

  const baseCandles = useMemo(() => generateCandles(symbol, timeframe), [symbol, timeframe]);
  const candles = useMemo(() => liveCandle(baseCandles, quote.price), [baseCandles, quote.price]);

  const marginUsed = positions.reduce((a, p) => a + (p.price * p.qty) / (p.product === "MIS" ? 5 : p.product === "MTF" ? 4 : 1), 0);
  const balance = START_BALANCE - marginUsed;

  const onExecute = useCallback(
    (o: Omit<Order, "id" | "ts">) => {
      const order: Order = { ...o, id: `ord-${Date.now()}-${Math.floor(Math.random() * 999)}`, ts: Date.now() };
      setOrders((prev) => [order, ...prev].slice(0, 60));
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === o.symbol && p.side === o.side);
        if (existing) {
          const newQty = existing.qty + o.qty;
          const avg = (existing.price * existing.qty + o.price * o.qty) / newQty;
          return prev.map((p) => (p.id === existing.id ? { ...p, qty: newQty, price: Math.round(avg * 100) / 100, ltp: o.price } : p));
        }
        const opp = prev.find((p) => p.symbol === o.symbol && p.side !== o.side);
        if (opp && opp.qty === o.qty) {
          return prev.filter((p) => p.id !== opp.id);
        }
        if (opp && opp.qty > o.qty) {
          return prev.map((p) => (p.id === opp.id ? { ...p, qty: p.qty - o.qty, ltp: o.price } : p));
        }
        return [...prev, { ...order, ltp: o.price }];
      });
    },
    []
  );

  const livePositions = useMemo(
    () => positions.map((p) => ({ ...p, ltp: quotes[p.symbol]?.price ?? p.ltp })),
    [positions, quotes]
  );

  const totalPnl = livePositions.reduce((a, p) => {
    const pnl = (p.side === "BUY" ? p.ltp - p.price : p.price - p.ltp) * p.qty;
    return a + pnl;
  }, 0);

  return (
    <div className="tx-terminal flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <TopBar quotes={quotes} onSelect={setSymbol} balance={balance} />
      <TickerTape quotes={quotes} onSelect={setSymbol} />
      <div className="mx-2 mt-2">
        <WorkspaceTabs active={workspace} onChange={setWorkspace} />
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-2 p-2 lg:flex-row">
        {/* left rail */}
        <div className="h-96 shrink-0 lg:h-auto lg:w-64 xl:w-72">
          <Watchlist quotes={quotes} selected={symbol} onSelect={setSymbol} />
        </div>

        {/* center column */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          {workspace === "terminal" ? (
            <>
              <div className="tx-panel">
                <SymbolHeader symbol={symbol} quote={quote} />
              </div>

              {/* chart / heatmap panel */}
              <div className="tx-panel flex min-h-104 flex-1 flex-col overflow-hidden">
            <div className="tx-panel-head flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setView("chart")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    view === "chart" ? "bg-amber-500/15 text-amber-300" : "text-white/45 hover:bg-white/5 hover:text-white/75"
                  }`}
                >
                  <LineChart className="h-3.5 w-3.5" /> Chart
                </button>
                <button
                  onClick={() => setView("heatmap")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    view === "heatmap" ? "bg-amber-500/15 text-amber-300" : "text-white/45 hover:bg-white/5 hover:text-white/75"
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
                          timeframe === t.key ? "bg-white/14 text-white" : "text-white/45 hover:text-white/80"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
                  <span className="tx-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE FEED
                </span>
                <span className="rounded-md border border-white/10 bg-white/4 px-2 py-1 font-mono text-[10px] text-white/55">
                  P&amp;L{" "}
                  <span className={totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {totalPnl >= 0 ? "+" : "−"}
                    {fmtINR(Math.abs(totalPnl))}
                  </span>
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
                {view === "chart" ? (
                  <CandleChart symbol={symbol} candles={candles} timeframe={timeframe} price={quote.price} />
                ) : (
                  <Heatmap quotes={quotes} onSelect={setSymbol} />
                )}
              </div>
            </div>

            {/* positions / orders */}
            <div className="h-64 shrink-0 lg:h-56">
              <BottomTabs positions={livePositions} orders={orders} />
            </div>
          </>
          ) : (
            <div className="tx-panel flex min-h-104 flex-1 flex-col overflow-hidden">
              {workspace === "options" && <OptionsChain symbol={symbol} quote={quote} />}
              {workspace === "multi" && <MultiChart symbol={symbol} quotes={quotes} onSelect={setSymbol} />}
              {workspace === "algo" && <AlgoStudio symbol={symbol} quotes={quotes} onSelect={setSymbol} />}
              {workspace === "backtest" && <Backtest symbol={symbol} quotes={quotes} />}
              {workspace === "journal" && <Journal orders={orders} />}
              {workspace === "academy" && <Academy />}
              {workspace === "autopilot" && (
                <Autopilot quotes={quotes} positions={livePositions} onExecute={onExecute} />
              )}
              {workspace === "shariah" && (
                <ShariahScreenerView onSelectSymbol={setSymbol} />
              )}
            </div>
          )}
        </section>

        {/* right rail */}
        <aside className="tx-scroll flex w-full shrink-0 flex-col gap-2 overflow-y-auto xl:w-84">
          <OrderTicket symbol={symbol} quote={quote} balance={balance} onExecute={onExecute} />
          <MarketDepth price={quote.price} />
          <AiPanel symbol={symbol} candles={candles} />
        </aside>
      </main>

      <StatusBar fps={fps} />
      <AiCopilot quotes={quotes} />
      <AiCore quotes={quotes} symbol={symbol} positions={livePositions} onSelect={setSymbol} onExecute={onExecute} />
    </div>
  );
}
