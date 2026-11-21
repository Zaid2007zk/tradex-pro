# TradeX PRO — Quantum Trading Terminal

NSE/BSE-style dark trading terminal with a full AI layer. Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + Bun.

## Quick start

```bash
bun install
bun run dev
# open http://localhost:3000
```

(Or with npm: `npm install && npm run dev`)

## What's inside

- **Terminal**: live candlestick chart (1D/1W/1M/3M), heatmap, watchlist (20 NSE stocks), market depth, order ticket (MIS 5x / CNC / MTF 4x), positions & orders with live P&L
- **Workspaces**: Options Chain, Multi-Chart, Algo Studio, Strategy Backtest, Journal, Academy
- **AI Copilot** (rules-based, bottom-right): instant technical signals
- **AI CORE** (bottom-left, LLM-powered): real-LLM chat over the live tape, Alpha Ideas (one-click paper execution), AI NewsWire, Deep Reports, voice (TTS)
- **AI Autopilot** (workspace tab): LLM auto-scans every 75s and deploys paper trades by itself — with kill switch, confidence threshold, max-open-positions guardrails and an auto-deployment log
- Paper trading account: ₹10,00,000 simulated funds

## Important notes

1. **Market data is a deterministic simulation** (seeded PRNG engine in `src/lib/market/engine.ts`). It is NOT real exchange data. Everything is clearly labeled "Fully simulated · Paper trading".
2. **AI features** (`/api/ai-core`, `/api/ai-tts`) use the `z-ai-web-dev-sdk` (server-side). In a hosting environment where this SDK is unavailable, the AI panels will show a graceful error — the rest of the terminal runs fully offline. To swap in another LLM provider, edit `src/app/api/ai-core/route.ts` (the prompt + market-context builder is all there).
3. No database required — all state (orders/positions) is client-side in memory.

## Structure

```
src/
  app/api/ai-core/route.ts    # LLM brain: chat / ideas / news / report tasks
  app/api/ai-tts/route.ts     # text-to-speech for AI CORE voice
  lib/market/engine.ts        # price simulation + indicators (RSI/MACD/SMA/EMA)
  hooks/use-market.ts         # live tick feed (1.4s)
  components/terminal/        # all UI panels (23 components)
```
