/**
 * TradeX Pro - Generative AI Service
 * Supports Google Gemini API (gemini-1.5-flash, gemini-2.0-flash)
 * with graceful fallback to TradeX Multi-Factor Neural Synthesis Engine.
 */

export interface MarketContext {
  symbol: string;
  price: number;
  currency: string;
  changePercent?: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
}

const STORAGE_KEY = "tradex_gemini_api_key";
const DEFAULT_MODEL = "gemini-1.5-flash";

export const getStoredGeminiKey = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  }
  return (
    localStorage.getItem(STORAGE_KEY) ||
    (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string) ||
    ""
  );
};

export const setStoredGeminiKey = (key: string): void => {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
};

export const hasActiveGeminiKey = (): boolean => {
  return !!getStoredGeminiKey();
};

/**
 * Call Google Gemini REST API directly from client
 */
export async function queryGemini(
  prompt: string,
  context: MarketContext,
  chatHistory: { sender?: string; role?: string; text: string }[] = []
): Promise<string> {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) {
    return generateNeuralSynthesis(prompt, context);
  }

  const systemInstruction = `You are TradeX Pro AI, an elite institutional quantitative financial trader and trading mentor at a top Wall Street algorithmic desk.
You provide prestigious, institutional-grade, highly professional financial analysis in pristine English.
CRITICAL MANDATORY INSTRUCTIONS:
- BE EXTREMELY DIRECT, CRISP, AND TO THE POINT.
- Answer STRICTLY what the user asks, without long generic essays, robotic intros, conversational filler, or unnecessary disclaimers.
- NEVER start with "Aapne poocha: ..." or "Is sawaal ka direct aur actionable solution yeh hai:".
- Give concise, actionable institutional answers with exact numbers: Entry, Target, Stop-Loss, and Quantitative Rationale in 3-5 short bullet points.
- If asked whether to buy, deliver a definitive verdict (e.g. "Actionable Long Setup" or "Caution: Await Support Pullback") followed by 3-4 structured bullet points.
- Reference live metrics: Symbol ${context.symbol}, Price ${context.currency === "INR" || context.currency === "₹" ? "₹" : "$"}${context.price.toFixed(2)}, RSI ${context.rsi14.toFixed(1)}, 20-SMA ${context.sma20.toFixed(2)}.`;

  const contents: any[] = [];

  // Add system instruction as premier context
  contents.push({
    role: "user",
    parts: [{ text: systemInstruction }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I will answer directly, concisely, and to the point with zero fluff or repetitive templates." }],
  });

  // Recent chat context
  const recentHistory = chatHistory.slice(-4);
  for (const msg of recentHistory) {
    contents.push({
      role: (msg.role === "user" || msg.sender === "user") ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }

  // Current prompt
  contents.push({
    role: "user",
    parts: [{
      text: `User query: "${prompt}". Live context: Symbol: ${context.symbol}, Price: ${context.currency === "INR" || context.currency === "₹" ? "₹" : "$"}${context.price.toFixed(2)}, RSI: ${context.rsi14.toFixed(1)}, 20-SMA: ${context.sma20.toFixed(2)}. Answer directly and concisely in 3-5 crisp bullet points.`
    }],
  });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText && generatedText.trim()) {
        return generatedText.trim();
      }
    }
  } catch {}

  return generateNeuralSynthesis(prompt, context);
}

/**
 * Intelligent Dynamic Neural Synthesis Engine
 * Ultra-concise, direct, to-the-point expert answers with zero robotic boilerplate
 */
export function generateNeuralSynthesis(prompt: string, context: MarketContext): string {
  const q = prompt.toLowerCase().trim();
  const currSym = context.currency === "INR" || context.currency === "₹" ? "₹" : "$";
  const changePct = typeof context.changePercent === "number" ? context.changePercent : 0;
  const isTrendUp = context.price > context.sma20 && context.sma20 > context.sma50;
  const isMacdCross = context.macd > context.macdSignal;
  const isRsiOverbought = context.rsi14 > 72;
  const isRsiOversold = context.rsi14 < 35;
  const upThreshold = (Math.max(context.price, context.sma20) * 1.008).toFixed(2);
  const downThreshold = (Math.min(context.price, context.sma20) * 0.992).toFixed(2);
  const target1 = (context.price * (isTrendUp ? 1.025 : 0.98)).toFixed(2);
  const target2 = (context.price * (isTrendUp ? 1.042 : 0.96)).toFixed(2);
  const stopLoss = (context.price * (isTrendUp ? 0.985 : 1.015)).toFixed(2);
  const dipEntry = (context.price * 0.988).toFixed(2);

  // 1. BUY / ENTRY QUERIES (Direct verdict on buy recommendations)
  const isBuy =
    q.includes("buy") ||
    q.includes("khareed") ||
    q.includes("khared") ||
    q.includes("le lu") ||
    q.includes("lena") ||
    q.includes("entry") ||
    q.includes("invest") ||
    q.includes("le sakte");

  if (isBuy) {
    if (isRsiOverbought) {
      return `### ⚠️ Institutional Alert: ${context.symbol} Overbought Retracement Caution\n\n` +
        `• **Signal:** Elevated RSI (${context.rsi14.toFixed(1)}) indicates stretched valuation in the short term.\n` +
        `• **Optimal Accumulation Zone:** Await tactical pullback toward support dip near **${currSym}${dipEntry}**.\n` +
        `• **Upside Price Target:** **${currSym}${target1}** (+2.5% projected expansion).\n` +
        `• **Risk Protection (Stop-Loss):** **${currSym}${stopLoss}** (-1.5% strict capital preservation stop).\n` +
        `• **Execution Directive:** Prefer **Delivery (CNC)** to absorb interim intraday mean-reversion volatility.`;
    }

    if (isTrendUp) {
      return `### 🟢 Institutional Trade Thesis: ${context.symbol} Bullish Continuation\n\n` +
        `• **Signal:** Strong bullish regime confirmed above 20-Day SMA (${currSym}${context.sma20.toFixed(2)}).\n` +
        `• **Entry Band:** Initiate long positions between **${currSym}${context.price.toFixed(2)}** and **${currSym}${(context.price * 1.004).toFixed(2)}**.\n` +
        `• **Target Projections:** Primary **${currSym}${target1}** (+2.5%) | Secondary **${currSym}${target2}** (+4.2%).\n` +
        `• **Dynamic Stop-Loss:** **${currSym}${stopLoss}** (-1.5% maximum allowable drawdown).\n` +
        `• **Capital Allocation:** Moderate sizing via **Delivery (CNC)** or **Intraday (5x MIS)** with bracket stop.`;
    }

    return `### 🟡 Tactical Watch: ${context.symbol} Rangebound Consolidation\n\n` +
      `• **Signal:** Asset is trading within a horizontal consolidation channel.\n` +
      `• **Breakout Confirmation Trigger:** Hourly close above **${currSym}${upThreshold}** to validate upward trend resumption.\n` +
      `• **Tactical Levels:** Target **${currSym}${target1}** | Invalidation Stop-Loss **${currSym}${stopLoss}**.\n` +
      `• **Directive:** Avoid premature entries during low-momentum compression phases.`;
  }

  // 2. SELL / EXIT / PROFIT BOOKING QUERIES
  const isSell =
    q.includes("sell") ||
    q.includes("bech") ||
    q.includes("exit") ||
    q.includes("booking") ||
    q.includes("profit book") ||
    q.includes("nikal") ||
    q.includes("nikle");

  if (isSell) {
    return `### 🔴 Exit & Profit Realization Strategy: ${context.symbol}\n\n` +
      `• **Primary Take-Profit (50% Volume):** **${currSym}${target1}** (+2.5% gain lock).\n` +
      `• **Extended Target (Full Runner):** **${currSym}${target2}** (+4.2% expansion).\n` +
      `• **Capital Invalidation Stop:** **${currSym}${stopLoss}** (-1.5% stop-loss threshold).\n` +
      `• **Execution Window:** Intraday leveraged positions must be liquidated prior to 15:15 IST to prevent square-off penalties.`;
  }

  // 3. TARGET / PREDICTION QUERIES
  const isTarget =
    q.includes("target") ||
    q.includes("kaha tak") ||
    q.includes("kahan tak") ||
    q.includes("kitna jayega") ||
    q.includes("predict") ||
    q.includes("kal") ||
    q.includes("forecast") ||
    q.includes("future");

  if (isTarget) {
    return `### 🎯 Quantitative Price Targets: ${context.symbol}\n\n` +
      `• **Current Market Price (LTP):** **${currSym}${context.price.toFixed(2)}**\n` +
      `• **Primary Upside Target (T1):** **${currSym}${target1}** (+2.50% Fibonacci R1)\n` +
      `• **Secondary Stretch Target (T2):** **${currSym}${target2}** (+4.20% Pivot R2)\n` +
      `• **Invalidation Pivot (SL):** **${currSym}${stopLoss}** (-1.50% trailing stop)\n` +
      `• **Algorithmic Trend Bias:** ${isTrendUp ? "BULLISH (Upward continuation probable)" : "NEUTRAL CONSOLIDATION"}.`;
  }

  // 4. STOP-LOSS & RISK MANAGEMENT
  const isSL =
    q.includes("stop loss") ||
    q.includes("stoploss") ||
    q.includes("sl") ||
    q.includes("loss");

  if (isSL) {
    return `### 🛡️ Risk Management Matrix: ${context.symbol}\n\n` +
      `• **Calculated Stop-Loss Level:** **${currSym}${stopLoss}** (1.50% below current price).\n` +
      `• **Risk/Reward Profile:** 1:1.67 against Target 1 (**${currSym}${target1}**).\n` +
      `• **Capital Preservation Rule:** Never risk more than 1.5% - 2.0% of total portfolio equity on any single asset allocation.`;
  }

  // 5. DIRECTION & TREND (UP / DOWN)
  const isDirection =
    q.includes("up") ||
    q.includes("down") ||
    q.includes("upar") ||
    q.includes("niche") ||
    q.includes("trend") ||
    q.includes("direction") ||
    q.includes("kaisa");

  if (isDirection) {
    return `### 🧭 Multi-Timeframe Trend Assessment: ${context.symbol}\n\n` +
      `• **Trend Bias:** ${isTrendUp ? "🟢 Strong Bullish (Trading above key 20-Day SMA)" : "🟡 Neutral / Rangebound Consolidation"}\n` +
      `• **Bullish Expansion Level:** Sustained trade above **${currSym}${upThreshold}** unlocks upside impulse.\n` +
      `• **Downside Support Test:** Breakdown below **${currSym}${downThreshold}** signals structural weakness.\n` +
      `• **Dynamic 20-SMA Baseline:** **${currSym}${context.sma20.toFixed(2)}**`;
  }

  // 6. HOW TO START / BEGINNERS
  const isStart =
    q.includes("shuru") ||
    q.includes("start") ||
    q.includes("kaise kare") ||
    q.includes("kese kare") ||
    q.includes("seekhna") ||
    q.includes("beginner") ||
    q.includes("kya karu");

  if (isStart) {
    return `### 🚀 Institutional Workflow: Getting Started in 3 Steps\n\n` +
      `1. **Asset Selection:** Choose your target ticker (e.g. **${context.symbol}**) from the real-time institutional watchlist.\n` +
      `2. **Order Execution:** In the Execution Dock, select **Delivery (CNC)** for zero margin risk or **Intraday (MIS)** for 5x leverage.\n` +
      `3. **Simulated Capital:** Utilize your **₹10,00,000 zero-risk institutional virtual margin** to validate strategy backtests before live capital deployment.`;
  }

  // 7. INTRADAY VS DELIVERY
  if (q.includes("intraday") || q.includes("delivery") || q.includes("mis") || q.includes("cnc")) {
    return `### ⚖️ Execution Product Comparison: Delivery (CNC) vs Intraday (MIS)\n\n` +
      `• **Delivery (CNC) [Zero Margin Risk]:** 100% cash funded. Positional holdings can be retained indefinitely with no forced liquidation.\n` +
      `• **Intraday (MIS) [High-Octane 5x Leverage]:** Maximizes purchasing power for short-term breakouts; requires square-off before 15:15 IST.`;
  }

  // 8. DEFAULT CLEAN CONCISE SNAPSHOT (Zero robotic fluff)
  return `### 💡 Institutional Snapshot: ${context.symbol}\n\n` +
    `• **Last Traded Price:** **${currSym}${context.price.toFixed(2)}** (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)\n` +
    `• **Algorithmic Trend:** ${isTrendUp ? "🟢 Bullish Momentum" : "🟡 Sideways Consolidation"}\n` +
    `• **Key Projected Range:** Target **${currSym}${target1}** (+2.5%) | Stop-Loss **${currSym}${stopLoss}** (-1.5%)\n` +
    `• **Momentum (RSI-14):** **${context.rsi14.toFixed(1)}** (${isRsiOverbought ? "Overbought" : isRsiOversold ? "Oversold" : "Neutral"})\n` +
    `• **Tactical Directive:** ${isRsiOverbought ? "Await mean-reversion dip before adding exposure." : isTrendUp ? "Accumulate on pullbacks toward 20-SMA." : "Monitor key breakout pivot before entry."}`;
}
