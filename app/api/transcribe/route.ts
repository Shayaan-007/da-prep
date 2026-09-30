import { transcribeAudio } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

// A 60-second answer is well under 1 MB; this leaves room for slower codecs without inviting abuse.
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`transcribe:${ip}`, 15)) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("audio");
  if (!(file instanceof File)) {
    return Response.json({ error: "No audio received." }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "The recording was empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That recording is too long." }, { status: 413 });
  }
  // MediaRecorder labels audio-only recordings audio/*, but some browsers report video/webm or video/mp4.
  if (!/^(audio|video)\//.test(file.type)) {
    return Response.json({ error: "Unsupported file type." }, { status: 415 });
  }

  try {
    const text = (await transcribeAudio(file)).slice(0, 4000);
    return Response.json({ text });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not transcribe your answer." }, { status: 500 });
  }
}
