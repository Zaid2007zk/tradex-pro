"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  Wallet,
  Scale,
  GraduationCap,
  Sparkles,
  Bookmark,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Settings,
  Sliders,
  Layers,
  BookOpen,
  Cpu,
  Grid,
  Bell,
  Flame,
  Trophy,
  Menu,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import { AuthUser } from "./AuthModal";

export type NavTabType =
  | "overview"
  | "compare"
  | "assistant"
  | "watchlist"
  | "academy"
  | "backtest"
  | "paper"
  | "shariah"
  | "theme"
  | "multichart"
  | "algo";

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  user: AuthUser | null;
  onOpenAuth: (tab?: "login" | "signup" | "demo") => void;
  onLogout: () => void;
  onOpenBroker?: () => void;
  activeBroker?: string;
  onOpenSubscription?: () => void;
  onOpenSettings?: () => void;
  onOpenOptionsChain?: () => void;
  onOpenTradeJournal?: () => void;
  onOpenHeatmap?: () => void;
  onOpenAlerts?: () => void;
  onOpenLeaderboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenBroker,
  activeBroker = "Zerodha Kite",
  onOpenSubscription,
  onOpenSettings,
  onOpenOptionsChain,
  onOpenTradeJournal,
  onOpenHeatmap,
  onOpenAlerts,
  onOpenLeaderboard,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const moreToolsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (moreToolsRef.current && !moreToolsRef.current.contains(e.target as Node)) {
        setIsMoreToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const secondaryTools = [
    {
      id: "algo",
      label: "Algo Studio",
      desc: "Automated Strategy Studio & Quant Bots",
      icon: Cpu,
      color: "text-indigo-400",
    },
    {
      id: "backtest",
      label: "Strategy Backtest",
      desc: "Historical Momentum Backtester",
      icon: LineChart,
      color: "text-cyan-400",
    },
    {
      id: "academy",
      label: "TradeX Academy",
      desc: "Interactive Curriculum & Quizzes",
      icon: GraduationCap,
      color: "text-purple-400",
    },
    {
      id: "compare",
      label: "Stock Matrix",
      desc: "Multi-Factor Factor Radar & Correlation",
      icon: LineChart,
      color: "text-blue-400",
    },
    {
      id: "assistant",
      label: "AI Copilot Chat",
      desc: "Institutional Research Chatbot",
      icon: Sparkles,
      color: "text-purple-400",
    },
    {
      id: "shariah",
      label: "Shariah Screener",
      desc: "Islamic Finance AAOIFI Screening",
      icon: Scale,
      color: "text-emerald-400",
    },
    {
      id: "watchlist",
      label: "Watchlist Manager",
      desc: "Custom Sector & Portfolio Tracking",
      icon: Bookmark,
      color: "text-amber-400",
    },
    {
      id: "multichart",
      label: "Multi-Chart Grid",
      desc: "4-Pane Simultaneous Timeframe Grid",
      icon: Grid,
      color: "text-cyan-400",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#090C13] border-b border-slate-800 select-none shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-[1720px] mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-between h-14 py-2 gap-3 w-full">
            {/* Left: Brand & Primary Core Tabs */}
            <div className="flex items-center space-x-3 lg:space-x-4 shrink-0">
              {/* Brand Logo */}
              <div
                className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
                onClick={() => setActiveTab("overview")}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center justify-center transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#0B0E17] rounded-[7px] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-base font-black tracking-tight text-white">
                    TradeX <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">PRO</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">
                    INSTITUTIONAL
                  </span>
                </div>
              </div>

              {/* Primary Core Tabs (Compact - Zero Overlap Guaranteed) */}
              <nav className="hidden xl:flex items-center space-x-1.5 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === "overview"
                      ? "text-white bg-[#1E222D] font-bold border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#1E222D]/60"
                  }`}
                >
                  Terminal
                </button>

                <button
                  onClick={() => setActiveTab("paper")}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "paper"
                      ? "text-white bg-[#1E222D] font-bold border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#1E222D]/60"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-blue-400" />
                  <span>Paper Trading</span>
                </button>

                {/* More Tools Dropdown Menu */}
                <div className="relative" ref={moreToolsRef}>
                  <button
                    onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer ${
                      isMoreToolsOpen ||
                      ["algo", "backtest", "academy", "compare", "assistant", "shariah", "watchlist", "multichart"].includes(activeTab)
                        ? "text-cyan-300 bg-[#1E222D] font-bold border border-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-[#1E222D]/60"
                    }`}
                  >
                    <span>More Tools</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isMoreToolsOpen && (
                    <div
                      style={{ backgroundColor: "#0A0D15", opacity: 1 }}
                      className="absolute left-0 mt-2 w-64 border-2 border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,1)] py-2 z-[100] ring-1 ring-sky-500/20"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider border-b border-slate-800">
                        Trading Workspaces
                      </div>
                      <div className="py-1">
                        {secondaryTools.map((tool) => {
                          const IconComp = tool.icon;
                          const isCur = activeTab === tool.id;
                          return (
                            <button
                              key={tool.id}
                              onClick={() => {
                                setActiveTab(tool.id as NavTabType);
                                setIsMoreToolsOpen(false);
                              }}
                              style={{ backgroundColor: isCur ? "#16233B" : "#0A0D15" }}
                              className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition text-xs ${
                                isCur
                                  ? "text-white font-bold border-l-2 border-blue-400"
                                  : "text-slate-300 hover:bg-[#131A29] hover:text-white"
                              }`}
                            >
                              <IconComp className={`w-4 h-4 ${tool.color}`} />
                              <div>
                                <div className="font-semibold">{tool.label}</div>
                                <div className="text-[10px] text-slate-500">{tool.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider border-t border-b border-slate-800 mt-1">
                        Institutional Tools
                      </div>
                      <div className="py-1">
                        {onOpenOptionsChain && (
                          <button
                            onClick={() => {
                              onOpenOptionsChain();
                              setIsMoreToolsOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-300 hover:bg-[#131A29] hover:text-white transition"
                          >
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <span>Options Chain &amp; Greeks</span>
                          </button>
                        )}
                        {onOpenTradeJournal && (
                          <button
                            onClick={() => {
                              onOpenTradeJournal();
                              setIsMoreToolsOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-300 hover:bg-[#131A29] hover:text-white transition"
                          >
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span>Trade Performance Journal</span>
                          </button>
                        )}
                        {onOpenHeatmap && (
                          <button
                            onClick={() => {
                              onOpenHeatmap();
                              setIsMoreToolsOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-300 hover:bg-[#131A29] hover:text-white transition"
                          >
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span>Sector Heatmap &amp; Sentiment</span>
                          </button>
                        )}
                        {onOpenLeaderboard && (
                          <button
                            onClick={() => {
                              onOpenLeaderboard();
                              setIsMoreToolsOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-300 hover:bg-[#131A29] hover:text-white transition"
                          >
                            <Trophy className="w-4 h-4 text-cyan-400" />
                            <span>VIP Trader Leaderboard</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Right: Actions, AI Engine, Alerts & User Account (Locked Right) */}
            <div className="flex items-center space-x-2 shrink-0 ml-auto">
              {/* Live Alerts Button */}
              {onOpenAlerts && (
                <button
                  onClick={onOpenAlerts}
                  title="Live AI Trade Alerts & Scanner"
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-bold text-blue-400 transition cursor-pointer relative shrink-0"
                >
                  <div className="relative">
                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <span className="hidden sm:inline">Alerts</span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-black">
                    4
                  </span>
                </button>
              )}

              {/* Autonomous AI Engine Status Badge */}
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("tradex-open-copilot"));
                  }
                }}
                title="TradeX AI Engine (Groq / Gemini / Autonomous)"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-emerald-900/30 border border-purple-500/50 text-xs font-bold text-white hover:border-purple-400 transition cursor-pointer shadow-sm shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden md:inline bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text text-transparent">
                  AI Engine
                </span>
                <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">
                  ACTIVE
                </span>
              </button>

              {/* Pricing & Subscription Button */}
              {onOpenSubscription && (
                <button
                  onClick={onOpenSubscription}
                  title="Pricing & Subscription Plans"
                  className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#2962FF]/10 hover:bg-[#2962FF]/20 border border-[#2962FF]/40 text-xs font-semibold text-[#2962FF] hover:text-[#5282FF] transition cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] bg-[#2962FF] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                    PRO
                  </span>
                </button>
              )}

              {/* User Account / Profile */}
              {user ? (
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1.5 text-xs text-slate-100 bg-[#0F1420] hover:bg-[#161D2E] px-2.5 py-1 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                      P
                    </div>
                    <span className="truncate max-w-[80px] sm:max-w-[120px] font-bold text-slate-200 hidden xs:inline">
                      {user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      style={{ backgroundColor: "#0A0D15", opacity: 1 }}
                      className="absolute right-0 mt-2 w-64 border-2 border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,1)] py-1.5 z-[100] text-xs"
                    >
                      <div className="px-3 py-2 border-b border-[#202738] bg-[#07090F]/70">
                        <div className="font-bold text-white truncate flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">
                            PRO TERMINAL ACCESS
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {onOpenBroker && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenBroker();
                            }}
                            className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                          >
                            <Sliders className="w-4 h-4 text-[#089981]" />
                            <div>
                              <div className="font-medium">Broker Gateway (DMA)</div>
                              <div className="text-[10px] text-[#787B86]">{activeBroker}</div>
                            </div>
                          </button>
                        )}

                        {onOpenSettings && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenSettings();
                            }}
                            className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                          >
                            <Settings className="w-4 h-4 text-[#2962FF]" />
                            <div>
                              <div className="font-medium">Terminal Settings</div>
                              <div className="text-[10px] text-[#787B86]">Risk controls &amp; defaults</div>
                            </div>
                          </button>
                        )}

                        {onOpenSubscription && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenSubscription();
                            }}
                            className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                          >
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="font-medium">Subscription &amp; Plans</div>
                              <div className="text-[10px] text-[#787B86]">Manage billing &amp; tier upgrades</div>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-[#2A2E39] py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-1.5 text-[#F23645] hover:bg-[#2A2E39] flex items-center gap-2 transition font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => onOpenAuth("login")}
                    className="px-2.5 py-1 rounded text-xs font-semibold text-[#D1D4DC] hover:text-white hover:bg-[#1E222D] border border-[#2A2E39] transition cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onOpenAuth("signup")}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-[#2962FF] hover:bg-[#1E53E5] text-white transition shadow-sm cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile / Compact Screen All-Features Menu Trigger */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                title="All Features & Navigation Drawer"
                className="xl:hidden p-1.5 rounded-lg bg-[#1E222D] border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Small Screen Full Feature Drawer Modal */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            style={{ backgroundColor: "#0A0D15", opacity: 1 }}
            className="w-full max-w-sm border-l border-slate-800 h-full p-4 overflow-y-auto space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="font-extrabold text-white text-sm">All TradeX Pro Features</span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Workspaces */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Primary Trading Views
              </span>
              {[
                { id: "overview", label: "📊 Chart & Terminal", desc: "Live Candle & Signals" },
                { id: "paper", label: "💼 Paper Trading (₹10L)", desc: "Zero Risk Virtual Simulator" },
                { id: "algo", label: "🤖 Algo Studio", desc: "Quantitative Strategy Automations" },
                { id: "backtest", label: "⚡ Strategy Backtest", desc: "Historical Momentum Backtester" },
                { id: "compare", label: "🔍 Stock Matrix", desc: "Multi-Factor Radar" },
                { id: "multichart", label: "▦ Multi-Chart Grid", desc: "4-Pane Chart Screen" },
                { id: "academy", label: "🎓 Academy", desc: "Curriculum & Quizzes" },
                { id: "assistant", label: "✨ AI Copilot", desc: "Research & Strategy Chat" },
                { id: "shariah", label: "☪️ Shariah Screener", desc: "AAOIFI Halal Stock Checker" },
                { id: "watchlist", label: "🔖 Watchlist", desc: "Saved Tickers & Price Tracker" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as NavTabType);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    activeTab === tab.id
                      ? "bg-blue-600/20 border-blue-500/50 text-white font-bold"
                      : "bg-[#111624] border-slate-800 text-slate-300 hover:bg-[#171E30]"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{tab.label}</div>
                    <div className="text-[10px] text-slate-500">{tab.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>

            {/* Institutional Modals */}
            <div className="space-y-1.5 border-t border-slate-800 pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Modals &amp; Analytics
              </span>
              {onOpenOptionsChain && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenOptionsChain();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#111624] border border-slate-800 text-emerald-400 text-xs font-semibold hover:bg-[#171E30] transition"
                >
                  📜 Open Options Chain &amp; Greeks
                </button>
              )}
              {onOpenHeatmap && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenHeatmap();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#111624] border border-slate-800 text-amber-400 text-xs font-semibold hover:bg-[#171E30] transition"
                >
                  🗺️ Sector Heatmap &amp; Sentiment
                </button>
              )}
              {onOpenTradeJournal && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenTradeJournal();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#111624] border border-slate-800 text-purple-400 text-xs font-semibold hover:bg-[#171E30] transition"
                >
                  📓 Trade Journal &amp; Equity Curve
                </button>
              )}
              {onOpenAlerts && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenAlerts();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#111624] border border-slate-800 text-blue-400 text-xs font-semibold hover:bg-[#171E30] transition"
                >
                  🔔 Live Breakout Alerts Scanner
                </button>
              )}
              {onOpenLeaderboard && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenLeaderboard();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#111624] border border-slate-800 text-cyan-400 text-xs font-semibold hover:bg-[#171E30] transition"
                >
                  🏆 VIP Trader Leaderboard
                </button>
              )}
            </div>

            {/* Quick Actions & Auth */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              {onOpenSettings && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#131722] border border-slate-800 text-slate-300 text-xs font-medium hover:text-white transition flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Terminal Settings</span>
                </button>
              )}
              {onOpenSubscription && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenSubscription();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[#131722] border border-slate-800 text-slate-300 text-xs font-medium hover:text-white transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Pricing &amp; Plans</span>
                </button>
              )}
              {user ? (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenAuth("login");
                  }}
                  className="w-full text-center p-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
