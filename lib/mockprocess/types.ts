// A firm "mock process" chains the stages of that firm's real selection process, in the firm's real order, using the
// replica tests and question sets. It never claims more than the research supports: stages that are not replicated
// (games, group exercises) are shown as information, and uncertain timings are marked approximate.

import type { Stimulus } from "@/lib/assess/types";
import type { Confidence } from "@/lib/firms/types";

export type QaMode = "video" | "interview" | "exercise";

export type QaPrompt = { text: string; stimulus?: Stimulus };

export type MockStage =
  | {
      kind: "info";
      name: string;
      summary: string;
      tips: string[];
      /** Links to FirmStage.order in lib/firms. */
      stageOrder?: number;
      note?: string;
    }
  | { kind: "test"; name: string; testId: string; stageOrder?: number; note?: string }
  | {
      kind: "qa";
      name: string;
      mode: QaMode;
      intro: string;
      prompts: QaPrompt[];
      /** Thinking time before the answer window opens. */
      prepSeconds: number;
      answerSeconds: number;
      /** Extra attempts allowed per prompt (video style). Typed answers can always be edited. */
      retakes: number;
      stageOrder?: number;
      note?: string;
    };

export type MockProcess = {
  firm: string;
  title: string;
  confidence: Confidence;
  /** The firm's own marking framework (values or behaviours). Items come from the firm profile. */
  framework: { name: string; items: string[] };
  stages: MockStage[];
  notes: string[];
};
