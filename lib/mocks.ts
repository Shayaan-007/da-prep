// Canned AI responses for local development and UI testing. Only used when MOCK_AI=1 outside production.

import type { Turn } from "@/lib/interview";

const QUESTIONS = [
  "What draws you to a degree apprenticeship rather than going to university?",
  "Tell me about a time you worked in a team to achieve something. What was your role?",
  "Describe a time you had to learn something new quickly. How did you approach it?",
  "Tell me about a time something didn't go to plan. What did you do?",
  "Why this employer and this role in particular?",
  "Where would you like to be in five years, and how will this apprenticeship help?",
];

export const mockQuestion = (history: Turn[]) => ({ question: QUESTIONS[history.length % QUESTIONS.length] });

export const mockScore = (turns: Turn[]) => ({
  overall: 64,
  summary: "A solid start. Your motivation comes through, but your examples need more specific detail and measurable results.",
  strengths: ["Clear, positive tone", "Relevant examples chosen", "Good link to the role"],
  improvements: ["Add numbers or outcomes to your results", "Say what you personally did, not just the team", "Keep answers to about a minute"],
  turns: turns.map((t, i) => ({
    score: 5 + (i % 4),
    feedback:
      t.answer === "(no answer given)"
        ? "No answer was given. In a real recorded interview this would score zero, so always say something."
        : "Good start and easy to follow. Make the result more concrete: what changed because of what you did?",
    star: { situation: true, task: i % 2 === 0, action: true, result: i % 3 === 0 },
    betterAnswer:
      "In my Year 12 project I led a team of four. We were behind schedule, so I split the work by strengths [add detail: how?]. We finished two days early and got top marks [add detail: what mark?].",
  })),
});

export const mockStar = () => ({
  situation: "In Year 11 our robotics club was three weeks behind on a competition build.",
  task: "As team lead I was responsible for getting the robot ready and keeping everyone on track.",
  action: "I split the work by each member's strengths, set short daily goals and checked progress every lunchtime.",
  result: "We finished two days early and placed second out of 14 teams [add detail: how was this judged?].",
  tip: "Add one number showing the impact, such as time saved or your final ranking.",
});

export const mockReview = () => ({
  score: 6,
  summary: "Enthusiastic and readable, but it reads generally. Tie your experience to this specific role and employer.",
  strengths: ["Genuine motivation", "Clear structure"],
  improvements: ["Name the employer and role", "Replace claims like 'hard-working' with an example", "Finish with what you will contribute"],
  rewrittenOpening:
    "I want to combine real engineering work with a degree, which is why the Mechanical Engineering Degree Apprenticeship at your company is my first choice [add detail: why this employer?].",
});
