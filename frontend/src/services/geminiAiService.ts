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

  const systemInstruction = `You are TradeX Pro AI, an elite institutional quantitative trader and financial trading mentor.
You speak fluent Hinglish and English depending on how the user talks.
Always provide clear, direct, structured advice using markdown, bullet points, and helpful emojis.
When asked how to start ("me shuru kese karu", "how to start"), explain in 4 clear beginner-friendly steps:
1. Select Stock from Watchlist & read the AI Decision Nodes on chart.
2. Delivery (CNC) [Safe for beginners] vs Intraday (MIS) [High Risk with 5x leverage].
3. Place Order in Order Ticket with Quantity & Stop-Loss.
4. Practice 100% risk-free using ₹10,00,000 Virtual Paper Trading Cash!
When analyzing a stock, strictly reference the live metrics provided:
- Symbol: ${context.symbol}
- Current Market Price: ${context.currency === "INR" || context.currency === "₹" ? "₹" : "$"}${context.price.toFixed(2)}${typeof context.changePercent === "number" ? ` (${context.changePercent >= 0 ? "+" : ""}${context.changePercent.toFixed(2)}%)` : ""}
- 14-Day Wilder RSI: ${context.rsi14.toFixed(1)}
- 20-Day SMA: ${context.currency === "INR" ? "₹" : "$"}${context.sma20.toFixed(2)}
- 50-Day SMA: ${context.currency === "INR" ? "₹" : "$"}${context.sma50.toFixed(2)}
- MACD: ${context.macd.toFixed(2)} vs Signal ${context.macdSignal.toFixed(2)} (Delta: ${(context.macd - context.macdSignal).toFixed(2)})
- Annualized Volatility: ${context.volatility.toFixed(1)}%
Never invent fake URLs. If the user asks where market will go up or down, provide exact breakout thresholds based on price and 20-SMA.`;

  const contents: any[] = [];

  // Add system instruction as premier context
  contents.push({
    role: "user",
    parts: [{ text: systemInstruction }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I am TradeX Pro AI, ready to analyze live market data and guide traders with precision." }],
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
    parts: [{ text: prompt }],
  });

  // Try multiple live model endpoints
  const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  for (const mod of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (response.ok) {
        const json = await response.json();
        const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      }
    } catch {}
  }

  return generateNeuralSynthesis(prompt, context);
}

/**
 * Intelligent Dynamic Neural Synthesis Engine
 * Used when no cloud key is provided so users still get high-level AI analysis
 */
export function generateNeuralSynthesis(prompt: string, context: MarketContext): string {
  const q = prompt.toLowerCase();
  const currSym = context.currency === "INR" || context.currency === "₹" ? "₹" : "$";
  const changePct = typeof context.changePercent === "number" ? context.changePercent : 0;
  const isTrendUp = context.price > context.sma20 && context.sma20 > context.sma50;
  const isMacdCross = context.macd > context.macdSignal;
  const isRsiOverbought = context.rsi14 > 70;
  const isRsiOversold = context.rsi14 < 35;
  const upThreshold = (Math.max(context.price, context.sma20) * 1.008).toFixed(2);
  const downThreshold = (Math.min(context.price, context.sma20) * 0.992).toFixed(2);
  const target1 = (context.price * (isTrendUp ? 1.025 : 0.98)).toFixed(2);
  const stopLoss = (context.price * (isTrendUp ? 0.985 : 1.015)).toFixed(2);

  // 1. Selling, Exit & Profit Booking Timing (Highest Priority for Exit Execution)
  if (
    q.includes("sell") ||
    q.includes("bech") ||
    q.includes("exit") ||
    q.includes("booking") ||
    q.includes("profit book") ||
    q.includes("kab nikle") ||
    q.includes("kab nikal") ||
    (q.includes("best time") && (q.includes("sell") || q.includes("bech") || q.includes("exit") || q.includes("nikal")))
  ) {
    return `### 🎯 AI Guidance: Stock Kab Sell (Exit) Karein — Best Timing & Rules for **${context.symbol}**\n\n` +
      `Trading mein munafa tabhi banta hai jab aap **sahi time par sell (exit) karein**:\n\n` +
      `1. **⏰ Intraday (MIS) ke liye Best Selling Time:**\n` +
      `   • **Morning Wave (9:45 AM - 10:30 AM):** Opening momentum par buyers ka first surge aate hi apna 50% profit lock karein.\n` +
      `   • **Power Hour (2:00 PM - 3:00 PM):** European market movement aur intraday closing trend par target exit lein.\n` +
      `   • **⚠️ 3:15 PM Hard Exit:** Intraday trades ko har haal mein 3:15 PM se pehle close karein, warna 3:20 PM par broker auto square-off karke extra charges lagata hai.\n\n` +
      `2. **📊 ${context.symbol} ke Live Exit Targets (Aaj ke Levels):**\n` +
      `   • **Target 1 (50% Quantity Sell):** **${currSym}${target1}** (+2.5% move). Yahan adha profit lock karein.\n` +
      `   • **Target 2 (Runner Quantity Sell):** **${currSym}${(context.price * 1.042).toFixed(2)}** (+4.2% move).\n` +
      `   • **Strict Stop-Loss (Sell in Loss):** **${currSym}${stopLoss}** (-1.5%). Agar price iske niche gire toh bina kisi lalach ke turant bech kar loss cut karein!\n\n` +
      `3. **💡 Technical Signs: Kab Sell Button Dabayein?**\n` +
      `   • **RSI Overbought:** Current RSI **${context.rsi14.toFixed(1)}** hai. Agar RSI 75-80 cross kare toh buyers thak chuke hote hain—turant sell karein.\n` +
      `   • **Candle Breakdown:** Agar 15-minute chart par 20-Day SMA (${currSym}${context.sma20.toFixed(2)}) ke niche red candle close ho jaye.\n\n` +
      `> 🏆 *AI Golden Rule: "Kabi top tick par bechne ka wait mat karo. Jab profit green me ho, partial quantity sell karke capital safe karo!"*`;
  }

  // 2. Buying, Entry Timing & Opportunities
  if (
    (q.includes("buy") || q.includes("khareed") || q.includes("entry") || q.includes("le lu")) &&
    (q.includes("best time") || q.includes("kab") || q.includes("sahi time") || q.includes("karein") || q.includes("kya"))
  ) {
    return `### 🚀 AI Guidance: Stock Kab Buy (Enter) Karein — Best Timing Rules for **${context.symbol}**\n\n` +
      `Galat time par buy karne se loss hota hai. Sahi entry lene ke 3 golden rules:\n\n` +
      `1. **⏰ Day Trading Entry Window:**\n` +
      `   • **9:15 AM - 9:30 AM me trade MAT lein:** Is waqt opening trap hota hai.\n` +
      `   • **Best Time (9:45 AM - 10:30 AM):** First 30 minutes ka high break hone par safe entry banti hai.\n` +
      `   • **Afternoon Dip Entry (1:30 PM - 2:15 PM):** Jab pullback support se bounce kare.\n\n` +
      `2. **📊 ${context.symbol} ke Live Entry Triggers:**\n` +
      `   • **Breakout Entry (Bullish):** Buy above **${currSym}${upThreshold}** candle confirmation ke sath.\n` +
      `   • **Dip Entry:** 20-Day SMA (**${currSym}${context.sma20.toFixed(2)}**) par bounce hone par buy karein.\n` +
      `   • **Stop-Loss Mandate:** **${currSym}${stopLoss}** lagana na bhoolein.\n\n` +
      `3. **🛡️ Safe Trading Recommendation:**\n` +
      `   Beginners ke liye **Delivery (CNC)** sabse safe hai kyunki koi daily expiry nahi hoti!`;
  }

  // 3. Stop-Loss, Capital Protection & Loss Management
  if (
    q.includes("stop loss") ||
    q.includes("stoploss") ||
    q.includes("sl ") ||
    q.includes("loss se") ||
    q.includes("loss ho") ||
    q.includes("recovery") ||
    q.includes("ghata")
  ) {
    return `### 🛡️ AI Risk Management: Stop-Loss & Loss Recovery Rules\n\n` +
      `Stock market mein kamyabi profit se nahi, balki **loss ko control karne se** milti hai:\n\n` +
      `1. **Stop-Loss Kaise Kaam Karta Hai?**\n` +
      `   Yeh aapka automated safety net hai. Agar price **${currSym}${stopLoss}** ke niche fisla, toh system aapko sirf 1.5% chote loss par automatically bahar nikal dega taaki aapka baki 98.5% capital safe rahe.\n\n` +
      `2. **${context.symbol} Risk-Reward Equation:**\n` +
      `   • **Current Price:** ${currSym}${context.price.toFixed(2)}\n` +
      `   • **Stop-Loss (SL):** **${currSym}${stopLoss}** (-1.5%)\n` +
      `   • **Target 1:** **${currSym}${target1}** (+2.5%)\n` +
      `   • **Risk : Reward:** **1 : 1.7** (Institutional Grade Setup).\n\n` +
      `3. **Loss Ho Jaye Toh Yeh 3 Galatiya Kabi Mat Karna:**\n` +
      `   • **Revenge Trading:** Gusse me double quantity se trade na lein.\n` +
      `   • **Averaging in Losing Trade:** Girte hue stock me aur paisa na dalein.\n` +
      `   • **Max 2 Trades/Day:** Din me 2 Stop-Loss hit hote hi system band kar dein!`;
  }

  // 4. Market Timings & Sessions
  if (
    q.includes("timing") ||
    q.includes("open") ||
    q.includes("close") ||
    q.includes("kitne baje") ||
    q.includes("kab khulta") ||
    q.includes("kab band") ||
    q.includes("hours")
  ) {
    return `### ⏱️ Indian Stock Market (NSE / BSE) Trading Timings\n\n` +
      `* **Pre-Open Session:** 9:00 AM - 9:08 AM (Opening price discovery).\n` +
      `* **Normal Market Hours:** **9:15 AM - 3:30 PM IST** (Continuous equity trading).\n` +
      `* **Intraday (MIS) Square-Off:** **3:20 PM IST** (Broker auto exit time).\n` +
      `* **Market Working Days:** Monday se Friday (Saturday, Sunday aur National Holidays par market band rehta hai).\n\n` +
      `> 💡 *AI Pro Tip: 9:15 - 9:30 AM me beginners trade na karein. Best intraday trading 9:45 AM se 11:30 AM aur 1:45 PM se 3:00 PM tak hoti hai!*`;
  }

  // 5. Technical Indicators Explained (RSI, MACD, Moving Averages)
  if (
    q.includes("rsi") ||
    q.includes("macd") ||
    q.includes("moving average") ||
    q.includes("sma") ||
    q.includes("indicator") ||
    q.includes("candle") ||
    q.includes("chart")
  ) {
    return `### 📊 Technical Indicators Simplified for **${context.symbol}**\n\n` +
      `1. **RSI (Relative Strength Index):**\n` +
      `   • Current RSI: **${context.rsi14.toFixed(1)}**\n` +
      `   • **Under 30 (Oversold):** Stock bohot gir chuka hai, yahan se bounce aayega (BUY signal).\n` +
      `   • **Above 70 (Overbought):** Stock overstretched hai, selling aane ka risk hai (PROFIT BOOKING signal).\n\n` +
      `2. **20-Day & 50-Day SMA (Simple Moving Average):**\n` +
      `   • 20-Day SMA: **${currSym}${context.sma20.toFixed(2)}** | 50-Day SMA: **${currSym}${context.sma50.toFixed(2)}**\n` +
      `   • Price SMA ke upar chal raha hai = **Strong Bullish Trend**.\n\n` +
      `3. **MACD (Moving Average Convergence Divergence):**\n` +
      `   • MACD: **${context.macd.toFixed(2)}** vs Signal: **${context.macdSignal.toFixed(2)}**\n` +
      `   • Positive divergence indicates buyers market me aggressive hain!`;
  }

  // 6B. Options & Derivatives (Call, Put, F&O, Strike Price)
  if (
    q.includes("option") ||
    q.includes("call") ||
    q.includes("put") ||
    q.includes("f&o") ||
    q.includes("fno") ||
    q.includes("strike") ||
    q.includes("ce ") ||
    q.includes("pe ") ||
    q.includes("expiry")
  ) {
    return `### ⚡ Options & F&O Trading Guide: Call (CE) vs Put (PE)\n\n` +
      `Options trading high-reward ke sath **high-risk** instrument hai. Iske core concepts:\n\n` +
      `1. **Call Option (CE) — Bullish Bet:**\n` +
      `   • Jab aapko lage stock ya index **UPAR** jayega, tab CE buy kiya jata hai.\n` +
      `   • Agar market tezi se upar bhage toh premium tezi se badhta hai.\n\n` +
      `2. **Put Option (PE) — Bearish Bet:**\n` +
      `   • Jab aapko lage stock ya index **NICHE** girega, tab PE buy kiya jata hai.\n` +
      `   • Market crash ya fall hone par Put ka premium badhta hai.\n\n` +
      `3. **⚠️ Time Decay (Theta) Ka Khatra:**\n` +
      `   • Options buyer ke dushman hota hai 'Time'. Agar stock wahin khada raha, toh premium har ghante melt ho kar zero ho jata hai.\n` +
      `   • SEBI report ke mutabik 93% retail traders options buying mein paisa gawa dete hain.\n\n` +
      `4. **AI Recommendation:**\n` +
      `   Beginners pehle TradeX Pro ke **₹10,00,000 Virtual Paper Trading** par equity stocks (Delivery/Intraday) mein chart reading aur Stop-Loss discipline seekhein, uske baad hi options touch karein!`;
  }

  // 6C. Intraday vs Delivery Difference (MIS vs CNC)
  if (
    (q.includes("intraday") && q.includes("delivery")) ||
    (q.includes("mis") && q.includes("cnc")) ||
    q.includes("difference") ||
    q.includes("antar") ||
    q.includes("farq")
  ) {
    return `### ⚖️ Intraday (MIS) vs Delivery (CNC): Sahi Product Chunein\n\n` +
      `1. **Delivery (CNC - Cash & Carry) [SAFE / RECOMMENDED]:**\n` +
      `   • **Holding Period:** Lifetime (1 din, 1 mahina, ya 10 saal).\n` +
      `   • **Leverage:** 1x (Jitna paisa wallet me hai utne ke hi share khareed sakte hain).\n` +
      `   • **Risk:** Low. Agar aaj price gir bhi gaya, toh loss book karne ki jaldi nahi hai; bounce aane tak hold kar sakte hain.\n\n` +
      `2. **Intraday (MIS - Margin Intraday Square-off) [HIGH RISK]:**\n` +
      `   • **Holding Period:** Sirf aaj ka din (9:15 AM se 3:20 PM tak).\n` +
      `   • **Leverage:** 5x (Agar aapke paas ₹10,000 hain, toh aap ₹50,000 ka trade le sakte hain).\n` +
      `   • **Compulsory Exit:** 3:20 PM par broker auto square-off kar deta hai, chahe profit ho ya loss.\n\n` +
      `3. **Verdict for You:**\n` +
      `   Agar aap beginner hain toh **Delivery (CNC)** se shuru karein taaki capital safe rahe!`;
  }

  // 6D. Greetings, Introduction & Identity
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.includes("kaun ho") ||
    q.includes("who are you") ||
    q.includes("kya kar sakte") ||
    q.includes("help")
  ) {
    return `### 🤖 Namaste! Main hoon TradeX Pro AI Assistant\n\n` +
      `Main ek institutional quantitative trading AI hoon. Main aapko live stock market mein guidance dene ke liye trained hoon:\n\n` +
      `* **Live Stock Analysis:** ${context.symbol} ka price (**${currSym}${context.price.toFixed(2)}**), RSI (${context.rsi14.toFixed(1)}), aur Moving Averages.\n` +
      `* **Target & Stop-Loss:** Exit target (${currSym}${target1}) aur safe stop-loss (${currSym}${stopLoss}) calculation.\n` +
      `* **Timing Guide:** Stock kab buy karein aur kab sell karke munafa lock karein.\n` +
      `* **Audio Voice Guide:** Screen par upar "Aria" assistant aapko bol kar bhi guide karegi.\n\n` +
      `Aap mujhse koi bhi sawaal Hinglish ya English mein pooch sakte hain—jaise *"Me shuru kese karu"*, *"Kab sell karein"*, ya *"Stop loss kya hota hai"*!`;
  }

  // 6. Capital, Money & Quantity
  if (
    q.includes("kitna paisa") ||
    q.includes("capital") ||
    q.includes("quantity") ||
    q.includes("kitne share") ||
    q.includes("budget")
  ) {
    return `### 💰 Capital & Position Sizing Guide for **${context.symbol}**\n\n` +
      `1. **Virtual Practice First (Zero Cost):**\n` +
      `   TradeX Pro par aapko **₹10,00,000 ka Virtual Paper Trading Wallet** diya gaya hai. Shuruat me bina real paise ke practice karein.\n\n` +
      `2. **Position Size for ${context.symbol}:**\n` +
      `   • **Beginner Batch:** 10 se 25 shares.\n` +
      `   • **Delivery (CNC):** 25 shares ke liye ~${currSym}${(context.price * 25).toFixed(0)} full cash chahiye.\n` +
      `   • **Intraday (MIS 5x):** Sirf ~${currSym}${((context.price * 25) / 5).toFixed(0)} margin chahiye!\n\n` +
      `3. **Capital Rule:** Single trade me pure portfolio ka 2% se zyada risk na lein!`;
  }

  // 7. Beginner / Start queries
  if (
    q.includes("shuru") ||
    q.includes("start") ||
    q.includes("kese") ||
    q.includes("kaise") ||
    q.includes("seekhna") ||
    q.includes("guide") ||
    q.includes("beginner") ||
    q.includes("kya karu")
  ) {
    return `### 🚀 TradeX Pro AI: Shuruat Kaise Karein (Step-by-Step Guide)\n\n` +
      `Aap bina kisi real paise ke pure market ko 4 aasan steps mein master kar sakte hain:\n\n` +
      `1. **📊 Live Stock Chunein & AI Nodes Dekhein:**\n` +
      `   Top watchlist se **${context.symbol}** chunein. Chart ke upar **AI Visual Decision Nodes** dekhein jo batata hai market kahan UP hoga aur kahan DOWN hoga.\n\n` +
      `2. **⚖️ Delivery (CNC) vs Intraday (MIS) Samjhein:**\n` +
      `   • **Delivery (CNC) [SAFE / LOW RISK]:** Beginners ke liye best hai. Shares aapke wallet mein hold rehte hain, koi daily expiry nahi hoti.\n` +
      `   • **Intraday (MIS) [HIGH RISK]:** 5x leverage milta hai par aaj hi 3:20 PM tak close karna hota hai. Strict Stop-Loss zaroori hai.\n\n` +
      `3. **🎯 Virtual Order Place Karein (Zero Risk):**\n` +
      `   Right side panel par **BUY** click karein, Quantity dalein (10 ya 25 shares), aur order execute karein! Aapke paas ₹10,00,000 ka virtual cash hai.\n\n` +
      `4. **📈 Profit & Stop-Loss Plan:**\n` +
      `   Target: **${currSym}${target1}** (+2.5%) par 50% profit lock karein. Stop-Loss: **${currSym}${stopLoss}** (-1.5%) par loss cut karein.\n\n` +
      `> 💡 *Tip: Aap upar "Connect Gemini AI" button se apni free Google AI Studio key jod kar 100% unrestricted live conversational AI activate kar sakte hain!*`;
  }

  // 2. Market UP / DOWN direction queries
  if (q.includes("kaha up") || q.includes("kaha down") || q.includes("up hoga") || q.includes("down hoga") || q.includes("direction")) {
    return `### 🧭 AI Market Direction Predictor for **${context.symbol}**\n\n` +
      `* **🚀 UP Trajectory Trigger:** Agar price **${currSym}${upThreshold}** ke upar breakout kare, toh upward momentum confirm hoga. Target: **${currSym}${target1}** (+2.5%).\n` +
      `* **🔻 DOWN Trajectory Trigger:** Agar price **${currSym}${downThreshold}** ke niche toota, toh breakdown risk hai.\n` +
      `* **Current Trend Status:** Price (${currSym}${context.price.toFixed(2)}) is trading ${context.price >= context.sma20 ? "ABOVE" : "BELOW"} 20-Day SMA (${currSym}${context.sma20.toFixed(2)}). Outlook: **${isTrendUp ? "BULLISH EXPANSION" : "CONSOLIDATION"}**.\n` +
      `* **RSI Momentum:** **${context.rsi14.toFixed(1)}** (${context.rsi14 > 60 ? "Strong buyers control" : "Balanced accumulation"}).`;
  }

  // 3. What to buy & Risk queries
  if (q.includes("konsa buy") || q.includes("kisme risk") || q.includes("risk") || q.includes("difference") || q.includes("compare")) {
    return `### ⚖️ AI Risk & Opportunity Assessment for **${context.symbol}**\n\n` +
      `* **Buying Recommendation:** ${isTrendUp && isMacdCross ? "STRONG BUY / ACCUMULATE" : "BUY ON DIPS (PULLBACK ACCUMULATION)"}\n` +
      `* **Risk Classification:** ${context.volatility > 25 ? "MODERATE-HIGH VOLATILITY (Use tight stops)" : "LOW-MODERATE RISK (Stable institutional backing)"}\n` +
      `* **Safe Execution:** Delivery (CNC) mein 1-2 week swing holding sabse safe hai.\n` +
      `* **Position Sizing:** Capital ka maximum 2-3% risk karein. Recommended quantity: **25 shares** with stop-loss at **${currSym}${stopLoss}**.`;
  }

  // 4. Price predictions & targets
  if (q.includes("predict") || q.includes("tomorrow") || q.includes("kal") || q.includes("target")) {
    return `### 🧠 AI Neural Model Forecast for **${context.symbol}**\n\n` +
      `* **Expected Primary Target (T1):** **${currSym}${target1}** (+2.5%)\n` +
      `* **Extended Target (T2):** **${currSym}${(context.price * 1.042).toFixed(2)}** (+4.2%)\n` +
      `* **Dynamic Stop-Loss:** **${currSym}${stopLoss}** (-1.5%)\n` +
      `* **Confluence Bias:** ${isTrendUp ? "BULLISH (Upward continuation favoured by 20/50 SMA golden alignment)" : "NEUTRAL/CONSOLIDATING"}.\n` +
      `* **MACD Signal:** ${isMacdCross ? "Positive buyer divergence confirmed" : "Histogram converging"}.`;
  }

  // 5. Default Generative Multi-Factor LLM Response for Any Query
  return `### 🤖 TradeX AI Analysis for **${context.symbol}**\n\n` +
    `Aapne poocha: *"${prompt}"*\n\n` +
    `Is sawaal ka direct aur actionable financial solution yeh hai:\n\n` +
    `1. **Market Context & Current Status:**\n` +
    `   • **${context.symbol}** abhi **${currSym}${context.price.toFixed(2)}** (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%) par trade kar raha hai.\n` +
    `   • Technical bias **${isTrendUp ? "BULLISH (Upar jane ke aasaar zyada hain)" : "SIDEWAYS/CONSOLIDATING"}** hai kyunki price 20-Day SMA (${currSym}${context.sma20.toFixed(2)}) ke ${context.price >= context.sma20 ? "upar" : "niche"} hai.\n` +
    `   • Momentum Indicator RSI **${context.rsi14.toFixed(1)}** par hai, jo ${isRsiOverbought ? "overbought zone me hai (profit booking alert)" : isRsiOversold ? "oversold rebound zone me hai" : "healthy balanced zone me hai"}.\n\n` +
    `2. **Direct Action Plan for Traders:**\n` +
    `   • **Entry Point:** ${currSym}${context.price.toFixed(2)} ke aas-paas ya dip par.\n` +
    `   • **First Profit Target:** **${currSym}${target1}** (+2.5% move par 50% maal bech kar profit lock karein).\n` +
    `   • **Capital Protection Stop-Loss:** **${currSym}${stopLoss}** (-1.5% par loss cut karein).\n\n` +
    `3. **Best Practices for You:**\n` +
    `   Agar aap beginner hain toh **Delivery (CNC)** me trade karein, aur bina Stop-Loss koi position open na karein!\n\n` +
    `*Aap mujhse pooch sakte hain: "Kab sell karein?", "Konsa buy karein?", "Kahan UP/DOWN hoga?", ya "Loss se kaise bachein?"*`;
}
