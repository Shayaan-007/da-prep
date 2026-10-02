"use client";

import { useEffect, useRef, useState } from "react";
import StimulusView from "@/components/assess/StimulusView";
import LevelMeter from "@/components/LevelMeter";
import { micSupportProblem, useRecorder } from "@/components/useRecorder";
import { transcribeBlob } from "@/lib/api";
import type { MockStage } from "@/lib/mockprocess/types";

type Qa = Extract<MockStage, { kind: "qa" }>;
export type Turn = { prompt: string; answer: string };

type Phase = "intro" | "prep" | "answer" | "transcribing" | "review";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function QaStage({ stage, onDone }: { stage: Qa; onDone: (turns: Turn[]) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [voice, setVoice] = useState(false);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [retakesLeft, setRetakesLeft] = useState(stage.retakes);
  const [error, setError] = useState("");
  const recorder = useRecorder();
  const handled = useRef(false);
  const micProblem = typeof window === "undefined" ? null : micSupportProblem();
  const prompt = stage.prompts[idx];
  const isVideo = stage.mode === "video";

  useEffect(() => {
    if (deadline === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [deadline]);

  function begin(withVoice: boolean) {
    setVoice(withVoice);
    startPrompt(0, withVoice);
  }

  function startPrompt(i: number, withVoice = voice) {
    setIdx(i);
    setAnswer("");
    setError("");
    setRetakesLeft(stage.retakes);
    handled.current = false;
    if (stage.prepSeconds > 0) {
      setPhase("prep");
      setDeadline(Date.now() + stage.prepSeconds * 1000);
    } else void startAnswer(withVoice);
  }

  async function startAnswer(withVoice = voice) {
    handled.current = false;
    setError("");
    if (withVoice) {
      const ok = await recorder.start(undefined);
      if (!ok) {
        setError("We couldn't use your microphone, so you can type this answer instead.");
        setVoice(false);
      }
    }
    setPhase("answer");
    setDeadline(Date.now() + stage.answerSeconds * 1000);
  }

  async function finishAnswer() {
    if (handled.current) return;
    handled.current = true;
    setDeadline(null);
    if (voice && recorder.state === "recording") {
      setPhase("transcribing");
      const { blob } = await recorder.stop();
      if (!blob || blob.size === 0) {
        setAnswer("");
        setError("We didn't hear anything. You can re-record or type your answer.");
        setPhase("review");
        return;
      }
      try {
        setAnswer(await transcribeBlob(blob));
      } catch (e) {
        setError((e as Error).message);
      }
      setPhase("review");
      return;
    }
    setPhase("review");
  }

  function accept() {
    const next = [...turns.slice(0, idx), { prompt: prompt.text, answer: answer.trim() }];
    setTurns(next);
    if (idx + 1 >= stage.prompts.length) onDone(next);
    else startPrompt(idx + 1);
  }

  // Phase deadlines.
  const remaining = deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
  useEffect(() => {
    if (remaining !== 0) return;
    // The clock running out is an external event, so reacting to it from an effect is the intended pattern here.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (phase === "prep") void startAnswer();
    else if (phase === "answer") void finishAnswer();
    /* eslint-enable react-hooks/set-state-in-effect */
    // startAnswer/finishAnswer depend on state read at call time; the effect only needs to fire on expiry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="page-title">{stage.name}</h1>
        <p>{stage.intro}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            {stage.prompts.length} {stage.mode === "exercise" ? (stage.prompts.length === 1 ? "task" : "tasks") : stage.prompts.length === 1 ? "question" : "questions"}
          </li>
          {stage.prepSeconds > 0 && <li>{mmss(stage.prepSeconds)} to prepare before each answer</li>}
          <li>Up to {mmss(stage.answerSeconds)} to answer</li>
          {isVideo && <li>{stage.retakes > 0 ? `${stage.retakes} re-record${stage.retakes > 1 ? "s" : ""} allowed` : "No re-records"}</li>}
        </ul>
        {stage.note && <p className="callout bg-brand-50 text-sm">{stage.note}</p>}
        <p className="text-sm text-muted">
          Do not use AI tools to write your answers. Real employers can end an application if you do, and you will learn
          nothing from the feedback.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => begin(false)}>
            Start (type my answers)
          </button>
          {!micProblem && (
            <button className="btn btn-secondary" onClick={() => begin(true)}>
              Start (speak my answers)
            </button>
          )}
        </div>
        {micProblem && <p className="text-xs text-muted">Speaking is unavailable: {micProblem}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-muted">
        <p>
          {stage.name}: {idx + 1} of {stage.prompts.length}
          {phase === "prep" ? " · preparing" : ""}
        </p>
        {remaining !== null && (
          <p role="timer" aria-label="Time left" className={`rounded-md px-3 py-1 text-base tabular-nums ${remaining <= 10 ? "bg-coral-50 text-coral-600" : "bg-brand-50 text-brand-700"}`}>
            {mmss(remaining)}
          </p>
        )}
      </div>
      <p className="sr-only" aria-live="assertive">
        {remaining !== null && [60, 30, 10].includes(remaining) ? `${remaining} seconds left` : ""}
      </p>

      {prompt.stimulus && <StimulusView stimulus={prompt.stimulus} />}
      <p className="whitespace-pre-line text-lg font-medium leading-relaxed">{prompt.text}</p>
      {error && <p role="alert" className="callout bg-coral-50 text-coral-600">{error}</p>}

      {phase === "prep" && (
        <div className="space-y-2">
          <p className="text-sm text-muted">Use this time to plan your answer. The answer window opens automatically.</p>
          <button className="btn btn-primary" onClick={() => void startAnswer()}>
            Start answering now
          </button>
        </div>
      )}

      {phase === "answer" && (
        <div className="space-y-3">
          {voice ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recording. Speak your answer.</p>
              <LevelMeter level={recorder.level} active />
            </div>
          ) : (
            <textarea
              className="h-48 w-full input"
              aria-label="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={4000}
              autoFocus
            />
          )}
          <button className="btn btn-primary" onClick={() => void finishAnswer()}>
            {voice ? "Finish answer" : "Submit answer"}
          </button>
        </div>
      )}

      {phase === "transcribing" && <p role="status" className="text-sm text-muted">Transcribing your answer…</p>}

      {phase === "review" && (
        <div className="space-y-3">
          {voice ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">What we heard</p>
              <p className="whitespace-pre-line rounded-lg border border-line bg-white p-3 text-sm">{answer || "Nothing was transcribed."}</p>
            </div>
          ) : (
            <p className="whitespace-pre-line rounded-lg border border-line bg-white p-3 text-sm">{answer || "No answer given."}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={accept}>
              {idx + 1 >= stage.prompts.length ? "Finish" : "Next"}
            </button>
            {voice && retakesLeft > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRetakesLeft((n) => n - 1);
                  void startAnswer();
                }}
              >
                Re-record ({retakesLeft} left)
              </button>
            )}
            {!voice && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setPhase("answer");
                  setDeadline(Date.now() + 60_000);
                  handled.current = false;
                }}
              >
                Edit (1 more minute)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
