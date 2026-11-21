import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    let text = (body.text ?? "").replace(/\s+/g, " ").trim();
    if (!text) return NextResponse.json({ error: "Empty text" }, { status: 400 });
    // API constraint: max 1024 chars per request
    if (text.length > 980) text = text.slice(0, 980);

    const zai = await ZAI.create();
    const response = await zai.audio.tts.create({
      input: text,
      voice: "jam",
      speed: 1.0,
      response_format: "wav",
      stream: false,
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    return new NextResponse(buffer, {
      status: 200,
      headers: { "Content-Type": "audio/wav", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "TTS unavailable";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
