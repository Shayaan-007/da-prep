// Original practice questions written for this site. They are not copied from any employer's tests.

export type Category = "sjt" | "numerical" | "verbal" | "logical";

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
};

export const CATEGORY_INFO: Record<Category, { label: string; blurb: string; secondsPerQuestion: number }> = {
  sjt: {
    label: "Situational judgement",
    blurb: "Pick the most effective response to a work scenario.",
    secondsPerQuestion: 60,
  },
  numerical: {
    label: "Numerical reasoning",
    blurb: "Percentages, ratios and everyday calculations. Calculator allowed in most real tests.",
    secondsPerQuestion: 60,
  },
  verbal: {
    label: "Verbal reasoning",
    blurb: "Read a passage, then decide if a statement is true, false, or cannot be said.",
    secondsPerQuestion: 45,
  },
  logical: {
    label: "Logical reasoning",
    blurb: "Number patterns and deduction.",
    secondsPerQuestion: 45,
  },
};

const PASSAGE =
  "Northbrook Engineering's apprentices split their time between the workplace and university. All apprentices must complete a placement in at least two departments during their first year. The company does not require apprentices to have studied maths at A-level, but it does ask for GCSE maths at grade 5 or above.";

const TFC = ["True", "False", "Cannot say"];

const PASSAGE2 =
  "Harlow Digital runs its degree apprenticeship programme over five years. Apprentices attend university one day a week and spend the other four days in client-facing teams. Applications open in October and close once all places are filled. Successful applicants must pass a background check before starting. Salary rises at the start of each year of the programme.";

export const QUESTIONS: Question[] = [
  // ---- Situational judgement
  {
    id: "sjt-1",
    category: "sjt",
    prompt:
      "You are working on a team project with a deadline in three days. One team member has not completed any of their work and has stopped replying to messages. What is the MOST effective response?",
    options: [
      "Do their part yourself so the project is finished on time.",
      "Speak to them privately to find out what is wrong, offer help, and agree what they will do and by when.",
      "Tell your manager straight away that they are not pulling their weight.",
      "Leave their part out and hope nobody notices.",
    ],
    answer: 1,
    explanation:
      "Talking to them first is fair and often solves the problem. If it doesn't, involving your manager with the facts is the next step. Silently covering for them hides the issue, and jumping straight to a complaint skips the chance to help.",
  },
  {
    id: "sjt-2",
    category: "sjt",
    prompt:
      "You realise a spreadsheet you sent to a client this morning contains a calculation error that changes one of the totals. What is the MOST effective response?",
    options: [
      "Wait to see whether the client notices.",
      "Quietly send a corrected version without mentioning the change.",
      "Tell your manager immediately, explain what happened, and propose how to correct it with the client.",
      "Fix your copy and say nothing, since the client hasn't complained.",
    ],
    answer: 2,
    explanation:
      "Honesty and speed matter. Your manager needs to know before the client acts on the wrong figure, and arriving with a solution shows ownership.",
  },
  {
    id: "sjt-3",
    category: "sjt",
    prompt:
      "Your manager gives you a task due at 3pm. At noon, a different manager asks you for something urgent, also due at 3pm. You cannot do both. What is the MOST effective response?",
    options: [
      "Do the second task because that manager asked most recently.",
      "Explain the clash to both managers and ask them to agree which takes priority.",
      "Rush both and accept that the quality may drop.",
      "Say nothing and finish whichever you can.",
    ],
    answer: 1,
    explanation:
      "You shouldn't decide priorities between managers yourself. Being open about the conflict lets them decide, and nobody is surprised at 3pm.",
  },
  {
    id: "sjt-4",
    category: "sjt",
    prompt:
      "In a meeting, a colleague presents an idea you shared with them last week as if it were their own. What is the MOST effective response?",
    options: [
      "Interrupt and correct them in front of everyone.",
      "Say nothing and stop sharing ideas with them.",
      "Speak to them calmly afterwards, and if it happens again involve your manager.",
      "Complain about them to other colleagues.",
    ],
    answer: 2,
    explanation:
      "A private, calm conversation gives them the chance to put it right and protects the relationship. Escalate only if it continues. Public confrontation and gossip both damage your reputation.",
  },
  {
    id: "sjt-5",
    category: "sjt",
    prompt:
      "You are falling behind on a university assignment because of a busy period at work. The deadline is in a week. What is the MOST effective response?",
    options: [
      "Ask a friend on the course for their finished work to use as a guide.",
      "Contact your tutor and workplace mentor early, explain the pressure, and agree a realistic plan.",
      "Stay up all night before the deadline and hope for the best.",
      "Miss the deadline and explain afterwards.",
    ],
    answer: 1,
    explanation:
      "Both your employer and university want you to succeed. Raising problems early gives them time to help, for example with study time or an extension.",
  },
  {
    id: "sjt-6",
    category: "sjt",
    prompt:
      "You are given instructions for a new task but you are not sure you understand one step. Your manager is busy. What is the MOST effective response?",
    options: [
      "Guess the meaning and carry on.",
      "Ask a colleague to do that step for you.",
      "Find a good moment to ask your manager a short, specific question and repeat back your understanding.",
      "Wait until you have finished everything else, then decide.",
    ],
    answer: 2,
    explanation:
      "Clarifying at the start is quicker than redoing work later. A specific question and a quick recap respects your manager's time.",
  },
  {
    id: "sjt-7",
    category: "sjt",
    prompt:
      "You notice a colleague is not following a safety procedure in the workshop. Nobody else has said anything. What is the MOST effective response?",
    options: [
      "Ignore it. It is their responsibility.",
      "Speak up straight away if it is safe to do so, and report it to your supervisor as the procedure requires.",
      "Mention it to friends at lunch.",
      "Wait to see if anything goes wrong first.",
    ],
    answer: 1,
    explanation:
      "Safety comes first and everyone has a duty to raise concerns. Acting immediately and using the proper reporting route protects people.",
  },
  {
    id: "sjt-8",
    category: "sjt",
    prompt:
      "A customer is angry about a delayed delivery. It was not your fault. What is the MOST effective response?",
    options: [
      "Explain that the delay was caused by another team.",
      "Listen, acknowledge their frustration, explain what you will do next, and follow up when you said you would.",
      "Refer them to the complaints page and end the call.",
      "Promise them a refund to calm them down.",
    ],
    answer: 1,
    explanation:
      "The customer wants to feel heard and to know what happens next. Blaming others doesn't help, and you shouldn't promise things you can't authorise.",
  },

  // ---- Numerical
  {
    id: "num-1",
    category: "numerical",
    prompt: "A company's revenue rose from £240,000 to £276,000. What was the percentage increase?",
    options: ["12%", "15%", "16%", "18%"],
    answer: 1,
    explanation: "Increase = £36,000. 36,000 / 240,000 = 0.15, so 15%.",
  },
  {
    id: "num-2",
    category: "numerical",
    prompt: "£640 is shared between two people in the ratio 3 : 5. How much does the larger share receive?",
    options: ["£240", "£320", "£400", "£425"],
    answer: 2,
    explanation: "3 + 5 = 8 parts. £640 / 8 = £80 per part. 5 × £80 = £400.",
  },
  {
    id: "num-3",
    category: "numerical",
    prompt: "A train travels 180 km in 2.5 hours. What is its average speed?",
    options: ["64 km/h", "68 km/h", "72 km/h", "76 km/h"],
    answer: 2,
    explanation: "Speed = distance / time = 180 / 2.5 = 72 km/h.",
  },
  {
    id: "num-4",
    category: "numerical",
    prompt: "After a 20% discount an item costs £80. What was the original price?",
    options: ["£96", "£100", "£104", "£110"],
    answer: 1,
    explanation: "£80 is 80% of the original. 80 / 0.8 = £100.",
  },
  {
    id: "num-5",
    category: "numerical",
    prompt: "You buy 5 items at £12.40 each and 3 items at £8.50 each. What is the total cost?",
    options: ["£82.50", "£85.90", "£87.50", "£89.10"],
    answer: 2,
    explanation: "5 × 12.40 = 62.00. 3 × 8.50 = 25.50. Total = £87.50.",
  },
  {
    id: "num-6",
    category: "numerical",
    prompt: "£1 = €1.16. How many euros do you get for £250?",
    options: ["€270", "€280", "€290", "€300"],
    answer: 2,
    explanation: "250 × 1.16 = 290.",
  },

  // ---- Verbal (each question repeats the passage)
  {
    id: "ver-1",
    category: "verbal",
    prompt: `${PASSAGE}\n\nStatement: Apprentices spend all of their time in the workplace.`,
    options: TFC,
    answer: 1,
    explanation: "The passage says apprentices split their time between the workplace and university, so the statement is false.",
  },
  {
    id: "ver-2",
    category: "verbal",
    prompt: `${PASSAGE}\n\nStatement: In their first year, apprentices must spend time in two or more departments.`,
    options: TFC,
    answer: 0,
    explanation: "\"At least two departments\" during the first year matches the statement, so it is true.",
  },
  {
    id: "ver-3",
    category: "verbal",
    prompt: `${PASSAGE}\n\nStatement: Applicants with A-level maths are more likely to be selected.`,
    options: TFC,
    answer: 2,
    explanation: "The passage says A-level maths is not required but says nothing about it giving an advantage. You cannot say.",
  },
  {
    id: "ver-4",
    category: "verbal",
    prompt: `${PASSAGE}\n\nStatement: Apprentices need A-level maths.`,
    options: TFC,
    answer: 1,
    explanation: "The company does not require A-level maths, so the statement is false.",
  },
  {
    id: "ver-5",
    category: "verbal",
    prompt: `${PASSAGE}\n\nStatement: Each placement lasts exactly six months.`,
    options: TFC,
    answer: 2,
    explanation: "The passage gives no length for placements, so you cannot say.",
  },

  // ---- Logical
  {
    id: "log-1",
    category: "logical",
    prompt: "What comes next? 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    answer: 1,
    explanation: "Differences are 4, 6, 8, 10, so the next difference is 12. 30 + 12 = 42.",
  },
  {
    id: "log-2",
    category: "logical",
    prompt: "What comes next? 3, 6, 11, 18, 27, ?",
    options: ["36", "38", "40", "42"],
    answer: 1,
    explanation: "Differences are 3, 5, 7, 9, so the next is 11. 27 + 11 = 38.",
  },
  {
    id: "log-3",
    category: "logical",
    prompt: "All engineers at the firm are trained in CAD. Priya is trained in CAD. Is Priya an engineer at the firm?",
    options: ["Definitely yes", "Not necessarily", "Definitely no"],
    answer: 1,
    explanation: "Being trained in CAD doesn't prove someone is an engineer. Other staff might be trained too.",
  },
  {
    id: "log-4",
    category: "logical",
    prompt: "If it rains, the match is cancelled. The match was not cancelled. What can you conclude?",
    options: ["It rained", "It did not rain", "Cannot tell"],
    answer: 1,
    explanation: "If rain always causes cancellation, no cancellation means there was no rain.",
  },
  {
    id: "log-5",
    category: "logical",
    prompt: "Which is the odd one out? 16, 25, 36, 48, 49",
    options: ["16", "25", "36", "48"],
    answer: 3,
    explanation: "16, 25, 36 and 49 are square numbers. 48 is not.",
  },
  {
    id: "log-6",
    category: "logical",
    prompt: "What comes next? 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "14"],
    answer: 2,
    explanation: "Each number is the sum of the previous two (Fibonacci). 5 + 8 = 13.",
  },

  // ---- More situational judgement
  {
    id: "sjt-9",
    category: "sjt",
    prompt:
      "A teammate seems overwhelmed and is falling behind on their tasks. You have some spare time this week. What is the MOST effective response?",
    options: [
      "Ignore it. They will ask if they need help.",
      "Quietly ask how they are doing, offer to help with something specific, and suggest they tell your manager if the workload is too much.",
      "Take over their tasks without telling anyone.",
      "Tell the rest of the team they are struggling.",
    ],
    answer: 1,
    explanation:
      "Offering specific help respects them and supports the team. Workload problems should be visible to the manager, but it should be their choice how it is raised first. Gossip and silent takeovers both cause problems.",
  },
  {
    id: "sjt-10",
    category: "sjt",
    prompt:
      "Your manager criticises part of your work in a team meeting. You think some of the criticism is unfair. What is the MOST effective response?",
    options: [
      "Argue your case immediately in front of everyone.",
      "Stay calm, note the points, then ask for a short one-to-one to understand the detail and share your view.",
      "Say nothing and stop contributing in meetings.",
      "Complain about your manager to colleagues afterwards.",
    ],
    answer: 1,
    explanation:
      "Staying composed and following up privately shows maturity and lets you learn from valid points while calmly raising any you disagree with.",
  },
  {
    id: "sjt-11",
    category: "sjt",
    prompt:
      "You are asked to complete a task using software you have never used. The deadline is tomorrow. What is the MOST effective response?",
    options: [
      "Say you can do it and work it out alone, without telling anyone.",
      "Tell your manager you haven't used it, ask for a quick pointer or a colleague to ask, and start learning straight away.",
      "Refuse, because it is outside your role.",
      "Ask a colleague to do the whole task for you.",
    ],
    answer: 1,
    explanation:
      "Being honest about what you don't know, while showing you'll learn quickly, builds trust. Pretending or refusing are both worse outcomes for the team.",
  },
  {
    id: "sjt-12",
    category: "sjt",
    prompt:
      "A friend who works for a rival company asks you about a product launch your company has not yet announced. What is the MOST effective response?",
    options: [
      "Give them a few hints, because they're a friend.",
      "Politely say you can't discuss internal matters, and change the subject.",
      "Make up something to mislead them.",
      "Post about it online instead.",
    ],
    answer: 1,
    explanation:
      "Confidential information must stay confidential. A polite, friendly refusal protects your employer and your reputation without causing a scene.",
  },
  {
    id: "sjt-13",
    category: "sjt",
    prompt:
      "An unexpected problem means you won't finish an important report by Friday as promised. It is Wednesday. What is the MOST effective response?",
    options: [
      "Work quietly and hope to finish in time.",
      "Tell your manager now, explain the issue, and propose a realistic new plan or what could be delivered by Friday.",
      "Submit an incomplete report on Friday without explanation.",
      "Tell your manager on Friday afternoon.",
    ],
    answer: 1,
    explanation:
      "Early warning with a proposed solution gives people time to adjust. Surprises on the deadline are what damage trust.",
  },
  {
    id: "sjt-14",
    category: "sjt",
    prompt:
      "You have just joined a team and feel left out, as everyone seems to know each other. What is the MOST effective response?",
    options: [
      "Wait for people to come to you.",
      "Introduce yourself, ask colleagues about their work, and join in with team conversations and breaks.",
      "Only talk to your manager.",
      "Assume they don't like you and keep your head down.",
    ],
    answer: 1,
    explanation:
      "Being proactive and curious is the quickest way to build relationships. Most colleagues are glad when a new starter makes the first move.",
  },

  // ---- More numerical
  {
    id: "num-7",
    category: "numerical",
    prompt: "A recipe for 4 people uses 300g of flour. How much flour is needed for 10 people?",
    options: ["650g", "700g", "750g", "800g"],
    answer: 2,
    explanation: "300g / 4 = 75g per person. 75g × 10 = 750g.",
  },
  {
    id: "num-8",
    category: "numerical",
    prompt: "A project brings in £45,000 of revenue and costs £36,000. What is the profit as a percentage of revenue?",
    options: ["18%", "20%", "25%", "80%"],
    answer: 1,
    explanation: "Profit = £9,000. 9,000 / 45,000 = 0.2, so 20%.",
  },
  {
    id: "num-9",
    category: "numerical",
    prompt: "What is the mean of 12, 15, 9, 18 and 21?",
    options: ["14", "15", "16", "17"],
    answer: 1,
    explanation: "12 + 15 + 9 + 18 + 21 = 75. 75 / 5 = 15.",
  },
  {
    id: "num-10",
    category: "numerical",
    prompt: "What is 15% of £240?",
    options: ["£32", "£34", "£36", "£38"],
    answer: 2,
    explanation: "10% = £24 and 5% = £12, so 15% = £36.",
  },
  {
    id: "num-11",
    category: "numerical",
    prompt: "A phone plan costs £18.50 a month for 12 months, plus a one-off £25 set-up fee. What is the total cost?",
    options: ["£240", "£247", "£252", "£265"],
    answer: 1,
    explanation: "12 × £18.50 = £222. £222 + £25 = £247.",
  },
  {
    id: "num-12",
    category: "numerical",
    prompt: "A journey of 135 miles is driven at an average speed of 45 mph. How long does it take?",
    options: ["2.5 hours", "3 hours", "3.5 hours", "4 hours"],
    answer: 1,
    explanation: "Time = distance / speed = 135 / 45 = 3 hours.",
  },

  // ---- More verbal
  {
    id: "ver-6",
    category: "verbal",
    prompt: `${PASSAGE2}\n\nStatement: The programme lasts five years.`,
    options: TFC,
    answer: 0,
    explanation: "The passage states the programme runs over five years, so the statement is true.",
  },
  {
    id: "ver-7",
    category: "verbal",
    prompt: `${PASSAGE2}\n\nStatement: Apprentices attend university five days a week.`,
    options: TFC,
    answer: 1,
    explanation: "They attend university one day a week, so the statement is false.",
  },
  {
    id: "ver-8",
    category: "verbal",
    prompt: `${PASSAGE2}\n\nStatement: Salary stays the same throughout the programme.`,
    options: TFC,
    answer: 1,
    explanation: "Salary rises at the start of each year, so the statement is false.",
  },
  {
    id: "ver-9",
    category: "verbal",
    prompt: `${PASSAGE2}\n\nStatement: Harlow Digital pays more than other employers.`,
    options: TFC,
    answer: 2,
    explanation: "The passage never compares salary with other employers, so you cannot say.",
  },
  {
    id: "ver-10",
    category: "verbal",
    prompt: `${PASSAGE2}\n\nStatement: Apprentices spend most of the week working in client-facing teams.`,
    options: TFC,
    answer: 0,
    explanation: "Four of the five days are spent in client-facing teams, which is most of the week, so it is true.",
  },

  // ---- More logical
  {
    id: "log-7",
    category: "logical",
    prompt: "What comes next? 5, 10, 20, 40, 80, ?",
    options: ["120", "140", "160", "200"],
    answer: 2,
    explanation: "Each number doubles. 80 × 2 = 160.",
  },
  {
    id: "log-8",
    category: "logical",
    prompt: "What comes next? 100, 93, 86, 79, ?",
    options: ["70", "72", "74", "76"],
    answer: 1,
    explanation: "Each number falls by 7. 79 − 7 = 72.",
  },
  {
    id: "log-9",
    category: "logical",
    prompt: "What comes next? 2, 3, 5, 7, 11, ?",
    options: ["12", "13", "14", "15"],
    answer: 1,
    explanation: "These are the prime numbers. The next prime after 11 is 13.",
  },
  {
    id: "log-10",
    category: "logical",
    prompt: "All managers attend the Monday meeting. Sam does not attend the Monday meeting. Is Sam a manager?",
    options: ["Definitely yes", "Definitely no", "Cannot tell"],
    answer: 1,
    explanation: "If every manager attends, anyone who doesn't attend cannot be a manager.",
  },
  {
    id: "log-11",
    category: "logical",
    prompt:
      "Some apprentices study law. Everyone who studies law has a mentor. Which statement MUST be true?",
    options: ["All apprentices have a mentor", "Some apprentices have a mentor", "No apprentices have a mentor"],
    answer: 1,
    explanation:
      "The apprentices who study law all have a mentor, so at least some apprentices have one. You can't conclude all do.",
  },
  {
    id: "log-12",
    category: "logical",
    prompt: "Which is the odd one out? 9, 27, 81, 100",
    options: ["9", "27", "81", "100"],
    answer: 3,
    explanation: "9, 27 and 81 are powers of 3 (3², 3³, 3⁴). 100 is not.",
  },
];

export function questionsFor(category: Category) {
  return QUESTIONS.filter((q) => q.category === category);
}
