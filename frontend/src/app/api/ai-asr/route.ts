import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { audio?: string };
    const base64 = (body.audio ?? "").replace(/^data:[^;]+;base64,/, "");
    if (!base64) return NextResponse.json({ error: "Missing audio" }, { status: 400 });
    if (base64.length > 20_000_000) return NextResponse.json({ error: "Audio too large" }, { status: 413 });

    const zai = await ZAI.create();
    const response = await zai.audio.asr.create({ file_base64: base64 });
    const text = (response as { text?: string }).text ?? "";
    if (!text.trim()) return NextResponse.json({ error: "No speech detected" }, { status: 422 });
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ASR unavailable";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
