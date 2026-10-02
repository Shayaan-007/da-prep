// Original work-style items for the personality-style (trait profile) replicas. There are no right answers: the
// result is a profile across six traits, not a pass or fail. Hand-written; option order shuffled deterministically.

import { rng } from "@/lib/assess/rng";
import type { Item } from "@/lib/assess/types";

export const TRAITS = ["Resilience", "Teamwork", "Planning", "Initiative", "Adaptability", "Accuracy"] as const;
export type Trait = (typeof TRAITS)[number];

const LIKERT: [trait: Trait, text: string, reverse?: boolean][] = [
  ["Resilience", "I recover quickly after a setback."],
  ["Resilience", "Criticism makes me want to give up.", true],
  ["Resilience", "I stay calm when several things go wrong at once."],
  ["Resilience", "I keep going when a task is difficult."],
  ["Teamwork", "I enjoy working towards a goal with other people."],
  ["Teamwork", "I prefer to work alone even when a team would be faster.", true],
  ["Teamwork", "I check that everyone in a group has had the chance to speak."],
  ["Teamwork", "I help colleagues even when it is not my job."],
  ["Planning", "I plan my week before it begins."],
  ["Planning", "I often leave things until the last minute.", true],
  ["Planning", "I keep a list of what I need to do."],
  ["Initiative", "I look for ways to improve things without being asked."],
  ["Initiative", "I wait to be told what to do next.", true],
  ["Initiative", "I volunteer for tasks that are new to me."],
  ["Adaptability", "I adjust quickly when plans change."],
  ["Adaptability", "I find unexpected changes very stressful.", true],
  ["Adaptability", "I enjoy learning new ways of doing things."],
  ["Accuracy", "I double-check my work before handing it in."],
  ["Accuracy", "I sometimes overlook small errors.", true],
  ["Accuracy", "I notice mistakes that other people miss."],
];

const STATEMENTS: Record<Trait, string[]> = {
  Resilience: ["I keep going when things get hard.", "Setbacks do not put me off for long.", "I stay calm under pressure.", "I learn from my mistakes and try again."],
  Teamwork: ["I enjoy helping others succeed.", "I listen before I speak in a group.", "I share credit with the team.", "I make sure quieter people are heard."],
  Planning: ["I like to have a clear plan.", "I break big tasks into steps.", "I meet deadlines early.", "I keep my work organised."],
  Initiative: ["I start things without being asked.", "I suggest new ideas.", "I take responsibility for fixing problems I notice.", "I look for extra things to learn."],
  Adaptability: ["I am comfortable when plans change.", "I try new approaches readily.", "I adjust easily to different people.", "I switch tasks quickly when needed."],
  Accuracy: ["I check details carefully.", "I rarely make careless mistakes.", "I follow procedures exactly.", "I proofread everything I write."],
};

export function buildTraits(): { likert: Item[]; forcedChoice: Item[] } {
  const likert = LIKERT.map(
    ([trait, text, reverse], i): Item => ({
      id: `trait-lk-${i + 1}`,
      kind: "likert",
      trait,
      reverse,
      prompt: text,
      explanation: "",
    }),
  );
  const forcedChoice = Array.from({ length: 12 }, (_, b): Item => {
    const r = rng(40000 + b);
    const offsets = b < 6 ? [0, 2, 4] : [0, 1, 3];
    const traits = offsets.map((o) => TRAITS[(b + o) % TRAITS.length]);
    const statements = r.shuffle(traits.map((t) => ({ text: STATEMENTS[t][b % 4], trait: t as string })));
    return {
      id: `trait-fc-${b + 1}`,
      kind: "forced-choice",
      prompt: "Choose the statement that is most like you and the one that is least like you.",
      statements,
      explanation: "",
    };
  });
  return { likert, forcedChoice };
}

export const TRAIT_BANK = buildTraits();
