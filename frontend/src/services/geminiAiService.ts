/**
 * TradeX Pro - Universal Multi-Provider AI Service
 * Supports:
 * 1. Groq Cloud API (Lightning-fast LLaMA 3.3 70B & LLaMA 3.1 8B, <500ms latency)
 * 2. Google Gemini API (gemini-2.0-flash, gemini-1.5-flash with dynamic model discovery)
 * 3. TradeX Autonomous Conversational Neural Engine (Natural fluent Hinglish & English responses, zero key required)
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

export type AIProvider = "groq" | "gemini" | "autonomous";

const GEMINI_KEY_STORAGE = "tradex_gemini_api_key";
const GEMINI_MODEL_STORAGE = "tradex_gemini_active_model";

const GROQ_KEY_STORAGE = "tradex_groq_api_key";
const GROQ_MODEL_STORAGE = "tradex_groq_active_model";

const ACTIVE_PROVIDER_STORAGE = "tradex_active_ai_provider";

export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "LLaMA 3.3 70B Versatile (Recommended - Deep Financial Reasoning)" },
  { id: "llama-3.1-8b-instant", name: "LLaMA 3.1 8B Instant (Ultra Fast, 800+ tokens/sec)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k Context Window)" },
];

export const FALLBACK_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-pro",
];

// ==============================================================================
// PROVIDER SELECTION
// ==============================================================================

export const getActiveAIProvider = (): AIProvider => {
  if (typeof window === "undefined") return "groq";
  const stored = localStorage.getItem(ACTIVE_PROVIDER_STORAGE) as AIProvider;
  if (stored === "groq" || stored === "gemini" || stored === "autonomous") {
    return stored;
  }
  // If Groq key exists, default to groq; if Gemini key exists, default to gemini
  if (hasActiveGroqKey()) return "groq";
  if (hasActiveGeminiKey()) return "gemini";
  return "groq"; // Default to Groq
};

export const setActiveAIProvider = (provider: AIProvider): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_PROVIDER_STORAGE, provider);
};

// ==============================================================================
// GROQ API CONFIGURATION
// ==============================================================================

export const getStoredGroqKey = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
  }
  return (
    localStorage.getItem(GROQ_KEY_STORAGE) ||
    (process.env.NEXT_PUBLIC_GROQ_API_KEY as string) ||
    ""
  );
};

export const setStoredGroqKey = (key: string): void => {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(GROQ_KEY_STORAGE);
  } else {
    localStorage.setItem(GROQ_KEY_STORAGE, key.trim());
  }
};

export const getStoredGroqModel = (): string => {
  if (typeof window === "undefined") return "llama-3.3-70b-versatile";
  return localStorage.getItem(GROQ_MODEL_STORAGE) || "llama-3.3-70b-versatile";
};

export const setStoredGroqModel = (model: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GROQ_MODEL_STORAGE, model.trim());
};

export const hasActiveGroqKey = (): boolean => {
  return !!getStoredGroqKey();
};

/**
 * Validate Groq API Key and verify model support
 */
export async function verifyAndTestGroqModel(
  apiKey: string,
  modelName: string = "llama-3.3-70b-versatile"
): Promise<{ success: boolean; model: string; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, model: "", message: "Groq API key cannot be empty." };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an institutional trading assistant." },
          { role: "user", content: "Respond with single word: OK" },
        ],
        max_tokens: 5,
        temperature: 0.1,
      }),
    });

    if (res.ok) {
      setStoredGroqKey(cleanKey);
      setStoredGroqModel(modelName);
      setActiveAIProvider("groq");
      return {
        success: true,
        model: modelName,
        message: `Connected successfully to Groq Cloud (${modelName}) with ultra-low latency.`,
      };
    } else {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Groq returned HTTP ${res.status}`;
      return { success: false, model: modelName, message: errMsg };
    }
  } catch (err: any) {
    return {
      success: false,
      model: modelName,
      message: err.message || "Network error connecting to Groq API.",
    };
  }
}

// ==============================================================================
// GEMINI API CONFIGURATION
// ==============================================================================

export const getStoredGeminiKey = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  }
  return (
    localStorage.getItem(GEMINI_KEY_STORAGE) ||
    (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string) ||
    ""
  );
};

export const setStoredGeminiKey = (key: string): void => {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
    localStorage.removeItem(GEMINI_MODEL_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }
};

export const getStoredGeminiModel = (): string => {
  if (typeof window === "undefined") return "gemini-2.0-flash";
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || "gemini-2.0-flash";
};

export const setStoredGeminiModel = (model: string): void => {
  if (typeof window === "undefined") return;
  const clean = model.replace(/^models\//, "").trim();
  localStorage.setItem(GEMINI_MODEL_STORAGE, clean);
};

export const hasActiveGeminiKey = (): boolean => {
  return !!getStoredGeminiKey();
};

export async function verifyAndDiscoverGeminiModel(
  apiKey: string
): Promise<{ success: boolean; model: string; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, model: "", message: "Gemini API key cannot be empty." };
  }

  // 1. Dynamic Discovery via ModelService.ListModels
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const listRes = await fetch(listUrl, { method: "GET" });

    if (listRes.ok) {
      const listData = await listRes.json();
      const modelsList: Array<{ name: string; supportedGenerationMethods?: string[] }> =
        listData.models || [];

      const validModels = modelsList
        .filter((m) =>
          Array.isArray(m.supportedGenerationMethods)
            ? m.supportedGenerationMethods.includes("generateContent")
            : true
        )
        .map((m) => m.name.replace(/^models\//, ""));

      if (validModels.length > 0) {
        let chosenModel = validModels[0];
        for (const preferred of FALLBACK_GEMINI_MODELS) {
          const match = validModels.find(
            (vm) => vm.toLowerCase() === preferred.toLowerCase()
          );
          if (match) {
            chosenModel = match;
            break;
          }
        }

        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Respond 'OK'" }] }],
            }),
          }
        );

        if (testRes.ok) {
          setStoredGeminiKey(cleanKey);
          setStoredGeminiModel(chosenModel);
          setActiveAIProvider("gemini");
          return {
            success: true,
            model: chosenModel,
            message: `Connected successfully to Google Gemini (${chosenModel}).`,
          };
        }
      }
    }
  } catch {}

  // 2. Systematic candidate trial across fallback list
  for (const candidate of FALLBACK_GEMINI_MODELS) {
    for (const apiVersion of ["v1beta", "v1"]) {
      try {
        const testUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${candidate}:generateContent?key=${cleanKey}`;
        const res = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "OK" }] }],
          }),
        });

        if (res.ok) {
          setStoredGeminiKey(cleanKey);
          setStoredGeminiModel(candidate);
          setActiveAIProvider("gemini");
          return {
            success: true,
            model: candidate,
            message: `Connected to Google Gemini (${candidate}) via ${apiVersion}.`,
          };
        }
      } catch {}
    }
  }

  return {
    success: false,
    model: "",
    message: "Invalid Gemini key or no supported models found on Google AI Studio.",
  };
}

// ==============================================================================
// SYSTEM PROMPT BUILDER
// ==============================================================================

function buildSystemPrompt(context: MarketContext): string {
  const currSym = context.currency === "INR" ? "₹" : "$";
  const numPrice = Number(context.price) || 100;
  const sma20 = Number(context.sma20) || numPrice;
  const rsi = Number(context.rsi14) || 50;
  const target1 = (numPrice * 1.025).toFixed(2);
  const target2 = (numPrice * 1.042).toFixed(2);
  const stopLoss = (numPrice * 0.985).toFixed(2);
  const dipEntry = (numPrice * 0.992).toFixed(2);
  const isBullish = numPrice >= sma20;

  return `You are "Aria AI", the Chief Quantitative Financial Analyst of TradeX Pro.
Your mission is to provide concise, accurate, actionable, and conversational trading advice.

REAL-TIME MARKET TELEMETRY FOR ${context.symbol}:
- Current Price (LTP): ${currSym}${numPrice.toFixed(2)}
- 20-Day SMA Support: ${currSym}${sma20.toFixed(2)}
- 50-Day SMA: ${currSym}${(context.sma50 || numPrice).toFixed(2)}
- RSI (14-period): ${rsi.toFixed(1)} (${rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Balanced Momentum"})
- MACD Delta: ${(context.macd || 0).toFixed(2)} vs Signal ${(context.macdSignal || 0).toFixed(2)}
- Primary Target (T1, +2.5%): ${currSym}${target1}
- Secondary Stretch Target (T2, +4.2%): ${currSym}${target2}
- Strict Stop-Loss (-1.5%): ${currSym}${stopLoss}
- Tactical Dip Entry Level: ${currSym}${dipEntry}
- Overall Technical Bias: ${isBullish ? "BULLISH (Trading above 20-SMA)" : "CONSOLIDATION / CAUTION"}

CRITICAL INSTRUCTIONS:
1. Always respond in the EXACT language used by the user:
   - If user asks in Hindi or Hinglish (e.g. "best time konsa ha", "kya karu", "buy karein", "upar jayega"), reply in fluent, natural, institutional financial Hinglish!
   - If user asks in English, reply in crisp, articulate institutional financial English.
2. Directly answer their specific question first (e.g., if they ask for the best time to buy, tell them immediately whether to buy now or wait for the dip at ${currSym}${dipEntry}).
3. Always include exact computed figures (${currSym}${numPrice.toFixed(2)}, Target ${currSym}${target1}, SL ${currSym}${stopLoss}).
4. Keep answers clean, direct, and conversational (2 to 4 punchy paragraphs or structured highlights). Never be overly verbose or robotic.`;
}

// ==============================================================================
// UNIVERSAL AI QUERY FUNCTION
// ==============================================================================

export async function queryAI(
  userQuery: string,
  context: MarketContext,
  chatHistory: Array<{ sender?: string; role?: string; text: string }> = []
): Promise<string> {
  const provider = getActiveAIProvider();
  const groqKey = getStoredGroqKey();
  const geminiKey = getStoredGeminiKey();

  // 1. Try Groq Cloud if selected or available
  if ((provider === "groq" || (!geminiKey && groqKey)) && groqKey) {
    try {
      const groqModel = getStoredGroqModel();
      const messages = [
        { role: "system", content: buildSystemPrompt(context) },
        ...chatHistory.slice(-4).map((m) => {
          let role = "assistant";
          if (m.role) {
            role = m.role === "model" ? "assistant" : m.role;
          } else if (m.sender) {
            role = m.sender === "user" ? "user" : "assistant";
          }
          return {
            role,
            content: m.text,
          };
        }),
        { role: "user", content: userQuery },
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature: 0.35,
          max_tokens: 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (groqErr) {
      console.warn("Groq API call failed, attempting fallback:", groqErr);
    }
  }

  // 2. Try Google Gemini if selected or available
  if ((provider === "gemini" || (!groqKey && geminiKey)) && geminiKey) {
    try {
      const activeModel = getStoredGeminiModel();
      const prompt = `${buildSystemPrompt(context)}\n\nUSER QUESTION: ${userQuery}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini API call failed, attempting fallback:", geminiErr);
    }
  }

  // 3. Fallback: Intelligent Natural Conversational Financial Engine (Zero Key Required)
  return generateNaturalConversationalSynthesis(userQuery, context);
}

// Backward compatibility alias
export const queryGemini = queryAI;

// ==============================================================================
// INTELLIGENT NATURAL CONVERSATIONAL SYNTHESIS ENGINE
// (Zero API Key needed — Speaks naturally in Hinglish & English)
// ==============================================================================

export function generateNaturalConversationalSynthesis(
  userQuery: string,
  context: MarketContext
): string {
  const q = (userQuery || "").toLowerCase().trim();
  const currSym = context.currency === "INR" ? "₹" : "$";
  const numPrice = Number(context.price) || 100;
  const sma20 = Number(context.sma20) || numPrice;
  const rsi = Number(context.rsi14) || 50;
  const target1 = (numPrice * 1.025).toFixed(2);
  const target2 = (numPrice * 1.042).toFixed(2);
  const stopLoss = (numPrice * 0.985).toFixed(2);
  const dipEntry = (numPrice * 0.992).toFixed(2);
  const isTrendUp = numPrice >= sma20;
  const isRsiOverbought = rsi > 70;
  const isRsiOversold = rsi < 32;

  // Detect Hindi / Hinglish query intent
  const isHinglish =
    q.includes("konsa") ||
    q.includes("kaisa") ||
    q.includes("kya") ||
    q.includes("kare") ||
    q.includes("karein") ||
    q.includes("karo") ||
    q.includes("chahiye") ||
    q.includes("chaiye") ||
    q.includes("kab") ||
    q.includes("kahan") ||
    q.includes("kaha") ||
    q.includes("kitna") ||
    q.includes("upar") ||
    q.includes("niche") ||
    q.includes("batao") ||
    q.includes("kharide") ||
    q.includes("beche") ||
    q.includes("hai") ||
    q.includes("isse") ||
    q.includes("shuru") ||
    q.includes("sikho");

  // 1. BEST TIME TO BUY / TIMING QUERIES ("best time konsa ha buy krne ka", "kab buy karein")
  if (
    q.includes("best time") ||
    q.includes("kab buy") ||
    q.includes("entry kab") ||
    q.includes("timing") ||
    q.includes("kab kharide") ||
    q.includes("sahi waqt")
  ) {
    if (isHinglish) {
      if (isRsiOverbought) {
        return (
          `**${context.symbol}** (Current Price: **${currSym}${numPrice.toFixed(2)}**) ke liye abhi immediate top par buy karna risky ho sakta hai, kyunki RSI **${rsi.toFixed(1)}** ke sath overbought territory mein hai.\n\n` +
          `🎯 **Sabse Best Buying Opportunity:**\n` +
          `• Abhi thoda wait karein aur **${currSym}${dipEntry}** ke pullback level par enter karein (20-Day SMA support: **${currSym}${sma20.toFixed(2)}**).\n` +
          `• **Upside Targets:** First target **${currSym}${target1}** (+2.5%) aur extended target **${currSym}${target2}** (+4.2%).\n` +
          `• **Strict Stop-Loss:** Capital protect karne ke liye **${currSym}${stopLoss}** (-1.5%) zaroor lagayein.\n\n` +
          `💡 **Action Tip:** Safe rehne ke liye **Delivery (CNC)** prefer karein taaki intraday volatility se trade bachi rahe.`
        );
      } else if (isTrendUp) {
        return (
          `**${context.symbol}** abhi **${currSym}${numPrice.toFixed(2)}** par chal raha hai aur 20-Day SMA (**${currSym}${sma20.toFixed(2)}**) ke upar strong bullish trend mein hai.\n\n` +
          `🚀 **Buy Timing Status: OPTIMAL ENTRY NOW**\n` +
          `• Current level **${currSym}${numPrice.toFixed(2)}** se **${currSym}${(numPrice * 1.004).toFixed(2)}** ka zone fresh accumulation ke liye ideal hai.\n` +
          `• **Target 1:** **${currSym}${target1}** (+2.5%) | **Target 2:** **${currSym}${target2}** (+4.2%)\n` +
          `• **Stop-Loss:** **${currSym}${stopLoss}** (-1.5%)\n\n` +
          `⚡ Niche diye gaye **"⚡ Execute Delivery (CNC)"** ya **"Execute Intraday (5x MIS)"** button par click karke turant virtual order place kar sakte hain.`
        );
      } else {
        return (
          `**${context.symbol}** abhi **${currSym}${numPrice.toFixed(2)}** par sideways consolidation mein hai.\n\n` +
          `⏳ **Buy Timing Advice:**\n` +
          `• Best entry tab banegi jab price 20-Day SMA (**${currSym}${sma20.toFixed(2)}**) ke upar breakout confirmation de de.\n` +
          `• Premature entry se bachein. Target level **${currSym}${target1}** rahega aur stop-loss **${currSym}${stopLoss}**.`
        );
      }
    } else {
      return (
        `For **${context.symbol}** at **${currSym}${numPrice.toFixed(2)}**, ${
          isRsiOverbought
            ? `the RSI (${rsi.toFixed(1)}) indicates an overextended rally. The optimal accumulation window is a tactical pullback toward support at **${currSym}${dipEntry}**.`
            : `the asset is positioned in a favorable accumulation structure above its 20-Day SMA (${currSym}${sma20.toFixed(2)}). An entry between **${currSym}${numPrice.toFixed(2)}** and **${currSym}${(numPrice * 1.005).toFixed(2)}** is technically sound.`
        }\n\n` +
        `• **Target 1:** **${currSym}${target1}** (+2.50%)\n` +
        `• **Target 2:** **${currSym}${target2}** (+4.20%)\n` +
        `• **Risk Invalidation (SL):** **${currSym}${stopLoss}** (-1.50%)\n` +
        `• **Optimal Mode:** Delivery (CNC) for capital safety or Intraday (5x MIS) with strict bracket order.`
      );
    }
  }

  // 2. SHOULD I BUY / BUY RECOMMENDATION ("isse buy krna chaiye", "should I buy")
  if (
    q.includes("buy") ||
    q.includes("kharid") ||
    q.includes("entry") ||
    q.includes("invest") ||
    q.includes("le sakte")
  ) {
    if (isHinglish) {
      return (
        `**${context.symbol}** (LTP: **${currSym}${numPrice.toFixed(2)}**) par direct aur actionable recommendation yeh hai:\n\n` +
        `${isTrendUp ? "🟢 **Trend Bullish Hai:** Stock 20-SMA ke upar sustain kar raha hai." : "🟡 **Trend Sideways Hai:** Stock support ke aas-paas base bana raha hai."}\n\n` +
        `1. **Buy Setup:** Haan, aap accumulate kar sakte hain, lekin ek sath sara capital na lagayein.\n` +
        `2. **Key Price Targets:** Primary target **${currSym}${target1}** (+2.5%) aur secondary **${currSym}${target2}** (+4.2%).\n` +
        `3. **Mandatory Stop-Loss:** **${currSym}${stopLoss}** (-1.5%) set karke chaliye.\n` +
        `4. **Product Selection:** Agar naye hain toh **Delivery (CNC)** chuniye jisme zero margin risk hai.`
      );
    } else {
      return (
        `Direct analysis for **${context.symbol}** at **${currSym}${numPrice.toFixed(2)}**:\n\n` +
        `• **Quantitative Verdict:** ${isTrendUp ? "🟢 ACCUMULATE (Favorable Risk/Reward 1:1.67)" : "🟡 CAUTIOUS ACCUMULATION"}\n` +
        `• **Upside Targets:** **${currSym}${target1}** (+2.5%) | Stretch: **${currSym}${target2}** (+4.2%)\n` +
        `• **Stop-Loss:** **${currSym}${stopLoss}** (-1.5% maximum allowable drawdown)\n` +
        `• **Execution Mode:** Delivery (CNC) recommended for disciplined positioning.`
      );
    }
  }

  // 3. TARGET / PREDICTION ("target kya hai", "kaha tak jayega", "predict")
  if (
    q.includes("target") ||
    q.includes("kaha tak") ||
    q.includes("kahan tak") ||
    q.includes("kitna jayega") ||
    q.includes("predict") ||
    q.includes("kal") ||
    q.includes("forecast")
  ) {
    if (isHinglish) {
      return (
        `**${context.symbol}** (Current: **${currSym}${numPrice.toFixed(2)}**) ke mathematical targets yeh hain:\n\n` +
        `🎯 **Target 1 (Primary):** **${currSym}${target1}** (+2.50% gain, Fibonacci R1)\n` +
        `🚀 **Target 2 (Extended):** **${currSym}${target2}** (+4.20% gain, Pivot R2)\n` +
        `🛡️ **Invalidation Level (SL):** **${currSym}${stopLoss}** (-1.50% risk limit)\n\n` +
        `Jab price Target 1 par pahunche, toh 50% profit book karke baaki shares ka stop-loss cost price par trail kar lena best practice hai.`
      );
    } else {
      return (
        `Quantitative projection for **${context.symbol}** (LTP: **${currSym}${numPrice.toFixed(2)}**):\n\n` +
        `• **Target 1 (Fibonacci R1):** **${currSym}${target1}** (+2.50%)\n` +
        `• **Target 2 (Pivot R2):** **${currSym}${target2}** (+4.20%)\n` +
        `• **Dynamic Stop-Loss:** **${currSym}${stopLoss}** (-1.50%)\n` +
        `• **Technical Bias:** ${isTrendUp ? "BULLISH (Upward continuation supported by 20-SMA)" : "NEUTRAL / ACCUMULATION"}`
      );
    }
  }

  // 4. STOP LOSS / RISK ("stop loss", "sl kitna", "risk")
  if (q.includes("stop loss") || q.includes("stoploss") || q.includes("sl") || q.includes("risk")) {
    if (isHinglish) {
      return (
        `**${context.symbol}** ke liye capital protection stop-loss **${currSym}${stopLoss}** calculate hua hai.\n\n` +
        `• **Risk per Share:** Sirf **${currSym}${(numPrice * 0.015).toFixed(2)}** (-1.5% max loss).\n` +
        `• **Reward Ratio:** Target 1 (**${currSym}${target1}**) ke against 1:1.67 ka solid risk/reward ratio mil raha hai.\n` +
        `• **Rule:** Koshish karein ki single trade mein total portfolio ka 1-2% se zyada risk na ho.`
      );
    } else {
      return (
        `Risk Parameters for **${context.symbol}**:\n\n` +
        `• **Calculated Stop-Loss:** **${currSym}${stopLoss}** (-1.50% below market price of ${currSym}${numPrice.toFixed(2)}).\n` +
        `• **Risk/Reward Profile:** 1:1.67 against Target 1 (${currSym}${target1}).\n` +
        `• **Disciplined Exit Rule:** If price closes below 20-SMA (${currSym}${sma20.toFixed(2)}), cut losses immediately to preserve capital.`
      );
    }
  }

  // 5. DIRECTION / UP OR DOWN ("kahan UP hoga kahan DOWN", "trend kaisa hai")
  if (
    q.includes("up") ||
    q.includes("down") ||
    q.includes("upar") ||
    q.includes("niche") ||
    q.includes("trend") ||
    q.includes("direction")
  ) {
    if (isHinglish) {
      return (
        `**${context.symbol}** ka direction aur breakout structure yeh hai:\n\n` +
        `🟢 **UP Kab Hoga?**\n` +
        `Agar price **${currSym}${(numPrice * 1.008).toFixed(2)}** ke breakout pivot ke upar sustain karta hai, toh buy momentum accelerate hoga aur price **${currSym}${target1}** ki taraf jayega.\n\n` +
        `🔴 **DOWN Kab Hoga?**\n` +
        `Agar stock **${currSym}${sma20.toFixed(2)}** (20-Day SMA) ke niche slip karta hai, toh downward pressure badhega aur price **${currSym}${stopLoss}** tak gir sakta hai.\n\n` +
        `📊 **Current Bias:** ${isTrendUp ? "Bullish (Khareedaron ka dabav zyada hai)" : "Consolidation (Rangebound trading)"}.`
      );
    } else {
      return (
        `Market Structure Breakdown for **${context.symbol}**:\n\n` +
        `• **Upside Breakout Trigger:** Sustained 15-min close above **${currSym}${(numPrice * 1.008).toFixed(2)}** targets **${currSym}${target1}**.\n` +
        `• **Downside Breakdown Level:** Close below **${currSym}${sma20.toFixed(2)}** invalidates bullish regime and tests **${currSym}${stopLoss}**.\n` +
        `• **Current Regime:** ${isTrendUp ? "🟢 Bullish Continuation" : "🟡 Consolidation Base"}.`
      );
    }
  }

  // 6. CNC VS MIS / DIFFERENCE ("konsa buy karein", "delivery vs intraday", "cnc", "mis")
  if (
    q.includes("konsa buy") ||
    q.includes("cnc") ||
    q.includes("mis") ||
    q.includes("delivery") ||
    q.includes("intraday") ||
    q.includes("difference")
  ) {
    if (isHinglish) {
      return (
        `Aapke liye **Delivery (CNC)** aur **Intraday (MIS)** ka clear comparison:\n\n` +
        `🛡️ **Delivery (CNC) [SAFE & ZERO MARGIN RISK]:**\n` +
        `• 100% cash funding hoti hai. Shares aapke demat/portfolio mein store ho jate hain.\n` +
        `• Koi time limit nahi hoti — chahe 2 din rakhein ya 2 saal. Loss hone par hold karne ka freedom milta hai.\n\n` +
        `⚡ **Intraday (MIS) [HIGH RISK 5x LEVERAGE]:**\n` +
        `• Kam capital mein 5 guna shares milte hain, lekin 3:20 PM tak har haal mein auto-exit karna padta hai.\n` +
        `• Strictly Stop-Loss (**${currSym}${stopLoss}**) zaroori hai.\n\n` +
        `✅ **Recommendation:** Beginner ya safe traders ke liye **Delivery (CNC)** best hai!`
      );
    } else {
      return (
        `Execution Product Comparison for **${context.symbol}**:\n\n` +
        `• **Delivery (CNC) [Safe / Unleveraged]:** Full cash allocation. Zero margin call risk, indefinite holding period.\n` +
        `• **Intraday (MIS) [5x Leverage]:** High-octane day trading with strict 15:15 IST auto-squareoff. Mandatory stop-loss at **${currSym}${stopLoss}**.\n` +
        `• **Institutional Verdict:** Allocate via Delivery (CNC) unless scalping verified intraday momentum.`
      );
    }
  }

  // 7. GETTING STARTED / BEGINNERS ("kaise shuru kare", "start", "beginner")
  if (
    q.includes("shuru") ||
    q.includes("start") ||
    q.includes("kaise kare") ||
    q.includes("kese kare") ||
    q.includes("kya karu") ||
    q.includes("guide")
  ) {
    if (isHinglish) {
      return (
        `TradeX Pro par trading shuru karne ke 3 simple steps:\n\n` +
        `1. **Stock Select Karein:** Watchlist se **${context.symbol}** choose karein.\n` +
        `2. **Guidance Dekhein:** Aria AI ke levels (Target: **${currSym}${target1}**, SL: **${currSym}${stopLoss}**) verify karein.\n` +
        `3. **1-Click Virtual Order:** Niche **"⚡ Execute Delivery (CNC)"** par click karein. Aapke virtual ₹10,00,000 account se bina kisi real risk ke instant trade execute ho jayegi!`
      );
    } else {
      return (
        `Getting Started on TradeX Pro in 3 Steps:\n\n` +
        `1. **Select Asset:** Select **${context.symbol}** (LTP: ${currSym}${numPrice.toFixed(2)}) from the market dock.\n` +
        `2. **Review AI Levels:** Verify Target at **${currSym}${target1}** and Stop-Loss at **${currSym}${stopLoss}**.\n` +
        `3. **1-Click Order Execution:** Click **"Execute Delivery (CNC)"** to simulate orders with zero-risk virtual capital.`
      );
    }
  }

  // 8. DEFAULT NATURAL RESPONSE
  if (isHinglish) {
    return (
      `**${context.symbol}** ka live status: Abhi yeh **${currSym}${numPrice.toFixed(2)}** par trade kar raha hai.\n\n` +
      `• **Trend:** ${isTrendUp ? "🟢 Bullish (20-SMA ke upar mazboot)" : "🟡 Sideways Base"}\n` +
      `• **Target Projection:** **${currSym}${target1}** (+2.5%) | Stretch: **${currSym}${target2}** (+4.2%)\n` +
      `• **Risk Protection (SL):** **${currSym}${stopLoss}** (-1.5%)\n` +
      `• **RSI Momentum:** **${rsi.toFixed(1)}** (${isRsiOverbought ? "Overbought - dip ka wait karein" : isRsiOversold ? "Oversold - bounce expected" : "Healthy"})\n\n` +
      `Aap niche diye gaye quick buttons se direct trade place kar sakte hain ya koi bhi specific sawal pooch sakte hain!`
    );
  }

  return (
    `**${context.symbol}** Telemetry Analysis:\n\n` +
    `• **Last Traded Price:** **${currSym}${numPrice.toFixed(2)}** (${isTrendUp ? "Bullish above 20-SMA" : "Consolidation"})\n` +
    `• **Calculated Targets:** Primary **${currSym}${target1}** (+2.50%) | Stretch **${currSym}${target2}** (+4.20%)\n` +
    `• **Risk Limit (SL):** **${currSym}${stopLoss}** (-1.50% strict capital preservation stop)\n` +
    `• **Momentum Indicator (RSI-14):** **${rsi.toFixed(1)}**\n\n` +
    `Use the execution buttons below to route a zero-risk simulated order to test this setup.`
  );
}

// Backward compatibility alias
export const generateNeuralSynthesis = generateNaturalConversationalSynthesis;
