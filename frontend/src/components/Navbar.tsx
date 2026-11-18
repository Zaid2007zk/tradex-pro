"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  Grid3X3,
  FlaskConical,
  Wallet,
  Scale,
  GraduationCap,
  Sparkles,
  Bookmark,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Settings,
  CreditCard,
  User,
  Sliders,
  Layers,
  BookOpen,
  Cpu,
  Grid,
  Bell,
  Flame,
  Trophy,
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#090C13]/90 backdrop-blur-xl border-b border-slate-800 select-none shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-5">
        <div className="flex justify-between items-center h-13 py-2">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center space-x-6">
            {/* Brand Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer group"
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
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">
                  INSTITUTIONAL
                </span>
              </div>
            </div>

            {/* Navigation Tabs (TradingView-style clean buttons) */}
            <nav className="hidden xl:flex items-center space-x-0.5 text-[13px] font-medium text-[#787B86]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "overview"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Chart &amp; Terminal
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "compare"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Stock Matrix
              </button>
              <button
                onClick={() => setActiveTab("backtest")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "backtest"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Strategy Backtest
              </button>
              <button
                onClick={() => setActiveTab("paper")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "paper"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Paper Trading</span>
              </button>
              <button
                onClick={() => setActiveTab("shariah")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "shariah"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#089981]" />
                <span>Shariah</span>
              </button>
              <button
                onClick={() => setActiveTab("academy")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "academy"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#2962FF]" />
                <span>Academy</span>
              </button>
              <button
                onClick={() => setActiveTab("assistant")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "assistant"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Copilot</span>
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "watchlist"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
              </button>
              <button
                onClick={() => setActiveTab("multichart")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "multichart"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-Chart</span>
              </button>
              <button
                onClick={() => setActiveTab("algo")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "algo"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Algo Studio</span>
              </button>
            </nav>
          </div>

          {/* Right: Actions, Subscription, Settings & User Account */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Options Chain Quick Action */}
            {onOpenOptionsChain && (
              <button
                onClick={onOpenOptionsChain}
                title="Open F&O Options Chain & Greeks"
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#089981]" />
                <span className="text-[12px] font-medium">Options</span>
              </button>
            )}

            {/* Trade Journal Quick Action */}
            {onOpenTradeJournal && (
              <button
                onClick={onOpenTradeJournal}
                title="Performance Journal & Execution Log"
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[12px] font-medium">Journal</span>
              </button>
            )}

            {/* Live Breakout Alerts Button */}
            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                title="Live AI Trade Alerts & Scanner"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-bold text-blue-400 transition cursor-pointer relative"
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

            {/* Sector Heatmap & Market Mood Button */}
            {onOpenHeatmap && (
              <button
                onClick={onOpenHeatmap}
                title="Sector Heatmap & Fear/Greed Sentiment Radar"
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0F1422] hover:bg-[#181F33] border border-emerald-500/30 text-xs font-bold text-emerald-400 transition cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>Heatmap</span>
              </button>
            )}

            {/* VIP Trader Leaderboard Button */}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                title="VIP Trader Leaderboard & Discipline Scorecard"
                className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0F1422] hover:bg-[#181F33] border border-slate-800 text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
                <span>Rank #4</span>
              </button>
            )}
            {/* Autonomous AI Engine Status Badge */}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("tradex-open-copilot"));
                }
              }}
              title="TradeX AI Autonomous Intelligence Engine: Fully Active (Click to open Gemini Copilot)"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-emerald-900/30 border border-purple-500/50 text-xs font-bold text-white hover:border-purple-400 transition cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text text-transparent">
                AI Mode: 100% Active
              </span>
              <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">
                AI
              </span>
            </button>

            {/* Subscription / Pricing Button */}
            <button
              onClick={onOpenSubscription}
              title="Pricing & Subscription Plans"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2962FF]/10 hover:bg-[#2962FF]/20 border border-[#2962FF]/40 text-xs font-semibold text-[#2962FF] hover:text-[#5282FF] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pricing &amp; Plans</span>
              <span className="text-[10px] bg-[#2962FF] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                Pro
              </span>
            </button>

            {/* Terminal Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Terminal Settings & Risk Controls"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#787B86]" />
              <span className="hidden md:inline text-[12px] font-medium">Settings</span>
            </button>

            {/* Broker DMA Indicator */}
            <button
              onClick={onOpenBroker}
              title="Broker Gateway (Zerodha / Upstox / DMA)"
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] text-xs transition text-[#D1D4DC] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="text-[12px] font-medium text-[#787B86]">Broker:</span>
              <span className="text-[12px] font-semibold text-[#D1D4DC]">{activeBroker}</span>
              <ChevronDown className="w-3 h-3 text-[#787B86]" />
            </button>

            {/* User Account / Profile / Auth */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-xs text-slate-100 bg-[#0F1420] hover:bg-[#161D2E] px-2.5 py-1 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                      P
                    </div>
                    <span className="truncate max-w-[100px] sm:max-w-[140px] font-bold text-slate-200">
                      {user.email}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-[#0E121C] border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-xl">
                      <div className="px-3 py-2 border-b border-[#202738] bg-[#07090F]/70">
                        <div className="font-bold text-white truncate flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">
                            PRO TERMINAL ACCESS
                          </span>
                          <span className="text-[10px] text-slate-400">ID: MP-98421</span>
                        </div>
                      </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenSubscription) onOpenSubscription();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-medium">Subscription &amp; Plans</div>
                          <div className="text-[10px] text-[#787B86]">Manage billing &amp; tier upgrades</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Settings className="w-4 h-4 text-[#2962FF]" />
                        <div>
                          <div className="font-medium">Terminal Settings</div>
                          <div className="text-[10px] text-[#787B86]">Risk limits, defaults &amp; layout</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenBroker) onOpenBroker();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Sliders className="w-4 h-4 text-[#089981]" />
                        <div>
                          <div className="font-medium">Broker Gateway (DMA)</div>
                          <div className="text-[10px] text-[#787B86]">{activeBroker}</div>
                        </div>
                      </button>

                      {onOpenOptionsChain && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenOptionsChain();
                          }}
                          className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                        >
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="font-medium">Options Chain &amp; Greeks</div>
                            <div className="text-[10px] text-[#787B86]">Open Interest &amp; PCR Matrix</div>
                          </div>
                        </button>
                      )}

                      {onOpenTradeJournal && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenTradeJournal();
                          }}
                          className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                        >
                          <BookOpen className="w-4 h-4 text-purple-400" />
                          <div>
                            <div className="font-medium">Performance Journal</div>
                            <div className="text-[10px] text-[#787B86]">Review trades &amp; equity curve</div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-[#2A2E39] py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth("login");
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Switch Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth("signup");
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create New Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#F23645] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Quick Sign Out Button */}
              <button
                onClick={onLogout}
                title="Sign Out & Lock Terminal"
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-3 py-1 rounded text-xs font-semibold text-[#D1D4DC] hover:text-white hover:bg-[#1E222D] border border-[#2A2E39] transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#2962FF] hover:bg-[#1E53E5] text-white transition shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
