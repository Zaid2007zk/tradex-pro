import { NextResponse } from "next/server";
import { STOCKS, INDICES, generateCandles, liveCandle, computeSignals, computeIndexValue, fmtPct } from "@/lib/market/engine";

export const maxDuration = 60;

type Task = "chat" | "ideas" | "news" | "report" | "test-key";
type Language = "english" | "hinglish" | "hindi";
type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

// -----------------------------------------------------------------------------
// INTELLIGENT SYMBOL PARSER (Extracts exact stock from user's question)
// -----------------------------------------------------------------------------
export function extractTargetStock(question: string, defaultSymbol: string) {
  const q = question.toLowerCase();

  // 1. Direct symbol word-boundary match
  for (const s of STOCKS) {
    const symLower = s.symbol.toLowerCase();
    const pattern = new RegExp(`\\b${symLower}\\b`, "i");
    if (pattern.test(q)) {
      return s;
    }
  }

  // 2. Company name match
  for (const s of STOCKS) {
    const firstWord = s.name.toLowerCase().split(/\s+/)[0];
    if (firstWord.length > 2 && new RegExp(`\\b${firstWord}\\b`, "i").test(q)) {
      return s;
    }
  }

  // 3. Common Indian market aliases
  if (/\b(tcs|tata consultancy)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "TCS")!;
  if (/\b(reliance|ril|ambani)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "RELIANCE")!;
  if (/\b(hdfc|hdfcbank|hdfc bank)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "HDFCBANK")!;
  if (/\b(icici|icicibank)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "ICICIBANK")!;
  if (/\b(infy|infosys)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "INFY")!;
  if (/\b(airtel|bharti)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "BHARTIARTL")!;
  if (/\b(sbi|sbin|state bank)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "SBIN")!;
  if (/\b(itc)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "ITC")!;
  if (/\b(l&t|lt|larsen)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "LT")!;
  if (/\b(hul|unilever|hindustan unilever)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "HINDUNILVR")!;
  if (/\b(kotak|kotakbank)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "KOTAKBANK")!;
  if (/\b(axis|axisbank)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "AXISBANK")!;
  if (/\b(maruti|suzuki)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "MARUTI")!;
  if (/\b(sun pharma|sunpharma)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "SUNPHARMA")!;
  if (/\b(hcl|hcltech)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "HCLTECH")!;
  if (/\b(tata motors|tatamotors)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "TATAMOTORS")!;
  if (/\b(adani|adanient)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "ADANIENT")!;
  if (/\b(titan)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "TITAN")!;
  if (/\b(wipro)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "WIPRO")!;
  if (/\b(zomato|eternal)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "ETERNAL")!;

  // 4. MCX Commodities, Forex & Crypto aliases
  if (/\b(gold|sona)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "GOLD")!;
  if (/\b(silver|chandi)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "SILVER")!;
  if (/\b(crude|crude oil|tel)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "CRUDEOIL")!;
  if (/\b(natural gas|gas|ng)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "NATURALGAS")!;
  if (/\b(copper|tamba)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "COPPER")!;
  if (/\b(usdinr|dollar|usd)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "USDINR")!;
  if (/\b(eurinr|euro|eur)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "EURINR")!;
  if (/\b(gbpinr|pound|gbp)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "GBPINR")!;
  if (/\b(jpyinr|yen|jpy)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "JPYINR")!;
  if (/\b(btc|bitcoin)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "BTC")!;
  if (/\b(eth|ethereum)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "ETH")!;
  if (/\b(sol|solana)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "SOL")!;
  if (/\b(bnb|binance)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "BNB")!;

  // 5. US Tech Giants & Global
  if (/\b(nvda|nvidia)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "NVDA")!;
  if (/\b(aapl|apple)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "AAPL")!;
  if (/\b(tsla|tesla|elon)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "TSLA")!;
  if (/\b(msft|microsoft)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "MSFT")!;
  if (/\b(googl|google|alphabet)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "GOOGL")!;
  if (/\b(amzn|amazon)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "AMZN")!;
  if (/\b(meta|facebook)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "META")!;
  if (/\b(giftnifty|gift nifty|sgx nifty|gift city)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "GIFTNIFTY")!;

  // 6. Bonds, Debt & Agri
  if (/\b(g-sec|gsec|bond|india10y|10y bond|treasury)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "INDIA10Y")!;
  if (/\b(sgb|sovereign gold bond)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "SGB")!;
  if (/\b(jeera|ncdex jeera|cumin)\b/i.test(q)) return STOCKS.find((s) => s.symbol === "JEERA")!;

  // 7. Fallback to active terminal symbol
  return STOCKS.find((s) => s.symbol.toUpperCase() === defaultSymbol.toUpperCase()) || STOCKS[0];
}

function buildContext(prices: Record<string, number>, focus?: string): string {
  const lines: string[] = [];
  try {
    const idxParts = INDICES.slice(0, 3).map((idx) => {
      const { value, chgPct } = computeIndexValue(
        idx,
        Object.fromEntries(STOCKS.map((s) => [s.symbol, prices[s.symbol] ?? s.base]))
      );
      return `${idx.name} ${Math.round(value).toLocaleString("en-IN")} (${fmtPct(chgPct)})`;
    });
    lines.push(`INDICES: ${idxParts.join(" | ")}`);
  } catch {
    /* context is best-effort */
  }

  const rows: string[] = [];
  for (const s of STOCKS) {
    const px = prices[s.symbol] ?? s.base;
    try {
      const base = generateCandles(s.symbol, "1D");
      const candles = liveCandle(base, px);
      const prevClose = base[base.length - 1]?.close ?? px;
      const chg = ((px - prevClose) / prevClose) * 100;
      const sig = computeSignals(candles);
      rows.push(
        `${s.symbol}(${s.name}, ${s.sector}) ₹${px.toFixed(2)} ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}% | RSI ${sig.rsi.toFixed(0)} | ${sig.aboveMa50 ? ">" : "<"}MA50 | MACD ${sig.macdBull ? "bull" : "bear"} | verdict ${sig.verdict}`
      );
    } catch {
      rows.push(`${s.symbol} ₹${px.toFixed(2)}`);
    }
  }
  const adv = rows.filter((r) => r.includes("+")).length;
  lines.push(`UNIVERSE: top-20 NSE stocks, ~${adv} up / ${rows.length - adv} down today.`);
  lines.push(rows.join("\n"));
  if (focus) lines.push(`USER IS SPECIFICALLY ASKING ABOUT: ${focus}`);
  return lines.join("\n\n");
}

function extractJson(text: string): unknown | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : text;
  const starts = ["{", "["].map((c) => raw.indexOf(c)).filter((i) => i !== -1);
  if (starts.length === 0) return null;
  const start = Math.min(...starts);
  const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// GROQ API CALLER
// -----------------------------------------------------------------------------
async function callGroq(messages: ChatMsg[], apiKey: string, modelName?: string): Promise<{ text: string; model: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error("Missing Groq API Key");

  // Universal models priority: test llama-3.1-8b-instant first if no custom model, or custom model then universal fallbacks
  const candidates: string[] = [
    modelName || "",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "llama-3.3-70b-versatile",
  ].filter(Boolean);

  let lastError = "";
  for (const model of Array.from(new Set(candidates))) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({
            role: m.role === "system" ? "system" : m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          temperature: 0.5,
          max_tokens: 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) return { text: text.trim(), model };
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = errData?.error?.message || `Groq error status ${res.status}`;
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  throw new Error(lastError || "Groq models could not be reached");
}

// -----------------------------------------------------------------------------
// GOOGLE GEMINI API CALLER
// -----------------------------------------------------------------------------
async function callGemini(messages: ChatMsg[], apiKey: string, modelName?: string): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error("Missing Gemini API Key");

  const cleanModel = (modelName || "gemini-2.0-flash").replace(/^models\//, "").trim();
  const candidates: string[] = [
    cleanModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ].filter(Boolean);

  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let lastError = "";
  for (const model of Array.from(new Set(candidates))) {
    for (const ver of ["v1beta", "v1"]) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${cleanKey}`;
        const body: Record<string, any> = { contents };
        if (systemMsg) {
          body.systemInstruction = { parts: [{ text: systemMsg.content }] };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) return text.trim();
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData?.error?.message || `Gemini error status ${res.status}`;
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }
  }

  throw new Error(lastError || "Gemini models could not be reached");
}

// -----------------------------------------------------------------------------
// NVIDIA NIM API CALLER (OpenAI-compatible)
// -----------------------------------------------------------------------------
async function callNvidia(messages: ChatMsg[], apiKey: string, modelName?: string): Promise<{ text: string; model: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error("Missing NVIDIA API Key");

  const candidates: string[] = [
    modelName || "",
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.1-70b-instruct",
    "deepseek-ai/deepseek-r1",
    "nvidia/llama-3.1-nemotron-70b-instruct",
  ].filter(Boolean);

  let lastError = "";
  for (const model of Array.from(new Set(candidates))) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({
            role: m.role === "system" ? "system" : m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          temperature: 0.5,
          max_tokens: 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) return { text: text.trim(), model };
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = errData?.error?.message || `NVIDIA NIM error status ${res.status}`;
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  throw new Error(lastError || "NVIDIA NIM could not be reached");
}

// -----------------------------------------------------------------------------
// AUTONOMOUS TRADEX NEURAL ENGINE (Zero-Key Guaranteed Intelligence)
// -----------------------------------------------------------------------------
function generateAutonomousResponse(
  task: Task,
  question: string,
  symbol: string,
  prices: Record<string, number>,
  language?: Language
) {
  const targetStock = extractTargetStock(question, symbol);
  const px = prices[targetStock.symbol] || targetStock.base;
  const base = generateCandles(targetStock.symbol, "1D");
  const candles = liveCandle(base, px);
  const prevClose = base[base.length - 1]?.close ?? px;
  const chgPct = ((px - prevClose) / prevClose) * 100;
  const sig = computeSignals(candles);

  const detectedHindiScript = /[क-ह]/.test(question);
  const detectedHinglish = /bhai|kya|kare|karu|krne|karna|konsa|sahi|hai|nhi|chahiye|bataye|batao|kharidu|bechu|rok|kaisa|kesa|rahega|lena|lu|milega|kitna|accha|acha/i.test(question);
  const effectiveLang: Language =
    language || (detectedHindiScript ? "hindi" : detectedHinglish ? "hinglish" : "english");
  const isPureHindi = effectiveLang === "hindi";
  const isHindi = effectiveLang === "hinglish";
  const isOverbought = sig.rsi > 68;
  const isOversold = sig.rsi < 35;

  const target1 = (px * 1.025).toFixed(2);
  const target2 = (px * 1.045).toFixed(2);
  const stopLoss = (px * 0.985).toFixed(2);
  const pullbackEntry = (px * 0.992).toFixed(2);

  if (task === "chat") {
    const qLower = question.toLowerCase();
    const currSym = targetStock.currency === "USD" ? "$" : "₹";

    // 0. Intent: Future Forecast & Profit/Loss Probability (e.g. "1 hafte baad buy karu to profit hoga ya loss?")
    if (
      /profit|loss|fayda|nuksan|nuksaan|hafte|hafta|week|month|mahin|mahina|agle|baad|\bbad\b|kal|tomorrow|future|forecast|predict|मुनाफा|नुकसान|हफ्ते|महीने|फायदा/i.test(
        qLower
      )
    ) {
      const isMonth = /month|mahin|mahina|30|महीने/i.test(qLower);
      const isDay = /\bkal\b|tomorrow|1 day|next day|कल/i.test(qLower);
      const days = isMonth ? 30 : isDay ? 1 : 7;
      const horizonEn = isMonth ? "1 Month (30 Days)" : isDay ? "Next Session (1 Day)" : "1 Week (7 Days)";
      const horizonHi = isMonth ? "1 Mahine (30 Din)" : isDay ? "Agle 1 Din" : "1 Hafte (7 Din)";
      const horizonPureHi = isMonth ? "1 महीने (30 दिन)" : isDay ? "अगले 1 दिन" : "1 हफ्ते (7 दिन)";

      const tfForHorizon = isMonth ? "1M" : isDay ? "1D" : "1W";
      const hCandles = liveCandle(generateCandles(targetStock.symbol, tfForHorizon), px);
      const hSig = computeSignals(hCandles);

      const bullProb = Math.min(82, Math.max(22, Math.round(50 + hSig.score * 0.35)));
      const bearProb = 100 - bullProb;
      const movePct = Math.max(1.5, Math.min(14, targetStock.volatility * Math.sqrt(days) * 0.9));
      const upsideTarget = (px * (1 + movePct / 100)).toFixed(2);
      const idealDip = (px * (1 - (movePct * 0.35) / 100)).toFixed(2);
      const downsideRisk = (px * (1 - (movePct * 0.65) / 100)).toFixed(2);
      const hOverbought = hSig.rsi > 68;
      const hOversold = hSig.rsi < 35;

      if (isPureHindi) {
        return (
          `### 🔮 ${horizonPureHi} का पूर्वानुमान (Probability Forecast): ${targetStock.symbol}\n\n` +
          `• **सीधा जवाब (लाभ या नुकसान?):** शेयर बाजार में 100% गारंटी नहीं होती, लेकिन मौजूदा डेटा के अनुसार **${bullProb}% तेजी (Profit) और ${bearProb}% गिरावट (Loss)** की संभावना है।\n` +
          `• **संभावित प्राइस रेंज:** अगले ${horizonPureHi} में ${targetStock.symbol} **${currSym}${downsideRisk} से ${currSym}${upsideTarget}** के बीच ट्रेड कर सकता है (मौजूदा CMP: ${currSym}${px.toFixed(2)})।\n` +
          `• **तकनीकी स्थिति:** RSI **${hSig.rsi.toFixed(1)}** (${hOverbought ? "ओवरबॉट — थोड़ी गिरावट पर खरीदें" : hOversold ? "ओवरसोल्ड — बाउंस की संभावना" : "संतुलित"}) · MACD **${hSig.macdBull ? "बुलिश" : "मंदा"}**।\n` +
          `• **सही रणनीति:** ${hOverbought ? `1 हफ्ते में सीधे ऊपर खरीदने के बजाय **${currSym}${idealDip}** के सपोर्ट डिप पर एंट्री लें` : `**${currSym}${idealDip} – ${currSym}${px.toFixed(2)}** के बीच हिस्से में खरीदें`} और **${currSym}${downsideRisk}** पर सख्त स्टॉप-लॉस रखें।\n\n` +
          `⚠️ अस्वीकरण: यह तकनीकी संभावना (Probability Model) है, 100% गारंटी या SEBI सलाह नहीं।`
        );
      }

      if (isHindi) {
        return (
          `### 🔮 ${horizonHi} Forecast (Profit vs Loss Probability): ${targetStock.symbol}\n\n` +
          `• **Direct Jawab (Profit hoga ya Loss?):** Market mein 100% guarantee koi nahi de sakta, lekin live technicals ke hisaab se **${bullProb}% Profit (Bullish) aur ${bearProb}% Loss (Bearish)** ki probability hai.\n` +
          `• **Expected ${horizonHi} Range:** **${currSym}${downsideRisk} – ${currSym}${upsideTarget}** (Current CMP: **${currSym}${px.toFixed(2)}**).\n` +
          `• **Technical Telemetry:** RSI **${hSig.rsi.toFixed(1)}** (${hOverbought ? "Overbought — jaldbazi na karein" : hOversold ? "Oversold — bounce possible" : "Healthy Momentum"}) · MACD **${hSig.macdBull ? "Bullish" : "Weak/Consolidation"}** · 50-SMA ke **${hSig.aboveMa50 ? "upar" : "niche"}**.\n` +
          `• **Smart Buying Plan:** ${hOverbought ? `Abhi RSI high hai — ${horizonHi} mein jab **${currSym}${idealDip}** support zone par dip mile tab buy karna zyada safe rahega.` : `**${currSym}${idealDip} se ${currSym}${px.toFixed(2)}** ke beech accumulate karein, Target **${currSym}${upsideTarget}** (+${movePct.toFixed(1)}%) aur strict Stop-Loss **${currSym}${downsideRisk}** rakhein.`}\n\n` +
          `⚠️ *Note: Ye data-backed probability forecast hai (paper-trading simulation ke liye), 100% fixed guarantee nahi.*`
        );
      }

      return (
        `### 🔮 ${horizonEn} Quantitative Forecast: ${targetStock.symbol} (${targetStock.name})\n\n` +
        `• **Probability Split:** Market outcomes are never 100% guaranteed, but current multi-indicator telemetry indicates **${bullProb}% Bullish (Upside) vs ${bearProb}% Bearish (Downside)** probability.\n` +
        `• **Expected ${horizonEn} Range:** **${currSym}${downsideRisk} – ${currSym}${upsideTarget}** (Current CMP: **${currSym}${px.toFixed(2)}**).\n` +
        `• **Technical Drivers:** RSI(14) at **${hSig.rsi.toFixed(1)}** (${hOverbought ? "Overbought — pullback risk" : hOversold ? "Oversold — rebound setup" : "Balanced"}) · MACD **${hSig.macdBull ? "Bullish" : "Bearish/Flat"}** · Price is **${hSig.aboveMa50 ? "above" : "below"}** 50-SMA.\n` +
        `• **Execution Plan:** ${hOverbought ? `Avoid chasing at highs; wait for a pullback entry near **${currSym}${idealDip}**` : `Accumulate in tranches between **${currSym}${idealDip}** and **${currSym}${px.toFixed(2)}**`} with Target **${currSym}${upsideTarget}** (+${movePct.toFixed(1)}%) and strict Stop-Loss **${currSym}${downsideRisk}**.\n\n` +
        `⚠️ *Compliance Note: Probabilistic technical model for educational paper-trading only. Not guaranteed returns or SEBI investment advice.*`
      );
    }

    // 1. Intent: Full market brief in 5 bullets
    if (/market brief|brief in 5|overall market|nifty kaisa|aaj ka market|बाजार/i.test(qLower)) {
      const nifty = INDICES[0];
      const sensex = INDICES[2];
      const bankNifty = INDICES[1];
      const advCount = STOCKS.filter((s) => (prices[s.symbol] ?? s.base) >= s.base).length;
      const decCount = STOCKS.length - advCount;

      if (isPureHindi) {
        return (
          `### 📊 ट्रेडएक्स मार्केट ब्रीफ (5 मुख्य बिंदु)\n\n` +
          `• **1. मुख्य इंडेक्स:** निफ्टी 50 अभी **${Math.round(nifty.base).toLocaleString("en-IN")}** के आसपास और सेंसेक्स **${Math.round(sensex.base).toLocaleString("en-IN")}** पर कारोबार कर रहा है।\n` +
          `• **2. मार्केट ब्रेड्थ:** प्रमुख शेयरों में **${advCount} बढ़त / ${decCount} गिरावट** के साथ संतुलित भागीदारी दिख रही है।\n` +
          `• **3. सेक्टर लीडरशिप:** बैंकिंग (${bankNifty.name} **${Math.round(bankNifty.base).toLocaleString("en-IN")}** पर) और लार्ज-कैप आईटी सेक्टर बाजार को दिशा दे रहे हैं।\n` +
          `• **4. मुख्य स्तर:** निफ्टी का नजदीकी रेजिस्टेंस **${Math.round(nifty.base * 1.008)}** और मजबूत सपोर्ट **${Math.round(nifty.base * 0.992)}** पर है।\n` +
          `• **5. क्वांट सलाह:** बाजार का रुझान मजबूत है — गिरावट पर खरीदारी (Buy-on-Dips) और सख्त स्टॉप-लॉस के साथ ट्रेड करें।`
        );
      }

      if (isHindi) {
        return (
          `### 📊 TradeX Institutional Market Brief (5 Key Bullets)\n\n` +
          `• **1. Benchmark Indices:** NIFTY 50 abhi **${Math.round(nifty.base).toLocaleString("en-IN")}** par trade kar raha hai aur SENSEX **${Math.round(sensex.base).toLocaleString("en-IN")}** ke near sustain kar raha hai.\n` +
          `• **2. Market Breadth:** Top 20 NSE large-caps mein **${advCount} Advancing / ${decCount} Declining** hain, jo steady institutional participation indicate karta hai.\n` +
          `• **3. Sector Leadership:** Banking (${bankNifty.name} at **${Math.round(bankNifty.base).toLocaleString("en-IN")}**) aur Large-Cap IT morning turnover ko lead kar rahe hain.\n` +
          `• **4. Key Pivots:** NIFTY ka immediate resistance **${Math.round(nifty.base * 1.008)}** par hai, aur strong support **${Math.round(nifty.base * 0.992)}** par placed hai.\n` +
          `• **5. Quant Verdict:** Overall trend **Buy-on-Dips** hai. Strength dikhane wale stocks me trailing stop-loss ke sath trade karein.`
        );
      }

      return (
        `### 📊 TradeX Institutional Market Brief (5 Key Bullets)\n\n` +
        `• **1. Benchmark Indices:** NIFTY 50 holds at **${Math.round(nifty.base).toLocaleString("en-IN")}** while SENSEX trades near **${Math.round(sensex.base).toLocaleString("en-IN")}** with healthy liquidity.\n` +
        `• **2. Market Breadth:** Universe breadth stands at **${advCount} Advancing / ${decCount} Declining** stocks with institutional volume absorption.\n` +
        `• **3. Sector Drivers:** Heavyweight Banking (${bankNifty.name} at **${Math.round(bankNifty.base).toLocaleString("en-IN")}**) and Technology counters are driving index direction.\n` +
        `• **4. Key Range:** Immediate NIFTY resistance stands at **${Math.round(nifty.base * 1.008)}**, with pivotal support at **${Math.round(nifty.base * 0.992)}**.\n` +
        `• **5. Strategy Outlook:** Momentum supports a **Buy-on-Dips** approach. Focus on high-relative-strength leaders with disciplined risk controls.`
      );
    }

    // 2. Intent: Riskiest stock today
    if (/riskiest|most risky|high risk|volatil|जोखिम/i.test(qLower)) {
      const sorted = [...STOCKS].sort((a, b) => b.volatility - a.volatility);
      const topRisky = sorted[0];
      const secondRisky = sorted[1];

      if (isPureHindi) {
        return (
          `### ⚠️ हाई-रिस्क वोलैटिलिटी अलर्ट: आज के सबसे जोखिम भरे शेयर\n\n` +
          `• **#1 सबसे ज्यादा उतार-चढ़ाव:** **${topRisky.symbol}** (${topRisky.name}) — इसका वोलैटिलिटी फैक्टर **${topRisky.volatility.toFixed(1)}x** है, जिसमें तेज मूवमेंट आता है।\n` +
          `• **#2 दूसरा जोखिम भरा शेयर:** **${secondRisky.symbol}** (${secondRisky.name}) **${secondRisky.volatility.toFixed(1)}x** वोलैटिलिटी के साथ।\n\n` +
          `💡 जोखिम सलाह: ऐसे शेयरों में अपनी पूंजी का अधिकतम 1-2% ही जोखिम लें और हमेशा स्टॉप-लॉस लगाएं।`
        );
      }

      if (isHindi) {
        return (
          `### ⚠️ High-Beta Volatility Telemetry: Riskiest Stocks Today\n\n` +
          `• **#1 Sabse Risky Stock:** **${topRisky.symbol}** (${topRisky.name}) — iska volatility index **${topRisky.volatility.toFixed(1)}x** hai, jisme tezi se swings aate hain.\n` +
          `• **#2 Runner-Up:** **${secondRisky.symbol}** (${secondRisky.name}) with **${secondRisky.volatility.toFixed(1)}x** volatility.\n\n` +
          `💡 *Risk Advisory: High-beta counters me position size choti rakhein (capital ka max 1-2%) aur bina stop-loss ke kabhi enter na karein.*`
        );
      }

      return (
        `### ⚠️ High-Beta Volatility Telemetry: Riskiest Stocks Today\n\n` +
        `• **#1 Highest Risk:** **${topRisky.symbol}** (${topRisky.name}) carries a volatility factor of **${topRisky.volatility.toFixed(1)}x**, generating wider intraday ATR swings.\n` +
        `• **#2 Runner-Up:** **${secondRisky.symbol}** (${secondRisky.name}) tracking at **${secondRisky.volatility.toFixed(1)}x** beta.\n\n` +
        `💡 *Risk Advisory: Maintain conservative MIS position sizing (maximum 1-2% capital risk per trade) with mandatory hard stop-losses.*`
      );
    }

    // 3. Intent: Intraday plan
    if (/intraday plan|intraday strategy|day trading|intraday setup|इंट्राडे/i.test(qLower)) {
      if (isPureHindi) {
        return (
          `### ⚡ ट्रेडएक्स इंट्राडे ट्रेडिंग प्लान\n\n` +
          `• **चरण 1 (09:15 - 09:30 AM):** 15 मिनट की ओपनिंग रेंज (ORH/ORL) मार्क करें। शुरुआती 15 मिनट में जल्दबाजी से बचें।\n` +
          `• **चरण 2 (ब्रेकआउट कन्फर्मेशन):** जब 5 मिनट की कैंडल 1.5x वॉल्यूम और RSI > 55 के साथ रेंज तोड़े, तभी ट्रेड लें।\n` +
          `• **चरण 3 (एक्जीक्यूशन):** ऑर्डर टिकट से 5x MIS मार्जिन चुनें और तुरंत स्टॉप-लॉस लगाएं।\n` +
          `• **चरण 4 (लक्ष्य और जोखिम):** 1:2 रिस्क-रिवार्ड अनुपात रखें — लक्ष्य +2.0% से +2.5% और स्टॉप-लॉस -1.0% पर सेट करें।`
        );
      }

      if (isHindi) {
        return (
          `### ⚡ TradeX Institutional Intraday Execution Playbook\n\n` +
          `• **Step 1 (09:15 - 09:30 IST):** 15-Minute Opening Range High (ORH) aur Low (ORL) mark karein. Shuruat ke 15 minute me FOMO trade na lein.\n` +
          `• **Step 2 (Breakout Trigger):** Agar 5-min candle ORH ke upar close ho with volume > 1.5x average aur RSI > 55, tab Long setup trigger hota hai.\n` +
          `• **Step 3 (Leverage & Execution):** Order ticket se 5x MIS leverage select karein aur 1-Click execution karein.\n` +
          `• **Step 4 (Risk-Reward):** Stop-loss breakout candle ke low par (-1.0%) lagayein aur Target +2.0% se +2.5% (1:2 R:R) book karein.`
        );
      }

      return (
        `### ⚡ TradeX Institutional Intraday Execution Playbook\n\n` +
        `• **Phase 1 (09:15 - 09:30 IST):** Mark the 15-minute Opening Range High (ORH) and Low (ORL). Avoid early entry during price discovery.\n` +
        `• **Phase 2 (Confirmation):** Await a 5-minute candle close beyond the range with Volume > 1.5x average and RSI confirming above 55.\n` +
        `• **Phase 3 (Execution):** Deploy 5x MIS margin with predefined stop-loss order placed immediately.\n` +
        `• **Phase 4 (Risk-Reward):** Maintain a strict 1:2 risk-to-reward ratio with target expansion at +2.0% to +2.5% and capital protection stop at -1.0%.`
      );
    }

    // 4. Intent: Buy / Entry timing specifically
    if (/buy|kharid|entry|best time|kab lena|lena chahiye|timing|kab buy|kab enter|खरीद/i.test(qLower)) {
      if (isPureHindi) {
        return (
          `### ⏰ खरीदारी का सही समय और स्तर: ${targetStock.symbol} (${targetStock.name})\n\n` +
          `• **1. सही ट्रेडिंग समय:** इंट्राडे के लिए **09:45 AM - 10:45 AM** और **01:30 PM - 02:45 PM** सबसे बेहतर समय है। शुरुआती अस्थिरता से बचें।\n` +
          `• **2. मौजूदा कीमत (LTP):** ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%) · RSI स्तर ${sig.rsi.toFixed(1)} (${isOverbought ? "ओवरबॉट चेतावनी — थोड़ा नीचे आने का इंतजार करें" : isOversold ? "ओवरसोल्ड — बाउंस की संभावना" : "संतुलित मोमेंटम"})।\n` +
          `• **3. उचित एंट्री ज़ोन:** ₹${pullbackEntry} से ₹${px.toFixed(2)} के बीच एंट्री बेहतर रहेगी।\n` +
          `• **4. लक्ष्य और स्टॉप-लॉस:** टारगेट 1: **₹${target1}** (+2.5%) | टारगेट 2: **₹${target2}** (+4.5%) | सख्त स्टॉप-लॉस: **₹${stopLoss}** (-1.5%)।\n\n` +
          `निर्णय: **${sig.verdict.toUpperCase()}**। ऑर्डर टिकट से 1-क्लिक में ट्रेड कर सकते हैं।`
        );
      }

      if (isHindi) {
        if (isOverbought) {
          return (
            `### ⏰ Buy Timing & Price Action: ${targetStock.symbol} (${targetStock.name})\n\n` +
            `• **1. Market Session Timing:** Intraday me enter karne ka sabse best time **09:45 AM - 10:45 AM** (opening volatility subside hone ke baad) aur **01:30 PM - 02:45 PM** (afternoon institutional wave) hota hai. Shuruat ke 09:15 - 09:30 AM me trade avoid karein.\n` +
            `• **2. Current Price Status (Alert):** ${targetStock.symbol} ka RSI (**${sig.rsi.toFixed(1)}**) abhi overbought zone me hai. Isliye current CMP **₹${px.toFixed(2)}** par jaldbazi me FOMO buy na karein.\n` +
            `• **3. Optimal Entry Dip:** Pullback ka wait karein, support zone **₹${pullbackEntry}** ke paas aane par buy karna sabse low-risk entry rahegi.\n` +
            `• **4. Targets & Stop-Loss:** Target 1: **₹${target1}** (+2.5%) | Target 2: **₹${target2}** (+4.5%) | Strict SL: **₹${stopLoss}** (-1.5%).\n\n` +
            `💡 *Pro Tip: Order Ticket se CNC (Delivery) ya 5x MIS select karke Limit order ₹${pullbackEntry} par place kar sakte hain.*`
          );
        } else if (isOversold) {
          return (
            `### ⚡ Prime Buying Opportunity: ${targetStock.symbol} (${targetStock.name})\n\n` +
            `• **1. Market Session Timing:** Abhi accumulation zone active hai! Best entry window **10:00 AM - 11:30 AM** ya afternoon dip me **01:45 PM** par best rehta hai.\n` +
            `• **2. Technical Setup:** RSI (**${sig.rsi.toFixed(1)}**) oversold hai, selling exhaust ho chuki hai aur strong bounce-back expected hai.\n` +
            `• **3. Entry Levels:** Current CMP **₹${px.toFixed(2)}** se lekar **₹${pullbackEntry}** tak buy karne ka golden time hai.\n` +
            `• **4. Target & Stop-Loss:** Target 1: **₹${target1}** | Target 2: **₹${target2}** | Strict SL: **₹${stopLoss}**.\n\n` +
            `💡 *Verdict: High-probability long setup. 1-Click execution ticket se buy order trigger karein.*`
          );
        } else {
          return (
            `### ⏰ Tactical Buy Timing & Execution: ${targetStock.symbol} (${targetStock.name})\n\n` +
            `• **1. Best Time to Enter:** Intraday me entries ke 2 best windows hain: **09:45 AM - 10:45 AM** (ORH breakout confirmation) aur **01:30 PM - 02:45 PM** (afternoon institutional wave).\n` +
            `• **2. Current CMP & Trend:** CMP **₹${px.toFixed(2)}** (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%) · RSI **${sig.rsi.toFixed(1)}** (Balanced/Healthy Momentum) · MACD is **${sig.macdBull ? "Bullish" : "Consolidation"}**.\n` +
            `• **3. Ideal Accumulation Zone:** Current CMP **₹${px.toFixed(2)}** se support dip **₹${pullbackEntry}** ke beech accumulate karein.\n` +
            `• **4. Execution Plan:** Upside Target: **₹${target1}** (+2.5%) | Capital Protection Stop-Loss: **₹${stopLoss}** (-1.5%).\n\n` +
            `💡 *Risk-Reward 1:2.3 favorable hai. Discipline ke sath predefined SL maintain karein.*`
          );
        }
      }

      // English Buy Timing
      return (
        `### ⏰ Tactical Entry & Execution Window: ${targetStock.symbol} (${targetStock.sector})\n\n` +
        `• **1. Optimal Execution Timing:** Prime liquidity windows are **09:45 - 10:45 AM IST** (post-opening range price discovery) and **01:30 - 02:45 PM IST** (institutional flow expansion). Avoid opening noise (09:15 - 09:30 AM).\n` +
        `• **2. Current Price (LTP):** ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}% today) · RSI at ${sig.rsi.toFixed(1)} (${isOverbought ? "Overbought Warning" : isOversold ? "Oversold Opportunity" : "Equilibrium"}).\n` +
        `• **3. Recommended Entry Zone:** ${isOverbought ? `Await tactical pullback to support dip at **₹${pullbackEntry}**` : `Accumulate between **₹${pullbackEntry}** and **₹${px.toFixed(2)}**`}.\n` +
        `• **4. Key Target & Risk Level:** Target 1: **₹${target1}** (+2.5%) | Stop-Loss: **₹${stopLoss}** (-1.5% strict capital protection stop).\n\n` +
        `Tactical Verdict: **${sig.verdict.toUpperCase()}**. Available for immediate 1-Click execution on the Order Ticket.`
      );
    }

    // 5. Default General Inquiry about targetStock (e.g. "tell me about TCS", "TCS kaisa hai", "analyze INFY")
    if (isPureHindi) {
      return (
        `### 🤖 ARIA क्वांट विश्लेषण: ${targetStock.symbol} (${targetStock.name})\n\n` +
        `• **मौजूदा कीमत (LTP):** ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}% आज) · सेक्टर: **${targetStock.sector}**।\n` +
        `• **ट्रेंड और मूविंग एवरेज:** कीमत 50-SMA के **${sig.aboveMa50 ? "ऊपर मजबूत है" : "नीचे कंसोलिडेट कर रही है"}**।\n` +
        `• **तकनीकी मोमेंटम:** RSI **${sig.rsi.toFixed(1)}** · MACD **${sig.macdBull ? "बुलिश (सकारात्मक)" : "न्यूट्रल/मंदा"}** है।\n` +
        `• **खरीदारी ज़ोन:** ₹${pullbackEntry} - ₹${px.toFixed(2)}।\n` +
        `• **मुख्य स्तर:** टारगेट: **₹${target1}** (+2.5%) | स्टॉप-लॉस: **₹${stopLoss}** (-1.5%)।\n` +
        `• **निर्णय:** ${sig.verdict.toUpperCase()} सेटअप। आप ऑर्डर टिकट से CNC या MIS ऑर्डर लगा सकते हैं।\n\n` +
        `⚠️ अस्वीकरण: यह विश्लेषण केवल शैक्षिक पेपर-ट्रेडिंग सिमुलेशन के लिए है।`
      );
    }

    if (isHindi) {
      return (
        `### 🤖 ARIA Quant Analysis: ${targetStock.symbol} (${targetStock.name})\n\n` +
        `• **Current LTP:** ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}% today) · Sector: **${targetStock.sector}**.\n` +
        `• **Trend & Moving Average:** Price 50-SMA ke **${sig.aboveMa50 ? "upar sustain" : "niche consolidate"}** kar raha hai.\n` +
        `• **Technical Momentum:** RSI **${sig.rsi.toFixed(1)}** · MACD is **${sig.macdBull ? "Bullish" : "Neutral/Consolidation"}**.\n` +
        `• **Accumulation Level:** ₹${pullbackEntry} - ₹${px.toFixed(2)}.\n` +
        `• **Key Levels:** Target: **₹${target1}** (+2.5%) | Support / Stop-Loss: **₹${stopLoss}** (-1.5%).\n` +
        `• **Risk-to-Reward:** 1 : 1.7 (Favorable for Disciplined Execution).\n\n` +
        `💡 *Verdict: ${sig.verdict.toUpperCase()} setup. Aap direct Order Ticket se CNC ya MIS order place kar sakte hain.*\n\n` +
        `⚠️ *SEBI Compliance Disclaimer: Ye analysis kewal educational paper-trading simulation ke liye hai. Koi SEBI registered financial advice nahi hai.*`
      );
    }

    // English General Brief
    return (
      `### Institutional Brief: ${targetStock.symbol} (${targetStock.sector})\n\n` +
      `• **Company:** ${targetStock.name} · Market Cap: ₹${targetStock.capCr.toLocaleString("en-IN")} Cr\n` +
      `• **Current Price (LTP):** ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}% today)\n` +
      `• **Technical Telemetry:** RSI at ${sig.rsi.toFixed(1)} (${isOverbought ? "Overbought Zone" : isOversold ? "Oversold Exhaustion" : "Balanced Momentum"}), price is ${sig.aboveMa50 ? "above" : "below"} 50-SMA.\n` +
      `• **Recommended Accumulation:** ₹${pullbackEntry} to ₹${px.toFixed(2)}\n` +
      `• **Upside Target:** ₹${target1} (+2.5%) | **Stop-Loss:** ₹${stopLoss} (-1.5% capital protection stop)\n` +
      `• **Risk-to-Reward Ratio:** 1 : 1.7 (Favorable for Disciplined Execution)\n\n` +
      `Tactical Verdict: **${sig.verdict.toUpperCase()}**. Available for 1-Click execution via the Order Ticket.\n\n` +
      `⚠️ *Compliance Disclaimer: Generated for educational paper-trading simulation only. Not registered SEBI investment advice.*`
    );
  }

  if (task === "ideas") {
    const list = STOCKS.slice(0, 4).map((s, idx) => {
      const p = prices[s.symbol] || s.base;
      const side = idx % 3 === 0 ? "SELL" : "BUY";
      const isShort = side === "SELL";
      return {
        symbol: s.symbol,
        side,
        qty: Math.max(10, Math.floor(40000 / p)),
        product: idx % 2 === 0 ? "MIS" : "CNC",
        entry: Math.round(p * 100) / 100,
        target: Math.round((isShort ? p * 0.975 : p * 1.028) * 100) / 100,
        stop: Math.round((isShort ? p * 1.015 : p * 0.985) * 100) / 100,
        confidence: 82 + ((idx * 4) % 15),
        thesis: `${s.name} momentum confluence with RSI confirmation and breakout pattern on the 1D chart.`,
      };
    });
    return list;
  }

  if (task === "news") {
    return [
      {
        headline: "NIFTY 50 Tests Key Psychological Boundary Amid Institutional Inflows",
        symbol: "NIFTY",
        sentiment: "BULLISH",
        impact: 5,
        summary: "Broad market momentum accelerates as large-cap banking and IT heavyweights lead morning turnover.",
      },
      {
        headline: `${targetStock.symbol} Records Heavy Block Volumes Near Key Pivot Zone`,
        symbol: targetStock.symbol,
        sentiment: chgPct >= 0 ? "BULLISH" : "BEARISH",
        impact: 4,
        summary: `Institutional participation surges around ₹${px.toFixed(2)} with heightened L2 order book depth.`,
      },
      {
        headline: "RBI Liquidity Window Injects Stability Across Interbank Yield Curves",
        symbol: "HDFCBANK",
        sentiment: "NEUTRAL",
        impact: 3,
        summary: "Overnight call rates steady as central bank maintains neutral monetary stance for banking sector.",
      },
      {
        headline: "Crude Oil Futures Soften, Relieving Margin Pressure on Energy and Auto Pack",
        symbol: "RELIANCE",
        sentiment: "BULLISH",
        impact: 4,
        summary: "Refining margins and petrochemical spreads show stabilization into the monthly options expiry.",
      },
      {
        headline: "Tech & Services Index Consolidates Following Mid-Tier Profit Booking",
        symbol: "TCS",
        sentiment: "BEARISH",
        impact: 3,
        summary: "IT counters witness mild mean-reversion after an uninterrupted 4-day breakout rally.",
      },
      {
        headline: "FII Derivative Net Long Positioning Increases to 68% in Index Futures",
        symbol: null,
        sentiment: "BULLISH",
        impact: 4,
        summary: "Derivatives telemetry indicates robust rollover interest with call strike unwinding across 24,000 strikes.",
      },
    ];
  }

  if (task === "report") {
    return `INSTITUTIONAL QUANT REPORT: ${targetStock.symbol} (${targetStock.name})
Sector: ${targetStock.sector} | Market Cap: ₹${targetStock.capCr.toLocaleString("en-IN")} Cr | Currency: INR

1) SNAPSHOT
LTP: ₹${px.toFixed(2)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}% vs Prev Close ₹${prevClose.toFixed(2)})
50-SMA Status: Price is ${sig.aboveMa50 ? "comfortably ABOVE" : "tracking BELOW"} the 50-day moving average.
RSI (14-Period): ${sig.rsi.toFixed(1)} (${isOverbought ? "Overbought Caution" : isOversold ? "Oversold Exhaustion" : "Balanced Momentum"})
MACD: ${sig.macdBull ? "Bullish histogram expansion" : "Bearish crossover / consolidation phase"}

2) BULL CASE
• Sustained buyer dominance on the L2 order book depth ladder with positive volume skew.
• Clear upside expansion trajectory toward immediate resistance at ₹${target1}.

3) BEAR CASE
• Potential mean-reversion if RSI fails to hold immediate trendline support.
• Elevated intraday volatility with risk of shakeout below ₹${stopLoss}.

4) KEY TECHNICAL LEVELS
• Primary Resistance: ₹${target1}
• Secondary Target: ₹${target2}
• Tactical Support: ₹${pullbackEntry}
• Dynamic Stop-Loss: ₹${stopLoss}

5) QUANT SUMMARY & VERDICT
Overall technical posture is graded as ${sig.verdict.toUpperCase()}. Paper-trade positions should be sized using 5x MIS or 1x CNC with stop-loss protection active.`;
  }

  return "";
}

// -----------------------------------------------------------------------------
// POST HANDLER
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  let body: {
    task?: Task;
    question?: string;
    symbol?: string;
    history?: ChatMsg[];
    prices?: Record<string, number>;
    provider?: "groq" | "gemini" | "autonomous" | "zai" | "nvidia";
    apiKey?: string;
    model?: string;
    language?: Language;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const task = body.task ?? "chat";
  const prices = body.prices ?? {};
  const questionRaw = (body.question ?? "").trim();
  const defaultSymbol = (body.symbol ?? "RELIANCE").toUpperCase();

  // Extract the true stock the user is asking about
  const targetStock = extractTargetStock(questionRaw, defaultSymbol);
  const symbol = targetStock.symbol;

  const provider = body.provider ?? "autonomous";
  const apiKey = (body.apiKey || "").trim();
  const model = (body.model || "").trim();
  const language = body.language;

  const langRule =
    language === "hindi"
      ? "CRITICAL LANGUAGE RULE: Reply strictly in natural Hindi using Devanagari script (हिन्दी) with clear market numbers."
      : language === "hinglish"
      ? "CRITICAL LANGUAGE RULE: Reply strictly in natural conversational Indian Hinglish (Roman script, e.g. 'Abhi stock ₹846 par trade kar raha hai...')."
      : language === "english"
      ? "CRITICAL LANGUAGE RULE: Reply strictly in crisp institutional English."
      : "Language Protocol: If the user writes in Hindi or Hinglish, reply in natural financial Hinglish/Hindi.";

  // Test API key endpoint for modal validation
  if (task === "test-key") {
    if (provider === "groq") {
      try {
        const result = await callGroq([{ role: "user", content: "Reply 'OK'" }], apiKey, model);
        return NextResponse.json({
          ok: true,
          message: `Connected successfully to Groq Cloud API (${result.model})!`,
          model: result.model,
        });
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Invalid Groq API key" },
          { status: 400 }
        );
      }
    } else if (provider === "gemini") {
      try {
        const text = await callGemini([{ role: "user", content: "Reply 'OK'" }], apiKey, model);
        return NextResponse.json({
          ok: true,
          message: "Connected successfully to Google Gemini API!",
          model: model || "gemini-2.0-flash",
        });
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Invalid Gemini API key" },
          { status: 400 }
        );
      }
    } else if (provider === "nvidia") {
      try {
        const result = await callNvidia([{ role: "user", content: "Reply 'OK'" }], apiKey, model);
        return NextResponse.json({
          ok: true,
          message: `Connected successfully to NVIDIA NIM API (${result.model})!`,
          model: result.model,
        });
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Invalid NVIDIA NIM API key" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json({ ok: true, message: "TradeX Autonomous Neural Engine is always active and ready." });
  }

  const context = buildContext(prices, symbol);
  const px = prices[symbol] || targetStock.base;
  const baseSys = `You are ARIA CORE — the fully-AI brain of TradeX PRO, an institutional trading terminal for the Indian market (NSE, INR). You reason like a sharp quant analyst.
Rules:
- Ground every claim in the LIVE MARKET CONTEXT below; never invent prices that contradict it.
- Specific Stock Inquiries: If the user asks about a specific stock (e.g. TCS, INFY, HDFC, SBIN), answer SPECIFICALLY about that stock! Currently the user is asking about: ${symbol} (${targetStock.name}) at CMP ₹${px.toFixed(2)}.
- Always include suggested Entry, Target, Stop Loss, and Risk/Reward ratio (e.g. 1:1.7).
- Compliance: Always include educational disclaimer: "For educational paper-trading simulation only. Not registered SEBI investment advice."
- ${langRule}
- Keep answers tight (max ~180 words) unless a report is requested. Use bullets for clarity.
- This is a paper trading terminal — mention risk discipline and levels.

LIVE MARKET CONTEXT (prices in INR):
${context}`;

  // Complete via external AI or autonomous fallback
  const tryExternalLLM = async (messages: ChatMsg[]): Promise<string> => {
    // 1. If explicit Groq key
    if ((provider === "groq" && apiKey) || process.env.GROQ_API_KEY) {
      try {
        const res = await callGroq(messages, apiKey || process.env.GROQ_API_KEY!, model);
        return res.text;
      } catch {}
    }

    // 2. If explicit Gemini key
    if ((provider === "gemini" && apiKey) || process.env.GEMINI_API_KEY) {
      try {
        return await callGemini(messages, apiKey || process.env.GEMINI_API_KEY!, model);
      } catch {}
    }

    // 3. If explicit NVIDIA NIM key
    if ((provider === "nvidia" && apiKey) || process.env.NVIDIA_API_KEY) {
      try {
        const res = await callNvidia(messages, apiKey || process.env.NVIDIA_API_KEY!, model);
        return res.text;
      } catch {}
    }

    throw new Error("No external LLM available; use autonomous engine");
  };

  try {
    if (task === "chat") {
      const history = (body.history ?? []).slice(-8).map((m) => ({ role: m.role, content: m.content }));
      if (!questionRaw) return NextResponse.json({ ok: false, error: "Empty question" }, { status: 400 });

      try {
        const text = await tryExternalLLM([
          { role: "system", content: baseSys },
          ...history,
          { role: "user", content: questionRaw },
        ]);
        return NextResponse.json({ ok: true, text });
      } catch {
        // High quality autonomous response calibrated to targetStock & language
        const fallback = generateAutonomousResponse("chat", questionRaw, symbol, prices, language) as string;
        return NextResponse.json({ ok: true, text: fallback });
      }
    }

    if (task === "ideas") {
      const sys = `${baseSys}\n\nTASK: Propose 3-4 high-conviction paper-trade ideas. Strict JSON only: {"ideas":[{"symbol":"SYMBOL","side":"BUY"|"SELL","qty":number,"product":"MIS"|"CNC"|"MTF","entry":number,"target":number,"stop":number,"confidence":0-100,"thesis":"rationale"}]}`;
      try {
        const text = await tryExternalLLM([
          { role: "system", content: sys },
          { role: "user", content: "Generate alpha ideas now." },
        ]);
        const json = extractJson(text);
        const ideas = Array.isArray(json)
          ? json
          : json && typeof json === "object" && Array.isArray((json as { ideas?: unknown }).ideas)
          ? (json as { ideas: unknown[] }).ideas
          : null;
        if (ideas) return NextResponse.json({ ok: true, ideas });
      } catch {}
      const fallback = generateAutonomousResponse("ideas", "", symbol, prices);
      return NextResponse.json({ ok: true, ideas: fallback });
    }

    if (task === "news") {
      const sys = `${baseSys}\n\nTASK: Generate 6 breaking market news wire bullets with sentiments. Strict JSON only: [{"headline":"string","symbol":"string|null","sentiment":"BULLISH"|"BEARISH"|"NEUTRAL","impact":1-5,"summary":"string"}]`;
      try {
        const text = await tryExternalLLM([
          { role: "system", content: sys },
          { role: "user", content: "Generate breaking market news wire now." },
        ]);
        const json = extractJson(text);
        const news = Array.isArray(json)
          ? json
          : json && typeof json === "object" && Array.isArray((json as { news?: unknown }).news)
          ? (json as { news: unknown[] }).news
          : null;
        if (news) return NextResponse.json({ ok: true, news });
      } catch {}
      const fallback = generateAutonomousResponse("news", "", symbol, prices);
      return NextResponse.json({ ok: true, news: fallback });
    }

    if (task === "report") {
      const sys = `${baseSys}\n\nTASK: Generate a comprehensive quantitative research report for ${symbol}. Formatted in clean Markdown with sections: SNAPSHOT, BULL CASE, BEAR CASE, KEY TECHNICAL LEVELS, QUANT SUMMARY.`;
      try {
        const text = await tryExternalLLM([
          { role: "system", content: sys },
          { role: "user", content: `Generate deep research report for ${symbol}` },
        ]);
        return NextResponse.json({ ok: true, text });
      } catch {}
      const fallback = generateAutonomousResponse("report", "", symbol, prices) as string;
      return NextResponse.json({ ok: true, text: fallback });
    }

    return NextResponse.json({ ok: false, error: "Unknown task" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal AI engine failure" },
      { status: 500 }
    );
  }
}
