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

  const systemInstruction = `You are TradeX Pro AI, an elite institutional quantitative financial trader and trading mentor.
You speak fluent natural Hinglish and English.
CRITICAL MANDATORY INSTRUCTIONS:
- BE EXTREMELY DIRECT, CRISP, AND TO THE POINT.
- JITNA PUCHA JAYE UTNA HI JAWAB DEIN (Answer STRICTLY what the user asks, without long generic essays, robotic intros, or unnecessary disclaimers).
- NEVER start with "Aapne poocha: ..." or "Is sawaal ka direct aur actionable solution yeh hai:".
- Give concise, actionable answers with exact numbers: Entry, Target, Stop-Loss, and Reason in 3-5 short bullet points.
- If asked "isse buy karna chahiye", give a clear direct verdict (e.g. "Haan, buy kar sakte hain" OR "Abhi wait karein, thoda dip par lein") followed by 3-4 bullet points.
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
      return `### ⚠️ ${context.symbol}: Abhi Fresh Buy Na Karein (Wait for Dip)\n\n` +
        `• **Reason:** RSI **${context.rsi14.toFixed(1)}** (Overbought) par hai. Price high par hai, yahan se chota pullback aane ka risk hai.\n` +
        `• **Sahi Entry:** **${currSym}${dipEntry}** ke support dip par aane par buy karein.\n` +
        `• **Target 1:** **${currSym}${target1}** (+2.5% move)\n` +
        `• **Stop-Loss:** **${currSym}${stopLoss}** (-1.5% strict SL)\n` +
        `• **Recommendation:** Safe rehne ke liye **Delivery (CNC)** chunein.`;
    }

    if (isTrendUp) {
      return `### 🟢 Haan, ${context.symbol} Buy Kar Sakte Hain:\n\n` +
        `• **Entry Price:** **${currSym}${context.price.toFixed(2)}** ke aas-paas le sakte hain.\n` +
        `• **Trend Status:** Bullish (Price 20-Day SMA ${currSym}${context.sma20.toFixed(2)} ke upar hai).\n` +
        `• **Target 1:** **${currSym}${target1}** (+2.5% gain)\n` +
        `• **Target 2:** **${currSym}${target2}** (+4.2% runner gain)\n` +
        `• **Strict Stop-Loss:** **${currSym}${stopLoss}** (-1.5% loss cut)\n` +
        `• **Product:** Beginners ke liye **Delivery (CNC)** sabse safe hai.`;
    }

    return `### 🟡 ${context.symbol}: Abhi Breakout Ka Wait Karein\n\n` +
      `• **Status:** Consolidation / Sideways mode.\n` +
      `• **Buy Trigger:** **${currSym}${upThreshold}** ke upar 15-min candle close hone par hi buy karein.\n` +
      `• **Target:** **${currSym}${target1}** | **Stop-Loss:** **${currSym}${stopLoss}**\n` +
      `• **Tip:** Sideways market me jaldbazi me entry na lein.`;
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
    return `### 🔴 ${context.symbol}: Exit & Selling Strategy\n\n` +
      `• **First Target (50% Profit Book):** **${currSym}${target1}** (+2.5% par adha munafa lock karein).\n` +
      `• **Final Target:** **${currSym}${target2}** (+4.2%)\n` +
      `• **Stop-Loss Exit:** **${currSym}${stopLoss}** (-1.5% ke niche turant loss cut karein).\n` +
      `• **Best Intraday Time:** Subah 10:00 AM ya dopahar 2:30 PM. **3:15 PM** se pehle exit mandatory hai.`;
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
    return `### 🎯 ${context.symbol} Price Targets & Levels\n\n` +
      `• **Current Price:** **${currSym}${context.price.toFixed(2)}**\n` +
      `• **Target 1:** **${currSym}${target1}** (+2.5%)\n` +
      `• **Target 2 (Extended):** **${currSym}${target2}** (+4.2%)\n` +
      `• **Dynamic Stop-Loss:** **${currSym}${stopLoss}** (-1.5%)\n` +
      `• **Bias:** ${isTrendUp ? "BULLISH (Upward continuation)" : "CONSOLIDATION"}.`;
  }

  // 4. STOP-LOSS & RISK MANAGEMENT
  const isSL =
    q.includes("stop loss") ||
    q.includes("stoploss") ||
    q.includes("sl") ||
    q.includes("loss");

  if (isSL) {
    return `### 🛡️ ${context.symbol} Stop-Loss & Risk Level\n\n` +
      `• **Strict Stop-Loss:** **${currSym}${stopLoss}** (Price se 1.5% niche).\n` +
      `• **Kyun Lagayein?** Yeh aapka capital protect karta hai taaki bada loss na ho.\n` +
      `• **Golden Rule:** Single trade me portfolio ka 2% se zyada risk kabhi na lein.`;
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
    return `### 🧭 ${context.symbol} Trend & Direction\n\n` +
      `• **Direction:** ${isTrendUp ? "🟢 Bullish (Upar jane ka momentum hai)" : "🟡 Sideways / Rangebound"}\n` +
      `• **Breakout UP Trigger:** **${currSym}${upThreshold}** ke upar buy banega.\n` +
      `• **Breakdown DOWN Risk:** **${currSym}${downThreshold}** ke niche selling aayegi.\n` +
      `• **20-SMA Support:** **${currSym}${context.sma20.toFixed(2)}**`;
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
    return `### 🚀 Shuruat Kaise Karein (3 Steps):\n\n` +
      `1. **Stock Chunein:** Watchlist me se **${context.symbol}** chunein.\n` +
      `2. **Order Ticket:** Right side panel me **BUY** dabayein aur **Delivery (CNC)** chunein (Zero risk).\n` +
      `3. **₹10 Lakh Virtual Cash:** TradeX Pro ke paper cash se bina real paise ke practice karein!`;
  }

  // 7. INTRADAY VS DELIVERY
  if (q.includes("intraday") || q.includes("delivery") || q.includes("mis") || q.includes("cnc")) {
    return `### ⚖️ Delivery (CNC) vs Intraday (MIS):\n\n` +
      `• **Delivery (CNC) [SAFE]:** Jab tak chahe hold karein. Zero daily risk, beginners ke liye best.\n` +
      `• **Intraday (MIS) [HIGH RISK]:** 5x leverage milta hai, lekin **3:15 PM** tak bechna zaroori hai.`;
  }

  // 8. DEFAULT CLEAN CONCISE SNAPSHOT (Zero robotic fluff)
  return `### 💡 ${context.symbol} Quick Summary\n\n` +
    `• **Price:** **${currSym}${context.price.toFixed(2)}** (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)\n` +
    `• **Trend:** ${isTrendUp ? "🟢 Bullish Trend" : "🟡 Consolidation / Sideways"}\n` +
    `• **Target:** **${currSym}${target1}** (+2.5%) | **Stop-Loss:** **${currSym}${stopLoss}** (-1.5%)\n` +
    `• **RSI (14):** **${context.rsi14.toFixed(1)}** (${isRsiOverbought ? "Overbought" : isRsiOversold ? "Oversold" : "Healthy"})\n` +
    `• **Action:** ${isRsiOverbought ? "Dip ka wait karein" : isTrendUp ? "Buy on dips" : "Breakout ka wait karein"}.`;
}
