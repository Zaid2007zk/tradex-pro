"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ArrowUp, Bot, BrainCircuit, FileText, Gauge, Loader2, Mic, Newspaper, Sparkles, Volume2, VolumeX, X, Zap } from "lucide-react";
import type { Order, Position } from "./order-ticket";
import type { Quote } from "@/hooks/use-market";
import Autopilot from "./autopilot";

type Msg = { role: "user" | "aria"; text: string };
type Tab = "chat" | "ideas" | "news" | "report" | "autopilot";

/* minimal typings for the browser SpeechRecognition API (Chrome/Edge) */
type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type Idea = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  product: "MIS" | "CNC" | "MTF";
  entry: number;
  target: number;
  stop: number;
  confidence: number;
  thesis: string;
};

type NewsItem = {
  headline: string;
  symbol: string | null;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  impact: number;
  summary: string;
};

const CHAT_ICEBREAKERS = [
  "Full market brief in 5 bullets",
  "Is HDFCBANK a buy right now?",
  "What's the riskiest stock today?",
  "Build me an intraday plan",
];

async function callAi(payload: Record<string, unknown>) {
  let provider = "autonomous";
  let apiKey = "";
  if (typeof window !== "undefined") {
    provider = localStorage.getItem("tradex_ai_provider") || "autonomous";
    if (provider === "groq") {
      apiKey = localStorage.getItem("tradex_groq_key") || "";
    } else if (provider === "gemini") {
      apiKey = localStorage.getItem("tradex_gemini_key") || "";
    }
  }

  const res = await fetch("/api/ai-core", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, provider, apiKey }),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; text?: string; ideas?: Idea[]; news?: NewsItem[] };
  if (!res.ok || !data.ok) throw new Error(data.error || "AI core is unreachable. Try again.");
  return data;
}

const SENT_STYLE: Record<NewsItem["sentiment"], string> = {
  BULLISH: "border-emerald-500/40 bg-emerald-500/12 text-emerald-300",
  BEARISH: "border-rose-500/40 bg-rose-500/12 text-rose-300",
  NEUTRAL: "border-white/20 bg-white/8 text-white/60",
};

const TABS: { key: Tab; label: string; icon: typeof Sparkles }[] = [
  { key: "chat", label: "Chat", icon: Sparkles },
  { key: "ideas", label: "Alpha Ideas", icon: Zap },
  { key: "news", label: "NewsWire", icon: Newspaper },
  { key: "report", label: "Deep Report", icon: FileText },
  { key: "autopilot", label: "Autopilot", icon: Bot },
];

function Skeleton({ lines }: { lines: number }) {
  return (
    <div className="space-y-2.5 px-1 py-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="tx-shimmer h-3.5 rounded bg-white/8" style={{ width: `${92 - (i % 3) * 14}%` }} />
      ))}
    </div>
  );
}

export default function AiCore({
  quotes,
  symbol,
  positions,
  onSelect,
  onExecute,
}: {
  quotes: Record<string, Quote>;
  symbol: string;
  positions: Position[];
  onSelect: (s: string) => void;
  onExecute: (o: Omit<Order, "id" | "ts">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");

  // chat state
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "aria", text: "ARIA CORE online — real LLM reasoning over the live simulated feed. Ask for a market brief, risk scan, trade plan or anything on the tape." },
  ]);
  const [input, setInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // ideas state
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [ideasBusy, setIdeasBusy] = useState(false);
  const [ideasErr, setIdeasErr] = useState<string | null>(null);
  const [executed, setExecuted] = useState<Set<string>>(new Set());

  // news state
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsErr, setNewsErr] = useState<string | null>(null);

  // report state
  const [report, setReport] = useState<Record<string, string>>({});
  const [reportBusy, setReportBusy] = useState(false);
  const [reportErr, setReportErr] = useState<string | null>(null);

  // voice state
  const [voiceOut, setVoiceOut] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micState, setMicState] = useState<"idle" | "listening" | "processing">("idle");
  const [micErr, setMicErr] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceOutRef = useRef(false);
  const [micSupported, setMicSupported] = useState(false);

  useEffect(() => {
    setMicSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const priceSnapshot = useCallback(
    () => Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, v.price])),
    [quotes]
  );

  useEffect(() => {
    chatRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, chatBusy]);

  const speak = useCallback(async (text: string) => {
    try {
      setSpeaking(true);
      const res = await fetch("/api/ai-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("tts failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      await audio.play();
    } catch {
      setSpeaking(false); // voice is best-effort; text remains available
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    setSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceOut((v) => {
      voiceOutRef.current = !v;
      if (v) stopSpeaking();
      return !v;
    });
  }, [stopSpeaking]);

  const startListening = useCallback(() => {
    if (micState !== "idle") return;
    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SpeechRec) | undefined;
    if (!Ctor) {
      setMicErr("Mic dictation needs Chrome or Edge. Type your question instead.");
      return;
    }
    setMicErr(null);
    setMicState("listening");
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        setMicState("processing");
        void sendChatRef.current?.(transcript);
      }
    };
    rec.onend = () => setMicState("idle");
    rec.onerror = () => setMicState("idle");
    rec.start();
  }, [micState]);

  const sendChat = async (text: string) => {
    const q = text.trim();
    if (!q || chatBusy) return;
    stopSpeaking();
    setInput("");
    const history = msgs.slice(1).map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setChatBusy(true);
    try {
      const data = await callAi({ task: "chat", question: q, history, symbol, prices: priceSnapshot() });
      const reply = data.text ?? "…";
      setMsgs((m) => [...m, { role: "aria", text: reply }]);
      if (voiceOutRef.current) void speak(reply);
    } catch (e) {
      setMsgs((m) => [...m, { role: "aria", text: `⚠ ${e instanceof Error ? e.message : "AI core error"}` }]);
    } finally {
      setChatBusy(false);
    }
  };
  const sendChatRef = useRef(sendChat);
  sendChatRef.current = sendChat;

  const genIdeas = async () => {
    if (ideasBusy) return;
    setIdeasBusy(true);
    setIdeasErr(null);
    try {
      const data = await callAi({ task: "ideas", symbol, prices: priceSnapshot() });
      const clean = (data.ideas ?? []).filter((i) => i && quotes[i.symbol] && i.qty > 0).slice(0, 4);
      setIdeas(clean);
      setExecuted(new Set());
    } catch (e) {
      setIdeasErr(e instanceof Error ? e.message : "AI core error");
    } finally {
      setIdeasBusy(false);
    }
  };

  const genNews = async () => {
    if (newsBusy) return;
    setNewsBusy(true);
    setNewsErr(null);
    try {
      const data = await callAi({ task: "news", symbol, prices: priceSnapshot() });
      setNews((data.news ?? []).slice(0, 6));
    } catch (e) {
      setNewsErr(e instanceof Error ? e.message : "AI core error");
    } finally {
      setNewsBusy(false);
    }
  };

  const genReport = async (sym: string) => {
    if (reportBusy || report[sym]) return;
    setReportBusy(true);
    setReportErr(null);
    try {
      const data = await callAi({ task: "report", symbol: sym, prices: priceSnapshot() });
      setReport((r) => ({ ...r, [sym]: data.text ?? "" }));
    } catch (e) {
      setReportErr(e instanceof Error ? e.message : "AI core error");
    } finally {
      setReportBusy(false);
    }
  };

  const executeIdea = (idea: Idea) => {
    const px = Number.isFinite(idea.entry) && idea.entry > 0 ? idea.entry : quotes[idea.symbol].price;
    onExecute({
      symbol: idea.symbol,
      side: idea.side === "SELL" ? "SELL" : "BUY",
      qty: Math.max(1, Math.round(idea.qty)),
      price: Math.round(px * 100) / 100,
      type: "LIMIT",
      product: idea.product === "CNC" ? "CNC" : idea.product === "MTF" ? "MTF" : "MIS",
    });
    setExecuted((s) => new Set(s).add(idea.symbol));
  };

  const riskReward = (i: Idea) => {
    const rr = i.stop && i.target && i.entry ? Math.abs(i.target - i.entry) / Math.abs(i.entry - i.stop) : 0;
    return Number.isFinite(rr) && rr > 0 ? rr.toFixed(1) : "—";
  };

  return (
    <>
      {/* floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-12 left-5 z-40 flex items-center gap-2 rounded-full border border-fuchsia-400/50 bg-gradient-to-b from-fuchsia-500 to-purple-700 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_24px_rgba(192,38,211,0.35)] transition hover:brightness-110 active:scale-95"
        aria-label="Open ARIA CORE — full AI"
      >
        {open ? <X className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
        {open ? "Close CORE" : "AI CORE"}
        {!open && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>}
      </button>

      <div
        className={`fixed bottom-36 left-5 z-40 flex h-105 w-[min(430px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-fuchsia-500/25 bg-[#0d1016]/95 shadow-2xl backdrop-blur-xl ${
          open ? "" : "hidden"
        }`}
      >
          {/* head */}
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <div className="tx-shimmer flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-fuchsia-300" />
              <div className="leading-none">
                <div className="text-[13px] font-bold">ARIA CORE · Full AI</div>
                <div className="mt-0.5 flex items-center gap-1 text-[9.5px] text-white/45">
                  <span className="tx-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LLM reasoning · live feed aware · paper execution
                </div>
              </div>
            </div>
            <span className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-fuchsia-300">NEURAL</span>
          </div>

          {/* tabs */}
          <div className="flex gap-1 border-b border-white/8 px-3 py-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  if (t.key === "ideas" && !ideas && !ideasBusy) void genIdeas();
                  if (t.key === "news" && !news && !newsBusy) void genNews();
                  if (t.key === "report" && !report[symbol] && !reportBusy) void genReport(symbol);
                }}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10.5px] font-semibold transition ${
                  tab === t.key ? "bg-fuchsia-500/15 text-fuchsia-200" : "text-white/45 hover:bg-white/5 hover:text-white/75"
                }`}
              >
                <t.icon className="h-3 w-3" /> {t.label}
              </button>
            ))}
          </div>

          {/* CHAT */}
          {tab === "chat" && (
            <>
              <div ref={chatRef} className="tx-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-sm bg-fuchsia-500/20 text-fuchsia-100"
                          : "rounded-bl-sm border border-white/10 bg-white/6 text-white/80"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/6 px-3.5 py-2.5 text-[11px] text-white/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-fuchsia-300" /> ARIA CORE is reasoning over the live tape…
                  </div>
                )}
                {speaking && (
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-fuchsia-500/25 bg-fuchsia-500/10 px-3.5 py-2.5 text-[11px] text-fuchsia-200">
                    <Volume2 className="h-3.5 w-3.5 animate-pulse" /> ARIA is speaking…
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-3.5 pb-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">Voice mode</span>
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={voiceOut ? "Disable voice replies" : "Enable voice replies"}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                    voiceOut
                      ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200"
                      : "border-white/12 bg-white/5 text-white/50 hover:text-white/80"
                  }`}
                >
                  {voiceOut ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  {voiceOut ? "AI speaks replies" : "Voice off"}
                </button>
              </div>
              <div className="tx-scroll flex gap-1.5 overflow-x-auto px-3.5 pb-2">
                {CHAT_ICEBREAKERS.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendChat(q)}
                    disabled={chatBusy}
                    className="shrink-0 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10.5px] text-white/60 transition hover:border-fuchsia-500/40 hover:text-fuchsia-200 disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendChat(input);
                }}
                className="flex items-center gap-2 border-t border-white/8 p-3"
              >
                {micSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={chatBusy || micState !== "idle"}
                    aria-label="Dictate your question"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                      micState === "listening"
                        ? "animate-pulse border-rose-500/50 bg-rose-500/20 text-rose-300"
                        : micState === "processing"
                          ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200"
                          : "border-white/12 bg-white/5 text-white/55 hover:border-fuchsia-500/40 hover:text-fuchsia-200"
                    } disabled:opacity-40`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={micState === "listening" ? "Listening… speak now" : "Ask the full-AI brain anything…"}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-white/12 bg-white/5 px-3 text-[12.5px] text-white/85 outline-none transition placeholder:text-white/30 focus:border-fuchsia-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatBusy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500 text-white transition hover:brightness-110 disabled:opacity-40"
                  aria-label="Send to ARIA CORE"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

          {/* IDEAS */}
          {tab === "ideas" && (
            <div className="tx-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">LLM-generated paper setups</span>
                <button
                  onClick={() => void genIdeas()}
                  disabled={ideasBusy}
                  className="flex items-center gap-1.5 rounded-md bg-fuchsia-500/20 px-2.5 py-1.5 text-[11px] font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/30 disabled:opacity-50"
                >
                  {ideasBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                  {ideas ? "Re-scan" : "Scan Market"}
                </button>
              </div>
              {ideasBusy && <Skeleton lines={7} />}
              {ideasErr && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[11.5px] text-rose-200">{ideasErr}</div>}
              {!ideasBusy && ideas && ideas.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-[11.5px] text-white/50">No actionable setups this scan. Try Re-scan in a few ticks.</div>
              )}
              <div className="space-y-2.5">
                {!ideasBusy &&
                  ideas?.map((i) => (
                    <div key={i.symbol + i.side} className="rounded-xl border border-white/10 bg-white/4 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelect(i.symbol);
                            }}
                            className="font-mono text-[13px] font-bold text-white hover:text-fuchsia-200"
                          >
                            {i.symbol}
                          </button>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${
                              i.side === "BUY" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {i.side} · {i.product}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-white/50">
                          <Gauge className="h-3 w-3 text-fuchsia-300" /> {Math.round(Math.min(100, Math.max(0, i.confidence)))}%
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1.5 font-mono text-[10.5px]">
                        <div><span className="text-white/40">Qty</span><div className="text-white/85">{Math.round(i.qty)}</div></div>
                        <div><span className="text-white/40">Entry</span><div className="text-amber-300">₹{i.entry?.toFixed(1) ?? "—"}</div></div>
                        <div><span className="text-white/40">Target</span><div className="text-emerald-300">₹{i.target?.toFixed(1) ?? "—"}</div></div>
                        <div><span className="text-white/40">Stop</span><div className="text-rose-300">₹{i.stop?.toFixed(1) ?? "—"}</div></div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400" style={{ width: `${Math.min(100, Math.max(0, i.confidence))}%` }} />
                        </div>
                        <span className="font-mono text-[9.5px] text-white/40">R:R {riskReward(i)}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-white/55">{i.thesis}</p>
                      <button
                        onClick={() => executeIdea(i)}
                        disabled={executed.has(i.symbol)}
                        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 py-2 text-[11.5px] font-bold text-amber-300 transition hover:bg-amber-500/25 disabled:border-white/10 disabled:bg-white/5 disabled:text-white/40"
                      >
                        <Activity className="h-3.5 w-3.5" />
                        {executed.has(i.symbol) ? "Sent to Order Engine ✓" : `Execute ${i.side} on Paper`}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* NEWS */}
          {tab === "news" && (
            <div className="tx-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">AI newswire · simulated session</span>
                <button
                  onClick={() => void genNews()}
                  disabled={newsBusy}
                  className="flex items-center gap-1.5 rounded-md bg-fuchsia-500/20 px-2.5 py-1.5 text-[11px] font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/30 disabled:opacity-50"
                >
                  {newsBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Newspaper className="h-3 w-3" />}
                  Refresh
                </button>
              </div>
              {newsBusy && <Skeleton lines={8} />}
              {newsErr && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[11.5px] text-rose-200">{newsErr}</div>}
              <div className="space-y-2">
                {!newsBusy &&
                  news?.map((n, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/4 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] font-semibold leading-snug text-white/85">{n.headline}</p>
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold ${SENT_STYLE[n.sentiment] ?? SENT_STYLE.NEUTRAL}`}>{n.sentiment}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{n.summary}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {n.symbol && quotes[n.symbol] ? (
                          <button onClick={() => onSelect(n.symbol as string)} className="font-mono text-[10px] font-bold text-amber-300 hover:underline">
                            {n.symbol} →
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-white/35">MARKET-WIDE</span>
                        )}
                        <span className="flex items-center gap-1" aria-label={`Impact ${n.impact} of 5`}>
                          {[1, 2, 3, 4, 5].map((d) => (
                            <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= (n.impact ?? 0) ? "bg-amber-400" : "bg-white/12"}`} />
                          ))}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* REPORT */}
          {tab === "report" && (
            <div className="tx-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                  Deep note · <span className="font-mono text-amber-300">{symbol}</span>
                </span>
                <button
                  onClick={() => void genReport(symbol)}
                  disabled={reportBusy}
                  className="flex items-center gap-1.5 rounded-md bg-fuchsia-500/20 px-2.5 py-1.5 text-[11px] font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/30 disabled:opacity-50"
                >
                  {reportBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  {report[symbol] ? "Regenerate" : "Generate"}
                </button>
              </div>
              {reportBusy && !report[symbol] && <Skeleton lines={9} />}
              {reportErr && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-[11.5px] text-rose-200">{reportErr}</div>}
              {report[symbol] && (
                <div className="whitespace-pre-line rounded-xl border border-white/10 bg-white/4 p-3.5 text-[12px] leading-relaxed text-white/75">
                  {report[symbol]}
                </div>
              )}
              {!reportBusy && !report[symbol] && !reportErr && (
                <div className="rounded-xl border border-dashed border-white/12 p-4 text-center text-[11.5px] text-white/45">
                  Switch any stock in the watchlist, then hit Generate — the LLM writes a full analyst note from live RSI, MA, MACD and price data.
                </div>
              )}
            </div>
          )}

          {/* AUTOPILOT — kept mounted so it keeps hunting even on other tabs */}
          <div className={tab === "autopilot" ? "tx-scroll min-h-0 flex-1 overflow-y-auto" : "hidden"}>
            <Autopilot quotes={quotes} positions={positions} onExecute={onExecute} />
          </div>
        </div>
    </>
  );
}
