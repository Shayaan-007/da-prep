"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CameraPreview from "@/components/CameraPreview";
import LevelMeter from "@/components/LevelMeter";
import Progress from "@/components/Progress";
import ScoreRing from "@/components/ScoreRing";
import { speak, stopSpeaking, useDictation } from "@/components/speech";
import MicPicker from "@/components/MicPicker";
import { micSupportProblem, SILENCE_PEAK, useRecorder } from "@/components/useRecorder";
import { postJson, transcribeBlob } from "@/lib/api";
import { MAX_QUESTIONS, STAGES, type ScoreResult, type Stage, type Turn } from "@/lib/interview";
import { useSector } from "@/lib/prefs";
import { SECTOR_BY_ID, SECTORS } from "@/lib/sectors";
import { useCollection } from "@/lib/store";
import type { SessionRecord } from "@/lib/types";

type Phase = "setup" | "asking" | "scoring" | "done";
type Mode = "text" | "video";
// Video-style answers are spoken only (no typing): idle -> starting -> recording -> transcribing -> review.
// "problem" = the microphone couldn't be used at all; "failed" = recorded fine but transcription failed (retryable).
type VState = "idle" | "starting" | "recording" | "transcribing" | "review" | "problem" | "failed";

const VIDEO_SECONDS = 60;

export default function InterviewPage() {
  const sessions = useCollection<SessionRecord>("sessions");
  const { sector, setSector } = useSector();
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("text");
  const [readAloud, setReadAloud] = useState(false);
  const [dictate, setDictate] = useState(false);
  const [jobAd, setJobAd] = useState("");
  const [cv, setCv] = useState("");
  const [stage, setStage] = useState<Stage>("motivation");
  const [history, setHistory] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(VIDEO_SECONDS);
  const [vstate, setVstate] = useState<VState>("idle");
  const [heard, setHeard] = useState(false);
  const [silent, setSilent] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [micId, setMicId] = useState("");
  const [micRefresh, setMicRefresh] = useState(0);
  const [voiceReady, setVoiceReady] = useState<boolean | null>(null);
  const [supportProblem, setSupportProblem] = useState<string | null>(null);
  const [captionFinal, setCaptionFinal] = useState("");
  const [captionInterim, setCaptionInterim] = useState("");

  const answerRef = useRef("");
  const blobRef = useRef<Blob | null>(null);
  const finishRef = useRef<() => void>(() => {});
  const dictation = useDictation((t) => setAnswer((a) => (a ? `${a} ${t}` : t)));
  // Live on-screen captions while speaking (browser speech recognition). Cosmetic: the marked transcript comes from
  // the recording. Skipped on phones and when a specific microphone is chosen, since it can only use the default.
  const captions = useDictation(
    (t) => setCaptionFinal((c) => (c ? `${c} ${t}` : t)),
    (t) => setCaptionInterim(t),
  );
  const recorder = useRecorder();
  const micTest = useRecorder();

  // Video style needs a secure page (https or localhost) and a server that can transcribe. Check both up front.
  useEffect(() => {
    if (mode !== "video") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupportProblem(micSupportProblem());
    fetch("/api/transcribe")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setVoiceReady(Boolean(d.configured)))
      .catch(() => setVoiceReady(null));
  }, [mode]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Read each new question aloud when enabled.
  useEffect(() => {
    if (phase === "asking" && readAloud && question) speak(question);
    return () => stopSpeaking();
  }, [phase, readAloud, question]);

  // Video-style countdown.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (running && left <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRunning(false);
      finishRef.current();
    }
  }, [running, left]);

  // Note once the microphone has picked up real sound, so we can warn if it never does.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (vstate === "recording" && recorder.level > 0.06) setHeard(true);
  }, [vstate, recorder.level]);

  async function fetchQuestion(h: Turn[]) {
    const { question } = await postJson<{ question: string }>("/api/interview/next", {
      jobAd,
      cv: cv || undefined,
      stage,
      sector: sector ?? undefined,
      history: h,
    });
    return question;
  }

  function resetTimer() {
    setRunning(false);
    setLeft(VIDEO_SECONDS);
    setVstate("idle");
    setHeard(false);
    setSilent(false);
    setQuiet(false);
    setCaptionFinal("");
    setCaptionInterim("");
    blobRef.current = null;
  }

  async function start() {
    void micTest.stop();
    setBusy(true);
    setError("");
    try {
      const q = await fetchQuestion([]);
      setHistory([]);
      setQuestion(q);
      setAnswer("");
      resetTimer();
      setPhase("asking");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (busy) return;
    dictation.stop();
    setRunning(false);
    const h = [...history, { question, answer: answerRef.current.trim() || "(no answer given)" }];
    setBusy(true);
    setError("");
    try {
      if (h.length >= MAX_QUESTIONS) {
        setPhase("scoring");
        const r = await postJson<ScoreResult>("/api/interview/score", { jobAd, stage, turns: h });
        setResult(r);
        setHistory(h);
        sessions.update((prev) => [
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            stage,
            mode,
            overall: Math.round(r.overall),
            summary: r.summary,
            jobSnippet: jobAd.trim().slice(0, 80),
            turns: h.map((t, i) => ({
              ...t,
              score: r.turns[i].score,
              feedback: r.turns[i].feedback,
              betterAnswer: r.turns[i].betterAnswer,
              star: r.turns[i].star,
            })),
            strengths: r.strengths,
            improvements: r.improvements,
          },
          ...prev,
        ]);
        setPhase("done");
      } else {
        const q = await fetchQuestion(h);
        setHistory(h);
        setQuestion(q);
        setAnswer("");
        resetTimer();
      }
    } catch (e) {
      setError((e as Error).message);
      setPhase("asking");
    } finally {
      setBusy(false);
    }
  }

  async function beginTimed() {
    setError("");
    setHeard(false);
    setSilent(false);
    setQuiet(false);
    setAnswer("");
    setCaptionFinal("");
    setCaptionInterim("");
    blobRef.current = null;
    stopSpeaking(); // don't let the read-aloud question bleed into the recording
    setVstate("starting");
    const ok = await recorder.start(micId || undefined);
    if (!ok) {
      // Voice-only: if the microphone can't start, say why and how to fix it. There is no typing route.
      setVstate("problem");
      return;
    }
    setMicRefresh((n) => n + 1); // device names are available now that permission is granted
    setLeft(VIDEO_SECONDS);
    setRunning(true);
    setVstate("recording");
    const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (captions.supported && !micId && !phone) captions.start();
  }

  /** Send a finished recording for transcription. A failure keeps the recording so it can be retried. */
  async function transcribeRecording() {
    const blob = blobRef.current;
    setError("");
    if (!blob || blob.size === 0) {
      setAnswer("");
      setSilent(true);
      setVstate("review");
      return;
    }
    setVstate("transcribing");
    try {
      const text = await transcribeBlob(blob);
      setAnswer(text);
      // "Heard" means we got words back. The meter only words the message, since it can't run in a background tab.
      setSilent(!text.trim());
      setVstate("review");
    } catch (e) {
      setError((e as Error).message);
      setVstate("failed");
    }
  }

  /** End the video-style answer: stop recording, then transcribe it. */
  async function finishVideoAnswer() {
    if (vstate !== "recording") return;
    setRunning(false);
    captions.stop();
    setVstate("transcribing");
    const { blob, peak } = await recorder.stop();
    blobRef.current = blob;
    setQuiet(peak < SILENCE_PEAK);
    await transcribeRecording();
  }

  useEffect(() => {
    finishRef.current = () => void finishVideoAnswer();
  });

  /** Nothing usable was heard, so let them have another go at the same question. */
  function recordAgain() {
    setError("");
    setAnswer("");
    resetTimer();
  }

  function switchToText() {
    setError("");
    setAnswer("");
    resetTimer();
    setMode("text");
  }

  function reset() {
    setPhase("setup");
    setHistory([]);
    setResult(null);
    setQuestion("");
    setAnswer("");
    resetTimer();
    void recorder.stop();
  }

  const errorBox = error && (
    <div role="alert" className="space-y-1 callout bg-coral-50 text-coral-600">
      <p>{error}</p>
      {/free interviews/.test(error) && (
        <Link href="/pricing" className="underline">
          See Pro
        </Link>
      )}
      {/Sign in/.test(error) && (
        <Link href="/login" className="underline">
          Sign in
        </Link>
      )}
    </div>
  );

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="page-title">Mock interview</h1>
          <p className="lead">Paste a real advert and get questions built around that role.</p>
        </div>
        <div className="card space-y-5 p-6">
          <div className="space-y-2">
            <p className="label">
              Sector <span className="font-normal text-muted">(shapes the questions)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sector === s.id}
                  onClick={() => setSector(sector === s.id ? null : s.id)}
                  className={`chip ${sector === s.id ? "chip-active" : ""}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {sector && (
              <button
                type="button"
                onClick={() => setJobAd(SECTOR_BY_ID[sector].sampleAd)}
                className="text-sm font-semibold text-brand-600 underline"
              >
                No advert handy? Use a sample {SECTOR_BY_ID[sector].name.toLowerCase()} advert
              </button>
            )}
          </div>
          <label className="label">
            Job advert
            <textarea
              className="input mt-1.5 h-40 font-normal"
              placeholder="Paste the degree apprenticeship job advert here"
              value={jobAd}
              onChange={(e) => setJobAd(e.target.value)}
              maxLength={6000}
            />
          </label>
          <label className="label">
            CV or personal statement <span className="font-normal text-muted">(optional)</span>
            <textarea
              className="input mt-1.5 h-28 font-normal"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              maxLength={6000}
            />
          </label>
          <p className="text-xs text-muted">
            Don&apos;t include your address, phone number or other personal details. Text is sent to an AI service to
            generate questions and feedback.
          </p>

          <div className="space-y-2">
            <p className="label">Interview type</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  aria-pressed={stage === s}
                  className={`chip ${stage === s ? "chip-active" : ""}`}
                >
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="label">Format</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["text", "Text", "Take your time and edit as you go."],
                  ["video", "Video style", `Speak your answer: ${VIDEO_SECONDS} seconds, one attempt, like the real thing.`],
                ] as const
              ).map(([m, title, blurb]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    mode === m
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-line bg-white hover:border-brand-100"
                  }`}
                >
                  <span className="font-bold">{title}</span>
                  <span className="block text-sm text-muted">{blurb}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === "video" && (
            <div className="space-y-4 rounded-lg border border-line p-4">
              <p className="label">Microphone check</p>
              <p className="text-sm text-muted">
                Video style is spoken only, like a real recorded interview. Your voice is recorded while you answer and
                transcribed so it can be marked. Your recording is sent to OpenAI to be transcribed and is not stored by
                this site.
              </p>
              {supportProblem && (
                <p role="alert" className="callout bg-coral-50 text-coral-600">
                  {supportProblem}
                </p>
              )}
              {voiceReady === false && (
                <p role="alert" className="callout bg-coral-50 text-coral-600">
                  Voice transcription isn&apos;t set up on this server (no OpenAI key found), so video style can&apos;t mark
                  spoken answers yet.
                </p>
              )}
              <MicPicker value={micId} onChange={setMicId} refreshKey={micRefresh} />
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    if (micTest.state === "recording") {
                      void micTest.stop();
                    } else if (await micTest.start(micId || undefined)) {
                      setMicRefresh((n) => n + 1);
                    }
                  }}
                >
                  {micTest.state === "recording" ? "Stop test" : "Test microphone"}
                </button>
                <LevelMeter level={micTest.level} active={micTest.state === "recording"} />
              </div>
              {micTest.state === "recording" && (
                <div className="space-y-1 text-sm text-muted">
                  {micTest.deviceLabel && (
                    <p>
                      Using: <strong className="text-ink">{micTest.deviceLabel}</strong>
                    </p>
                  )}
                  <p>Say a sentence. The bars should move as you speak. If they don&apos;t, pick a different microphone above.</p>
                </div>
              )}
              {micTest.error && (
                <p role="alert" className="text-sm text-coral-600">
                  {micTest.error}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-brand-600" checked={readAloud} onChange={(e) => setReadAloud(e.target.checked)} />
              Read questions aloud
            </label>
            {mode === "text" && (
              <>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-brand-600" checked={dictate} onChange={(e) => setDictate(e.target.checked)} />
                  Dictate answers with my microphone{" "}
                  {!dictation.supported && <span className="text-muted">(not supported in this browser)</span>}
                </label>
                {dictate && (
                  <p className="text-xs text-muted">
                    Dictation uses your browser&apos;s speech service, which may send audio to its provider.
                  </p>
                )}
              </>
            )}
          </div>
          {errorBox}
          <button
            onClick={start}
            disabled={busy || jobAd.trim().length < 20}
            className="btn btn-primary !px-6 !py-3"
          >
            {busy ? "Preparing your first question..." : "Start interview"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "scoring") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
        <p className="text-lg font-bold">Marking your interview</p>
        <p className="text-sm text-muted">Checking each answer for structure, evidence and fit. This takes a few seconds.</p>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="card flex flex-col items-center gap-6 p-6 sm:flex-row">
          <ScoreRing value={Math.round(result.overall)} size={140} label="out of 100" />
          <div className="space-y-2">
            <h1 className="page-title">Your result</h1>
            <p className="text-ink/80">{result.summary}</p>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="card animate-fade-up space-y-2 p-5">
            <h2 className="font-bold text-mint-600">What worked</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
          <section className="card animate-fade-up space-y-2 p-5">
            <h2 className="font-bold text-sun-600">To improve</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        </div>
        {history.map((t, i) => {
          const r = result.turns[i];
          return (
            <section
              key={i}
              className="card animate-fade-up space-y-3 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold">
                  <span className="text-brand-600">Q{i + 1}.</span> {t.question}
                </h3>
                <span className="shrink-0 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  {r.score}/10
                </span>
              </div>
              <p className="text-sm text-muted">
                <strong className="text-ink">You said:</strong> {t.answer}
              </p>
              <p className="text-sm">{r.feedback}</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {(["situation", "task", "action", "result"] as const).map((k) => (
                  <span
                    key={k}
                    className={`rounded-md px-2.5 py-1 capitalize ${
                      r.star[k] ? "bg-mint-50 text-mint-600" : "bg-coral-50 text-coral-600"
                    }`}
                  >
                    {r.star[k] ? "✓" : "✗"} {k}
                  </span>
                ))}
              </div>
              <p className="callout bg-brand-50">
                <strong>Stronger answer:</strong> {r.betterAnswer}
              </p>
            </section>
          );
        })}
        <div className="flex gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/progress" className="btn btn-secondary">
            See progress
          </Link>
        </div>
      </div>
    );
  }

  const video = mode === "video";
  const timing = vstate === "recording";
  const isLast = history.length + 1 >= MAX_QUESTIONS;
  const continueLabel = busy ? "Thinking..." : isLast ? "Finish and get feedback" : "Continue";
  const liveCaption = `${captionFinal} ${captionInterim}`.trim();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-muted">
          <p>
            Question {history.length + 1} of {MAX_QUESTIONS}
          </p>
          {video && timing && (
            <p
              className={`rounded-md px-3 py-1 text-base font-semibold tabular-nums ${
                left <= 10 ? "animate-pulse bg-coral-50 text-coral-600" : "bg-brand-50 text-brand-700"
              }`}
              aria-live="off"
            >
              0:{String(Math.max(left, 0)).padStart(2, "0")}
            </p>
          )}
        </div>
        <Progress value={history.length} max={MAX_QUESTIONS} label="Interview progress" />
      </div>
      <div key={question} className="card animate-pop p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">Interviewer</p>
        <h1 className="text-xl font-bold leading-snug sm:text-2xl">{question}</h1>
      </div>
      {video && <CameraPreview />}
      {video ? (
        <>
          {vstate === "idle" && (
            <div className="card space-y-4 p-5">
              <p className="text-sm text-muted">
                You get {VIDEO_SECONDS} seconds to speak your answer, like a recorded video interview. Your microphone
                records while the clock runs, then your answer is transcribed and marked.
              </p>
              <MicPicker value={micId} onChange={setMicId} refreshKey={micRefresh} />
              {supportProblem && (
                <p role="alert" className="callout bg-coral-50 text-coral-600">
                  {supportProblem}
                </p>
              )}
              {errorBox}
              <button onClick={() => void beginTimed()} className="btn btn-primary">
                Start answering
              </button>
            </div>
          )}

          {vstate === "starting" && (
            <p className="card p-5 text-sm text-muted" aria-live="polite">
              Starting your microphone… if your browser asks, choose Allow.
            </p>
          )}

          {vstate === "problem" && (
            <div className="card space-y-4 p-5">
              <p role="alert" className="callout bg-coral-50 text-coral-600">
                {recorder.error || "We couldn't start your microphone."}
              </p>
              <MicPicker value={micId} onChange={setMicId} refreshKey={micRefresh} />
              <div className="flex flex-wrap gap-3">
                <button onClick={() => void beginTimed()} className="btn btn-primary">
                  Try again
                </button>
                <button onClick={switchToText} className="btn btn-secondary">
                  Switch to a text interview instead
                </button>
              </div>
            </div>
          )}

          {vstate === "recording" && (
            <div className="card space-y-4 p-5" aria-live="polite">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-coral-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-coral-600" aria-hidden />
                  Listening. Speak your answer now.
                </span>
                <LevelMeter level={recorder.level} active />
              </div>
              {recorder.deviceLabel && (
                <p className="text-xs text-muted">
                  Using: <strong className="text-ink">{recorder.deviceLabel}</strong>
                </p>
              )}
              {liveCaption && (
                <p className="rounded-md bg-soft p-3 text-sm leading-relaxed text-ink/80" aria-hidden>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Live captions (approximate)
                  </span>
                  {liveCaption}
                </p>
              )}
              {!heard && left <= VIDEO_SECONDS - 5 && (
                <p role="alert" className="callout bg-sun-50 text-sun-600">
                  We can&apos;t hear you yet. Check your microphone is on and not muted, speak a little louder, or pick a
                  different microphone after this answer.
                </p>
              )}
              <button onClick={() => void finishVideoAnswer()} className="btn btn-primary">
                Finish answer
              </button>
            </div>
          )}

          {vstate === "transcribing" && (
            <div className="card flex items-center gap-3 p-5 text-sm text-muted" aria-live="polite">
              <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" aria-hidden />
              Transcribing your answer…
            </div>
          )}

          {vstate === "failed" && (
            <div className="card space-y-4 p-5">
              <p role="alert" className="callout bg-coral-50 text-coral-600">
                {error || "We couldn't transcribe your answer."} Your recording is still here, so you can try again
                without re-recording.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => void transcribeRecording()} className="btn btn-primary">
                  Try transcribing again
                </button>
                <button onClick={recordAgain} className="btn btn-secondary">
                  Record again
                </button>
              </div>
            </div>
          )}

          {vstate === "review" && (
            <div className="card space-y-4 p-5">
              {silent ? (
                <>
                  <p role="alert" className="callout bg-sun-50 text-sun-600">
                    {quiet
                      ? "We couldn't hear anything. Check your microphone is on, not muted, and that the right one is selected, then record again."
                      : "We couldn't make out what you said. Try again, speaking clearly and a little closer to the microphone."}
                  </p>
                  <MicPicker value={micId} onChange={setMicId} refreshKey={micRefresh} />
                  <div className="flex flex-wrap gap-3">
                    <button onClick={recordAgain} className="btn btn-primary">
                      Record again
                    </button>
                    <button onClick={submitAnswer} disabled={busy} className="btn btn-secondary">
                      {busy ? "Thinking..." : "Skip this question"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="eyebrow">What we heard</p>
                    <p className="whitespace-pre-line text-[15px] leading-relaxed">{answer}</p>
                  </div>
                  {errorBox}
                  <div className="flex flex-wrap items-center gap-4">
                    <button onClick={submitAnswer} disabled={busy} className="btn btn-primary">
                      {continueLabel}
                    </button>
                    <button onClick={recordAgain} disabled={busy} className="text-sm font-semibold text-brand-700 underline">
                      That&apos;s not right, record again
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <textarea
            className="input h-44"
            aria-label="Your answer"
            placeholder="Answer here. Try to use STAR: Situation, Task, Action, Result."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={4000}
          />
          {dictation.supported && (
            <button
              type="button"
              onClick={dictation.listening ? dictation.stop : dictation.start}
              className="text-sm text-muted underline"
            >
              {dictation.listening ? "Stop dictating" : "Dictate with microphone"}
            </button>
          )}
          {errorBox}
          <div>
            <button
              onClick={submitAnswer}
              disabled={busy || (!video && answer.trim().length < 5)}
              className="btn btn-primary"
            >
              {busy ? "Thinking..." : isLast ? "Finish and get feedback" : video ? "Submit early" : "Next question"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
