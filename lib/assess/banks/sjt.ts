// Original situational judgement items set in an apprentice's working life. Hand-written. Scenarios reward the
// behaviours employers publish (take ownership, tell people early, ask for help, act safely, treat people with respect)
// and penalise hiding problems, blame and doing nothing. Option order is shuffled deterministically at build time.

import { rng } from "@/lib/assess/rng";
import type { Item } from "@/lib/assess/types";

type ML = { scenario: string; best: string; others: string[]; worst: string; why: string };

const MOST_LEAST: ML[] = [
  {
    scenario: "Your manager asked you to finish a report by Friday. On Wednesday you realise you misunderstood part of the brief and cannot finish in time.",
    best: "Tell your manager today what happened and suggest a revised plan.",
    others: ["Work late each night and hope to finish without telling anyone.", "Hand in what you have on Friday without comment."],
    worst: "Ask a colleague to finish it and say nothing to your manager.",
    why: "Telling your manager early gives them time to adjust and shows ownership. Passing the work on secretly hides the problem and the extra effort.",
  },
  {
    scenario: "You notice a colleague often takes long breaks, leaving the team short at busy times.",
    best: "Mention your concern to your colleague privately and ask if anything is wrong.",
    others: ["Tell your manager straight away, without speaking to your colleague first.", "Say nothing and cover for them when you can."],
    worst: "Tell the rest of the team what you have noticed.",
    why: "A private, respectful conversation comes first. Discussing it with the wider team is gossip and damages trust.",
  },
  {
    scenario: "Work has been busy and you are falling behind on a college assignment due in two weeks.",
    best: "Speak to your manager and your tutor now to agree what support or time you can have.",
    others: ["Work through weekends and say nothing.", "Ask a friend on the course for their answers."],
    worst: "Leave it and hope the deadline gets extended.",
    why: "Early conversations let both your employer and your tutor help. Copying is dishonest and waiting passively solves nothing.",
  },
  {
    scenario: "A customer rings, angry about a late delivery that was not your fault.",
    best: "Listen, apologise for the experience, and explain what you will do next to put it right.",
    others: ["Explain that delivery is a different department and transfer the call.", "Explain calmly why the delay was not your team's fault."],
    worst: "End the call when they raise their voice.",
    why: "Acknowledging the problem and taking ownership of next steps keeps the customer's trust. Ending the call is the worst outcome.",
  },
  {
    scenario: "In a group project the team leader chooses your idea, but you think a teammate's idea is better.",
    best: "Suggest comparing both ideas against the project goals with the whole team.",
    others: ["Say nothing and go along with your own idea.", "Tell your teammate to challenge the leader."],
    worst: "Quietly start working on your teammate's idea instead.",
    why: "Raising it openly keeps the team aligned on the best result. Working against the agreed plan in secret causes confusion.",
  },
  {
    scenario: "In the workshop you see a cable trailing across a walkway.",
    best: "Make it safe if you can do so without risk, and report it.",
    others: ["Warn people nearby and move on.", "Mention it to a colleague so they can deal with it later."],
    worst: "Leave it, assuming someone else will notice.",
    why: "Safety hazards need action and a report. Assuming someone else will deal with it is how accidents happen.",
  },
  {
    scenario: "Your manager criticises your presentation in front of the team.",
    best: "Listen, then ask afterwards for specific examples so you can improve.",
    others: ["Explain immediately why you made those choices.", "Agree in the meeting and avoid presenting again."],
    worst: "Complain about your manager to colleagues afterwards.",
    why: "Treating feedback as information helps you improve. Complaining behind their back damages relationships without fixing anything.",
  },
  {
    scenario: "You accidentally email a spreadsheet containing client details to the wrong external address.",
    best: "Tell your manager or the data protection lead immediately so they can act.",
    others: ["Email the recipient asking them to delete it, and report it afterwards.", "Email the recipient asking them to delete it, and tell no one."],
    worst: "Wait to see whether anything comes of it.",
    why: "Data incidents must be reported straight away so they can be contained. Waiting or staying silent increases the harm.",
  },
  {
    scenario: "Two managers each give you an urgent task with the same deadline.",
    best: "Explain the clash to both and ask them to agree which comes first.",
    others: ["Do the task from the manager you know better.", "Do the shorter task first and then see."],
    worst: "Try to do both at once and hand in rushed work.",
    why: "Both managers need to know, and only they can decide priority. Rushing both usually means neither is done well.",
  },
  {
    scenario: "You have finished your tasks early and there are two hours left in the day.",
    best: "Ask your team whether anyone needs help, or pick up a learning task.",
    others: ["Tidy your desk and wait to be told what to do.", "Start on tomorrow's work without asking."],
    worst: "Leave early without telling anyone.",
    why: "Offering help or using the time to learn shows initiative. Leaving without telling anyone is unreliable.",
  },
];

type RE = { scenario: string; actions: [text: string, rating: number][]; why: string };

const RATE_EACH: RE[] = [
  {
    scenario: "A new team member seems isolated at lunch and in meetings.",
    actions: [
      ["Invite them to join you for lunch and ask about their interests.", 3],
      ["Suggest to your manager that they might benefit from a buddy.", 2],
      ["Leave them alone: they will settle in when they are ready.", 1],
      ["Tell others in the team that they seem odd.", 0],
    ],
    why: "Including people directly is the strongest response. Raising it with your manager helps too. Doing nothing leaves them isolated, and gossip is harmful.",
  },
  {
    scenario: "You need to explain a delay to a client by email.",
    actions: [
      ["Explain honestly what happened, give the new date and say how you will prevent it recurring.", 3],
      ["Send a short note with the new date and no explanation.", 2],
      ["Wait for the client to chase before replying.", 1],
      ["Say another team caused the delay.", 0],
    ],
    why: "Honest, specific communication builds trust. Blaming another team and waiting to be chased both damage it.",
  },
  {
    scenario: "Your deadline is tomorrow. You realise one figure in your report may be wrong and checking it will take two hours.",
    actions: [
      ["Check the figure and tell your manager if it will affect the deadline.", 3],
      ["Submit on time and flag that the figure is unchecked.", 2],
      ["Submit on time and say nothing.", 1],
      ["Change the figure to what you think is right without telling anyone.", 0],
    ],
    why: "Accuracy matters and so does openness. Quietly changing data is the most damaging choice.",
  },
  {
    scenario: "You notice that your team's process creates extra work for another team.",
    actions: [
      ["Collect a few examples and suggest an improvement to your manager.", 3],
      ["Bring it up at the next team meeting.", 2],
      ["Carry on as usual: it is not your responsibility.", 1],
      ["Tell the other team they are being unreasonable.", 0],
    ],
    why: "Evidence and a suggested fix show you can see the bigger picture. Dismissing the other team's problem is unhelpful.",
  },
  {
    scenario: "You must choose between two suppliers. The cheaper one has poor customer reviews.",
    actions: [
      ["Compare cost and quality evidence and talk it through with your manager.", 3],
      ["Ask a colleague which they would pick and follow their advice.", 2],
      ["Pick the cheaper one because it saves money.", 1],
      ["Choose at random.", 0],
    ],
    why: "Good decisions weigh evidence and use advice. Choosing on price alone ignores the risk, and chance is not a decision.",
  },
  {
    scenario: "You receive negative feedback on a piece of written work.",
    actions: [
      ["Ask for examples and agree steps to improve.", 3],
      ["Make the corrections and move on.", 2],
      ["Say it is a matter of opinion.", 1],
      ["Stop submitting written work.", 0],
    ],
    why: "Asking for examples turns feedback into learning. Making the changes is good, arguing is unhelpful, and avoiding the work is the worst option.",
  },
];

type RK = { scenario: string; best_first: string[]; why: string };

const RANK: RK[] = [
  {
    scenario: "Rank these tasks in the order you should do them today, most urgent first.",
    best_first: [
      "Reply to a customer complaint that needs an answer today.",
      "Finish a manager's request that is due in three days.",
      "Start the college assignment due next week.",
      "Tidy the shared drive.",
    ],
    why: "Urgency and impact come first: a customer waiting today, then the nearest deadline, then later work, then low-value tidying.",
  },
  {
    scenario: "You are given a task you do not fully understand. Rank your responses from best to worst.",
    best_first: [
      "Check notes and guidance, then ask your manager specific questions.",
      "Ask a colleague who has done it before, then confirm with your manager.",
      "Start and see whether it becomes clear.",
      "Guess based on a similar task and submit it.",
    ],
    why: "Trying first and then asking precise questions shows initiative and avoids wasted work. Guessing and submitting risks serious errors.",
  },
  {
    scenario: "You discover a mistake in work you have already handed in. Rank these actions from best to worst.",
    best_first: [
      "Tell your manager straight away and suggest how to fix it.",
      "Fix it and then explain to your manager what happened.",
      "Fix it quietly and say nothing.",
      "Hope nobody notices.",
    ],
    why: "Prompt honesty with a solution is best. Fixing quietly is better than ignoring it, but hides information others may need.",
  },
  {
    scenario: "You see something unsafe at work. Rank these actions from best to worst.",
    best_first: [
      "Stop what you are doing and report it to your supervisor.",
      "Warn people nearby, then report it.",
      "Mention it at the next team meeting.",
      "Assume someone else has noticed.",
    ],
    why: "Immediate reporting protects people. Waiting for a meeting delays action, and assuming someone else knows is the most dangerous.",
  },
];

export function buildSjt(): { mostLeast: Item[]; rateEach: Item[]; rank: Item[] } {
  const mostLeast = MOST_LEAST.map((s, i): Item => {
    const r = rng(30000 + i);
    const texts = r.shuffle([s.best, ...s.others, s.worst]);
    return {
      id: `sjt-ml-${i + 1}`,
      kind: "most-least",
      prompt: s.scenario,
      options: texts,
      most: texts.indexOf(s.best),
      least: texts.indexOf(s.worst),
      explanation: s.why,
      difficulty: 3,
    };
  });
  const rateEach = RATE_EACH.map((s, i): Item => {
    const r = rng(31000 + i);
    const actions = r.shuffle(s.actions);
    return {
      id: `sjt-re-${i + 1}`,
      kind: "rate-each",
      prompt: s.scenario,
      actions: actions.map((a) => a[0]),
      ratings: actions.map((a) => a[1]),
      explanation: s.why,
      difficulty: 3,
    };
  });
  const rank = RANK.map((s, i): Item => {
    const r = rng(32000 + i);
    const options = r.shuffle(s.best_first);
    return {
      id: `sjt-rk-${i + 1}`,
      kind: "rank",
      prompt: s.scenario,
      options,
      order: s.best_first.map((t) => options.indexOf(t)),
      explanation: s.why,
      difficulty: 3,
    };
  });
  return { mostLeast, rateEach, rank };
}

export const SJT = buildSjt();
