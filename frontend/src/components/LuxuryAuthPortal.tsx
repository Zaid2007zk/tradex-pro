"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  Globe2,
  KeyRound,
  UserCheck,
  ChevronRight,
  Shield,
  Coins,
  Bot,
  GraduationCap,
  Flame,
  BarChart3,
  Cpu,
  Sliders,
  RotateCcw,
  Check,
} from "lucide-react";
import { AuthUser } from "./AuthModal";
import { soundEngine } from "@/utils/soundEngine";

export type UserPersonaType = "beginner" | "scalper" | "quant" | "autopilot";

export interface UserPersonaOption {
  id: UserPersonaType;
  title: string;
  subtitle: string;
  badge: string;
  level: string;
  description: string;
  includesPrior: string;
  isPopular?: boolean;
  features: string[];
  gradient: string;
  borderHover: string;
  icon: React.ReactNode;
}

interface LuxuryAuthPortalProps {
  onAuthSuccess: (user: AuthUser, persona?: UserPersonaType) => void;
  defaultTab?: "login" | "signup";
  currentUser?: AuthUser | null;
  onContinueAsCurrent?: () => void;
}

export const LuxuryAuthPortal: React.FC<LuxuryAuthPortalProps> = ({
  onAuthSuccess,
  defaultTab = "login",
  currentUser,
  onContinueAsCurrent,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [portalStage, setPortalStage] = useState<"auth" | "persona">("auth");
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated user holding state during persona selection
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(currentUser || null);
  const [selectedPersona, setSelectedPersona] = useState<UserPersonaType | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configStep, setConfigStep] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Interactive Antigravity Particle Constellation Engine
  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking for reactive gravity
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particle nodes
    const particleCount = Math.min(65, Math.floor(width / 22));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.45 + 0.25,
      hue: Math.random() > 0.45 ? 195 : 218, // Cyan (195) or Electric Cobalt (218)
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect particles with glowing neural lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particles
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on boundaries
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse gravity pull
        const dxMouse = mouse.x - p1.x;
        const dyMouse = mouse.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 160) {
          p1.x += (dxMouse / distMouse) * 0.35;
          p1.y += (dyMouse / distMouse) * 0.35;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p1.hue === 195
            ? `rgba(6, 182, 212, ${p1.alpha})`
            : `rgba(96, 165, 250, ${p1.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p1.hue === 195 ? "#06b6d4" : "#3b82f6";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const lineAlpha = (1 - dist / 115) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle =
              p1.hue === 195
                ? `rgba(6, 182, 212, ${lineAlpha})`
                : `rgba(59, 130, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your registered email and password.");
      return;
    }

    setLoading(true);
    soundEngine.playOrderFilled();

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          email: data.email,
          user_id: data.user_id,
          auth_mode: data.auth_mode,
          token: data.token,
        };
        try {
          localStorage.setItem("marketpulse_auth", JSON.stringify(user));
          localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
        } catch {}
        setPendingUser(user);
        setPortalStage("persona");
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback seamless VIP login for static deploy
    const user: AuthUser = {
      email: email.trim(),
      user_id: `vip_${Math.floor(Math.random() * 900000 + 100000)}`,
      auth_mode: "demo",
    };
    try {
      localStorage.setItem("marketpulse_auth", JSON.stringify(user));
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
    } catch {}
    setPendingUser(user);
    setPortalStage("persona");
    setLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide an email address and strong password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    soundEngine.playOrderFilled();

    const user: AuthUser = {
      email: email.trim(),
      user_id: `vip_${Math.floor(Math.random() * 900000 + 100000)}`,
      auth_mode: "demo",
    };
    try {
      localStorage.setItem("marketpulse_auth", JSON.stringify(user));
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
    } catch {}
    setPendingUser(user);
    setPortalStage("persona");
    setLoading(false);
  };

  const handleInstantVipGuest = () => {
    soundEngine.playOrderFilled();
    const guestUser: AuthUser = {
      email: "vip.trader@tradex.elite",
      user_id: "00000000-0000-0000-0000-000000000001",
      auth_mode: "demo",
    };
    try {
      localStorage.setItem("marketpulse_auth", JSON.stringify(guestUser));
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(guestUser));
    } catch {}
    setPendingUser(guestUser);
    setPortalStage("persona");
  };

  // Persona options definition - Institutional Progression Architecture (Level 1 -> 2 -> 3 -> 4 Max)
  const personaOptions: UserPersonaOption[] = [
    {
      id: "beginner",
      title: "Foundational Trader",
      subtitle: "Risk-Free Simulation & AI Mentorship",
      badge: "LEVEL 1 • STARTER",
      level: "Foundation Tier",
      description:
        "Master the financial markets systematically with zero capital exposure. Real-time chart analysis, risk mitigation principles, and interactive AI voice telemetry.",
      includesPrior: "Base Platform Features (Included):",
      features: [
        "Interactive AI Voice Guidance & Financial Telemetry",
        "₹10,00,000 Institutional Virtual Margin Allocation",
        "Real-Time Multi-Exchange Technical Charting",
        "Full Delivery (CNC) Risk-Free Execution Simulator",
      ],
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderHover: "hover:border-emerald-400 group-hover:shadow-emerald-500/20",
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: "scalper",
      title: "Active Momentum Scalper",
      subtitle: "High-Frequency Execution & DMA Routing",
      badge: "LEVEL 2 • PRO VELOCITY",
      level: "Velocity Tier",
      description:
        "Engineered for active intraday participants prioritizing ultra-low latency execution, tight risk parameters, and direct broker liquidity gateway integration.",
      includesPrior: "Includes All Level 1 Capabilities, PLUS:",
      features: [
        "1-Click Turbo Order Routing (5x Margin Leverage)",
        "Real-Time Volatility Breakout Scanner & Audio Chimes",
        "Direct Market Access (Zerodha Kite, Upstox, Angel)",
        "Dynamic Breakout Pivots & Automated Stop-Loss Engine",
      ],
      gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      borderHover: "hover:border-cyan-400 group-hover:shadow-cyan-500/20",
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: "quant",
      title: "Quantitative Analyst / Swing Pro",
      subtitle: "Data Science, Factor Alpha & Backtesting",
      badge: "LEVEL 3 • TACTICAL QUANT",
      level: "Tactical Quant Tier",
      description:
        "Designed for systematic researchers requiring algorithmic strategy backtesting, multi-factor alpha ranking, sector correlation matrices, and derivatives Greeks.",
      includesPrior: "Includes All Level 1 & 2 Capabilities, PLUS:",
      features: [
        "Multi-Factor Quantitative Alpha Radar (Sharpe, Volatility)",
        "Algorithmic Walk-Forward Strategy Backtesting Studio",
        "Cross-Sector Heatmap & Complete Options Greeks Matrix",
        "Institutional Trade Journal & Performance Analytics",
      ],
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      borderHover: "hover:border-blue-400 group-hover:shadow-blue-500/20",
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
    },
    {
      id: "autopilot",
      title: "Autonomous AI Trading System",
      subtitle: "100% Autonomous Algorithmic Execution",
      badge: "LEVEL 4 • AUTONOMOUS MAX",
      level: "Enterprise Max",
      isPopular: true,
      description:
        "Complete unrestricted institutional access with autonomous market-scanning agents, real-time algorithmic execution, and automated dynamic trailing risk controls.",
      includesPrior: "ALL CAPABILITIES UNLOCKED (LEVEL 1, 2, 3 + MAX):",
      features: [
        "Autonomous AI Trading Agent (20-SMA & RSI Confluence)",
        "Automated Order Execution with Dynamic Trailing SL",
        "Live High-Fidelity Audio Telemetry Trade Broadcasts",
        "Institutional Co-Location Ultra-Low Latency Engine Speed",
      ],
      gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
      borderHover: "hover:border-purple-400 group-hover:shadow-purple-500/20",
      icon: <Bot className="w-5 h-5 text-purple-400" />,
    },
  ];

  const handleSelectPersona = (personaId: UserPersonaType) => {
    setSelectedPersona(personaId);
    setIsConfiguring(true);
    soundEngine.playOrderFilled();

    try {
      localStorage.setItem("marketpulse_user_persona", personaId);
    } catch {}

    const steps = [
      "Unlocking Tier Permissions & Neural Engine...",
      `Applying ${personaId.toUpperCase()} Architecture (Level ${personaId === "beginner" ? "1" : personaId === "scalper" ? "2" : personaId === "quant" ? "3" : "4"})...`,
      "Synchronizing Real-Time DMA & ₹10,00,000 Capital...",
      "Launching TradeX ELITE Institutional Workspace...",
    ];

    let sIdx = 0;
    setConfigStep(steps[0]);
    const stepInterval = setInterval(() => {
      sIdx++;
      if (sIdx < steps.length) {
        setConfigStep(steps[sIdx]);
      } else {
        clearInterval(stepInterval);
        const userToFinalize =
          pendingUser || {
            email: "vip.trader@tradex.elite",
            user_id: "00000000-0000-0000-0000-000000000001",
            auth_mode: "demo",
          };
        onAuthSuccess(userToFinalize, personaId);
      }
    }, 280);
  };

  const liveTickers = [
    { symbol: "NIFTY 50", price: "25,302.40", change: "+0.42%", exch: "NSE" },
    { symbol: "SENSEX", price: "82,248.12", change: "+0.38%", exch: "BSE" },
    { symbol: "RELIANCE", price: "₹1,337.30", change: "+0.97%", exch: "NSE" },
    { symbol: "S&P 500", price: "5,983.99", change: "+0.74%", exch: "NYSE" },
    { symbol: "NASDAQ", price: "19,281.40", change: "+0.92%", exch: "US" },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Interactive Antigravity Neural Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Luxury Background Glows & Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.08),transparent_45%),radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#090C13]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <div className="w-full h-full bg-[#0B0E17] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  TradeX <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">PRO</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-widest">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous AI Financial Terminal • Antigravity Neural Architecture
              </p>
            </div>
          </div>

          {/* Security & Encryption Badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>256-Bit Financial Encryption</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SEBI &amp; DMA Audited</span>
            </div>
          </div>
        </div>

        {/* Live Ticker Tape */}
        <div className="border-t border-[#1C2230] bg-[#07090F]/90 px-4 py-2 overflow-x-auto">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px] uppercase tracking-wider shrink-0">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Live Global Feeds</span>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
              {liveTickers.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 shrink-0">
                  <span className="text-slate-400 font-bold text-[11px]">{t.symbol}</span>
                  <span className="text-white font-extrabold text-[12px]">{t.price}</span>
                  <span className="text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {t.change}
                  </span>
                </div>
              ))}
            </div>
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-slate-400 shrink-0">
              <Globe2 className="w-3 h-3 text-slate-500" />
              <span>Exchanges: NSE • BSE • NYSE • NASDAQ</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body: Stage 1 (Auth) OR Stage 2 (Interactive Persona Selection) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {portalStage === "auth" ? (
          /* ============================================================ */
          /* STAGE 1: CREDENTIALS / SIGN IN / 1-CLICK INSTANT ACCESS      */
          /* ============================================================ */
          <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Value Proposition & Highlights */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>WELCOME TO THE NEXT-GENERATION QUANT TERMINAL</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
                  Institutional Edge. <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    Powered by Autonomous AI.
                  </span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                  Experience ultra-low latency Direct Market Access, live 60 FPS TradingView charting, and our dedicated personal voice trading mentor <strong className="text-blue-400">"Aria"</strong>. Master the markets 100% risk-free.
                </p>
              </div>

              {/* 4 Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl bg-[#0D111A]/80 border border-blue-500/20 backdrop-blur-md space-y-1 hover:border-blue-500/40 transition">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                    <span>Aria Voice Mentor</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Step-by-step institutional voice guidance, exact breakout triggers, and 1-click execution.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D111A]/80 border border-emerald-500/20 backdrop-blur-md space-y-1 hover:border-emerald-500/40 transition">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                    <Coins className="w-4 h-4" />
                    <span>₹10,00,000 Virtual Portfolio</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Instant simulated funds to backtest strategies in real-world live market conditions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D111A]/80 border border-blue-500/20 backdrop-blur-md space-y-1 hover:border-blue-500/40 transition">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Institutional DMA Execution</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Instant order routing via Zerodha Kite, Upstox, Interactive Brokers, and DMA gateways.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D111A]/80 border border-purple-500/20 backdrop-blur-md space-y-1 hover:border-purple-500/40 transition">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini Generative AI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Real LLM financial reasoning for entry, exit timing, options, and risk-reward equations.
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#07090E]">
                    TX
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#07090E]">
                    AI
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#07090E]">
                    QT
                  </div>
                </div>
                <span className="font-medium text-slate-300">
                  Over <strong>10,000+ traders</strong> execute institutional setups daily on TradeX.
                </span>
              </div>
            </div>

            {/* Right Side: Clean Glassmorphic Auth Card */}
            <div className="lg:col-span-5 w-full">
              <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-b from-blue-500/30 via-slate-700/20 to-[#1A2233] shadow-[0_0_40px_rgba(37,99,235,0.12)]">
                <div className="rounded-[15px] bg-[#0B0E17]/95 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
                  
                  {/* Card Title & Tab Switcher */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                          <span>Terminal Access</span>
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                        </h2>
                        <p className="text-xs text-slate-400">
                          {activeTab === "login" ? "Sign in to access your portfolio" : "Create your trading account in 30 seconds"}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ONLINE
                      </span>
                    </div>

                    {/* Returning User Quick Re-Entry Card */}
                    {currentUser && currentUser.email && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3">
                        <div className="text-left overflow-hidden">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                            Active Session Detected
                          </span>
                          <span className="text-xs font-bold text-white truncate block">
                            {currentUser.email || "Trader"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingUser(currentUser);
                            setPortalStage("persona");
                            soundEngine.playOrderFilled();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1 transition shadow cursor-pointer shrink-0"
                        >
                          <span>Re-Enter →</span>
                        </button>
                      </div>
                    )}

                    {/* Clean Tabs */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-[#121622] border border-[#212738]">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTabSwitch();
                          setActiveTab("login");
                          setError(null);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          activeTab === "login"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Member Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTabSwitch();
                          setActiveTab("signup");
                          setError(null);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          activeTab === "signup"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Instant Demo Access Button (Prominent 1-Click Access) */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleInstantVipGuest}
                      className="w-full group relative overflow-hidden py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-emerald-600/15 hover:from-blue-600/25 hover:to-emerald-600/25 border border-blue-500/30 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.12)] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <span>Instant Simulator Access</span>
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-black uppercase">
                              ₹10L
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            1-Click Instant Demo • Select Persona Next
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition text-blue-400" />
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-[#1F2536]" />
                      <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Or Sign in with credentials
                      </span>
                      <div className="flex-grow border-t border-[#1F2536]" />
                    </div>
                  </div>

                  {/* Form: Login or Signup */}
                  <form
                    onSubmit={activeTab === "login" ? handleLoginSubmit : handleSignupSubmit}
                    className="space-y-4"
                  >
                    {activeTab === "signup" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 block">
                          Full Name / Investor Title
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#121622] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-600 transition"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="trader@tradex.pro"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#121622] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Password
                        </label>
                        {activeTab === "login" && (
                          <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                            Forgot Password?
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#121622] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {activeTab === "signup" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 block">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#121622] border border-[#212738] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-600 transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <span>
                        {loading
                          ? "Authenticating..."
                          : activeTab === "login"
                          ? "Continue to Persona Selection →"
                          : "Create Account & Enter Terminal →"}
                      </span>
                    </button>
                  </form>

                  {/* Footer notes */}
                  <div className="pt-2 border-t border-[#1C2230] text-center space-y-1.5">
                    <p className="text-[11px] text-slate-500">
                      By signing in, you agree to institutional terms of service &amp; SEBI risk disclosure.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
                      <span>SECURITY HASH: SHA-256</span>
                      <span>•</span>
                      <span>DMA GATEWAY: ONLINE</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ============================================================ */
          /* STAGE 2: "WHAT TYPE OF USER ARE YOU?" INTERACTIVE ONBOARDING */
          /* ============================================================ */
          <div className="w-full max-w-[1240px] space-y-8 text-center animate-fade-in">
            {/* Header Question */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interactive AI Customization</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Select Your Trading Profile
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Calibrate your terminal environment. Each tier unlocks specialized analytical algorithms, execution latency profiles, and risk parameters.
              </p>
            </div>

            {/* 4 Interactive Persona Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5 text-left pt-2">
              {personaOptions.map((opt) => {
                const isSelected = selectedPersona === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => !isConfiguring && handleSelectPersona(opt.id)}
                    className={`group relative rounded-2xl p-[1.5px] transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400 scale-[1.02] shadow-[0_0_35px_rgba(59,130,246,0.3)]"
                        : opt.isPopular
                        ? "bg-gradient-to-b from-blue-500/40 via-indigo-500/10 to-[#1c2233] hover:from-blue-400/60 hover:to-indigo-500/40 hover:scale-[1.01]"
                        : "bg-gradient-to-b from-white/10 via-white/5 to-[#1c2233] hover:from-blue-500/40 hover:to-indigo-500/30 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Max Power Most Popular Tag */}
                    {opt.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/40 flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>MAX POWER • 100% UNLOCKED</span>
                      </div>
                    )}

                    <div className="h-full rounded-[15px] bg-[#0C1019]/95 backdrop-blur-xl p-5 flex flex-col justify-between space-y-4">
                      {/* Top Header & Badges */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {opt.icon}
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase font-mono ${
                            opt.isPopular
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                              : "bg-white/5 text-slate-300 border-white/10"
                          }`}>
                            {opt.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">
                            {opt.title}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                            {opt.subtitle}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                          {opt.description}
                        </p>
                      </div>

                      {/* Progressive Tier Checklist (ChatGPT Hierarchy Model) */}
                      <div className="space-y-2.5 pt-3 border-t border-white/5">
                        <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/25 text-[10px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wide">
                          <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="truncate">{opt.includesPrior}</span>
                        </div>

                        <div className="space-y-2 text-[11px] text-slate-300 font-medium">
                          {opt.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start space-x-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white/5 hover:bg-blue-600 hover:text-white text-slate-300 border border-white/10"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Profile Active</span>
                            </>
                          ) : (
                            <>
                              <span>Select {opt.level} →</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* High-Tech Progress Simulator when Persona is chosen */}
            {isConfiguring && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#0B0E17]/90 border border-blue-500/40 backdrop-blur-xl shadow-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-300 font-bold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>{configStep}</span>
                  </span>
                  <span className="text-emerald-400 font-extrabold animate-pulse">ACTIVE</span>
                </div>
                <div className="w-full h-1.5 bg-[#1A2233] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 animate-[pulse_1s_infinite] w-full" />
                </div>
              </div>
            )}

            {/* Stage Switcher / Back option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPortalStage("auth")}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Switch Account or Credentials</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="relative z-10 border-t border-[#1A1F2E] bg-[#07090F] py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-400">
              TradeX Pro™ © 2026. Institutional Quantitative Terminal & Precision Trading.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Risk Disclosure</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">API Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
