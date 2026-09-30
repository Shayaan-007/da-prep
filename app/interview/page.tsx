"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CameraPreview from "@/components/CameraPreview";
import LevelMeter from "@/components/LevelMeter";
import Progress from "@/components/Progress";
import ScoreRing from "@/components/ScoreRing";
import { speak, stopSpeaking, useDictation } from "@/components/speech";
import { SILENCE_PEAK, useRecorder } from "@/components/useRecorder";
import { postJson, transcribeBlob } from "@/lib/api";
import { MAX_QUESTIONS, STAGES, type ScoreResult, type Stage, type Turn } from "@/lib/interview";
import { useSector } from "@/lib/prefs";
import { SECTOR_BY_ID, SECTORS } from "@/lib/sectors";
import { useCollection } from "@/lib/store";
import type { SessionRecord } from "@/lib/types";

type Phase = "setup" | "asking" | "scoring" | "done";
type Mode = "text" | "video";
// Video-style answer flow: idle -> starting mic -> recording (or typing if no mic) -> transcribing -> review.
type VState = "idle" | "starting" | "recording" | "typing" | "transcribing" | "review";

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

  const answerRef = useRef("");
  const finishRef = useRef<() => void>(() => {});
  const dictation = useDictation((t) => setAnswer((a) => (a ? `${a} ${t}` : t)));
  const recorder = useRecorder();
  const micTest = useRecorder();

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
    stopSpeaking(); // don't let the read-aloud question bleed into the recording
    setVstate("starting");
    const ok = await recorder.start();
    setLeft(VIDEO_SECONDS);
    setRunning(true);
    // No microphone? Keep the clock running and let them type the answer instead.
    setVstate(ok ? "recording" : "typing");
  }

  /** End the video-style answer: stop recording, transcribe, and let the candidate check the text. */
  async function finishVideoAnswer() {
    setRunning(false);
    if (vstate === "typing") {
      await submitAnswer();
      return;
    }
    if (vstate !== "recording") return;
    setVstate("transcribing");
    const { blob, peak } = await recorder.stop();
    let text = "";
    if (blob && blob.size > 0) {
      try {
        text = await transcribeBlob(blob);
      } catch (e) {
        setError(`${(e as Error).message} You can type your answer below instead.`);
      }
    }
    setAnswer(text);
    // "Heard" means we got words back. The meter only decides how to word the message, since it can't run
    // while the tab is in the background.
    setSilent(!text.trim());
    setQuiet(peak < SILENCE_PEAK);
    setVstate("review");
  }

  useEffect(() => {
    finishRef.current = () => void finishVideoAnswer();
  });

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
            <div className="space-y-3 rounded-lg border border-line p-4">
              <p className="label">Microphone check</p>
              <p className="text-sm text-muted">
                Video style records your voice while you answer, then transcribes it so it can be marked. Test your
                microphone first so you know it is being heard. Your recording is sent to OpenAI to be transcribed and
                is not stored by this site.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => (micTest.state === "recording" ? void micTest.stop() : void micTest.start())}
                >
                  {micTest.state === "recording" ? "Stop test" : "Test microphone"}
                </button>
                <LevelMeter level={micTest.level} active={micTest.state === "recording"} />
              </div>
              {micTest.state === "recording" && (
                <p className="text-sm text-muted">Say a sentence. The bars should move as you speak.</p>
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
  const timing = vstate === "recording" || vstate === "typing";
  const isLast = history.length + 1 >= MAX_QUESTIONS;
  const continueLabel = busy
    ? "Thinking..."
    : answer.trim()
      ? isLast
        ? "Finish and get feedback"
        : "Continue"
      : "Continue without an answer";

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
            <div className="card space-y-3 p-5">
              <p className="text-sm text-muted">
                You get one attempt and {VIDEO_SECONDS} seconds, like a recorded video interview. Read the question,
                then press start and speak your answer. Your microphone records while the clock runs, and afterwards
                you can check the transcript before it is marked.
              </p>
              {recorder.error && (
                <p role="alert" className="callout bg-coral-50 text-coral-600">
                  {recorder.error}
                </p>
              )}
              {errorBox}
              <button onClick={() => void beginTimed()} className="btn btn-primary">
                Start answering
              </button>
            </div>
          )}

          {vstate === "starting" && <p className="card p-5 text-sm text-muted">Starting your microphone…</p>}

          {vstate === "recording" && (
            <div className="card space-y-4 p-5" aria-live="polite">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-coral-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-coral-600" aria-hidden />
                  Listening. Speak your answer now.
                </span>
                <LevelMeter level={recorder.level} active />
              </div>
              {!heard && left <= VIDEO_SECONDS - 5 && (
                <p role="alert" className="callout bg-sun-50 text-sun-600">
                  We can&apos;t hear you yet. Check your microphone is on and not muted, and speak a little louder.
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

          {(vstate === "review" || vstate === "typing") && (
            <div className="space-y-3">
              {vstate === "review" &&
                (silent ? (
                  <p role="alert" className="callout bg-sun-50 text-sun-600">
                    {quiet
                      ? "We couldn't hear anything. Check your microphone is on, not muted, and the right one is selected, then type your answer below, or continue without one."
                      : "We couldn't make out what you said. You can type your answer below, or continue without one."}
                  </p>
                ) : (
                  <p className="callout bg-brand-50">
                    Here&apos;s what we heard. Fix any words that were transcribed wrongly, then continue.
                  </p>
                ))}
              {vstate === "typing" && (
                <p role="alert" className="callout bg-sun-50 text-sun-600">
                  {recorder.error || "We couldn't use your microphone."} You can type your answer instead. The clock is
                  still running.
                </p>
              )}
              <textarea
                className="input h-44"
                aria-label="Your answer"
                placeholder="Type your answer here."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={4000}
              />
              {errorBox}
              {vstate === "review" ? (
                <button onClick={submitAnswer} disabled={busy} className="btn btn-primary">
                  {continueLabel}
                </button>
              ) : (
                <button onClick={() => void finishVideoAnswer()} className="btn btn-primary">
                  Finish answer
                </button>
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
