"use client";

import React, { useState } from "react";
import {
  X,
  Crown,
  Trophy,
  Medal,
  Award,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { soundEngine } from "@/utils/soundEngine";

interface VIPLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  totalPnl?: number;
}

export const VIPLeaderboardModal: React.FC<VIPLeaderboardModalProps> = ({
  isOpen,
  onClose,
  userEmail = "vip.trader@tradex.elite",
  totalPnl = 24650.0,
}) => {
  if (!isOpen) return null;

  const topTraders = [
    { rank: 1, name: "Arjun 'QuantAlpha' V.", returns: "+₹68,450.00", returnPct: "+6.84%", winRate: "92%", trades: 24, badge: "🥇 GRAND MASTER" },
    { rank: 2, name: "Vikram 'ScalpMaster' S.", returns: "+₹44,200.00", returnPct: "+4.42%", winRate: "85%", trades: 19, badge: "🥈 ELITE SCALPER" },
    { rank: 3, name: "Priya 'SwingEdge' M.", returns: "+₹31,800.00", returnPct: "+3.18%", winRate: "81%", trades: 14, badge: "🥉 SWING PRO" },
    { rank: 4, name: `You (${userEmail.split("@")[0]})`, returns: `+₹${totalPnl.toFixed(2)}`, returnPct: "+2.46%", winRate: "78.6%", trades: 14, badge: "👑 VIP TACTICAL", isUser: true },
    { rank: 5, name: "Rohan 'BreakoutKing' D.", returns: "+₹21,150.00", returnPct: "+2.11%", winRate: "75%", trades: 16, badge: "🎖️ TACTICAL" },
    { rank: 6, name: "Ananya 'RiskShield' K.", returns: "+₹18,900.00", returnPct: "+1.89%", winRate: "88%", trades: 9, badge: "🛡️ DEFENDER" },
    { rank: 7, name: "Kabir 'AlgoPulse' T.", returns: "+₹16,400.00", returnPct: "+1.64%", winRate: "71%", trades: 21, badge: "⚡ QUANT" },
    { rank: 8, name: "Siddharth 'DeltaHedge' N.", returns: "+₹14,250.00", returnPct: "+1.42%", winRate: "69%", trades: 18, badge: "📊 SPECIALIST" },
  ];

  const earnedBadges = [
    { title: "Iron Risk Shield", icon: "🛡️", desc: "Never open a trade without verified Stop-Loss" },
    { title: "Breakout Hunter", icon: "⚡", desc: "Executed 5 profitable momentum breakouts" },
    { title: "Target Sniper", icon: "🎯", desc: "Successfully booked profit at Target 1 (+2.5%)" },
    { title: "VIP Millionaire", icon: "💎", desc: "Maintained active ₹10L virtual quant portfolio" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0E17] border border-amber-500/25 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2433] bg-[#0E121D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0E17] rounded-[9px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-mono">
                  VIP Trader Leaderboard &amp; Discipline Scorecard
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  SEASON 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional Quant Trader Rankings &amp; Virtual Paper Performance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2433] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* User Scorecard Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#101524] to-[#0E121E] border border-amber-500/25 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] shadow-md">
                  <div className="w-full h-full bg-[#0B0E17] rounded-[10px] flex items-center justify-center text-amber-300 font-black text-xl">
                    👑
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-white font-mono">{userEmail}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      RANK #4
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Trader Status: <strong className="text-amber-300">Level 4: Tactical Quant Trader 🎖️</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-[#151926] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Discipline Score</span>
                  <span className="text-sm font-extrabold text-emerald-400">94 / 100</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#151926] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Win Rate</span>
                  <span className="text-sm font-extrabold text-emerald-400">78.6%</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#151926] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Total Profit</span>
                  <span className="text-sm font-extrabold text-emerald-400">+₹{totalPnl.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>XP Progress: <strong>2,450 / 3,000 XP</strong></span>
                <span className="text-amber-300 font-bold">550 XP to Level 5 (Master Quant)</span>
              </div>
              <div className="h-2 w-full bg-[#181D2A] rounded-full overflow-hidden p-0.5 border border-[#232A3B]">
                <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" style={{ width: "81%" }} />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {earnedBadges.map((badge, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#0A0D15] border border-amber-500/15 flex items-center space-x-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{badge.title}</span>
                    <span className="text-[9px] text-slate-500 leading-tight block">{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Leaderboard Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Top VIP Quantitative Traders</span>
            </h4>

            <div className="rounded-xl border border-[#1E2433] bg-[#0E121E] overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1E2433] bg-[#080B12] text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Trader Handle</th>
                    <th className="py-2.5 px-3">Badge</th>
                    <th className="py-2.5 px-3 text-right">Trades</th>
                    <th className="py-2.5 px-3 text-right">Win Rate</th>
                    <th className="py-2.5 px-3 text-right">Today's P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2030]">
                  {topTraders.map((trader) => (
                    <tr
                      key={trader.rank}
                      className={`hover:bg-[#141A29] transition ${
                        trader.isUser ? "bg-amber-500/10 font-bold border-l-2 border-amber-400" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                          trader.rank === 1 ? "bg-yellow-400 text-black shadow" :
                          trader.rank === 2 ? "bg-slate-300 text-black" :
                          trader.rank === 3 ? "bg-amber-600 text-white" : "bg-[#181D2A] text-slate-400"
                        }`}>
                          {trader.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-bold">
                        {trader.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-white/5">
                          {trader.badge}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {trader.trades}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                        {trader.winRate}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold text-sm">
                        {trader.returns}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1E2433] bg-[#0E121D] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">LEADERBOARD UPDATES IN REAL-TIME</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181D2A] hover:bg-[#22293B] text-white font-bold transition"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};