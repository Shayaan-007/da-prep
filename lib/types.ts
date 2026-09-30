import type { Stage } from "@/lib/interview";

export const COMPETENCIES = [
  "Teamwork",
  "Problem solving",
  "Resilience",
  "Communication",
  "Organisation",
  "Leadership",
  "Initiative",
] as const;

export const STATUSES = [
  "Interested",
  "Applied",
  "Online tests",
  "Video interview",
  "Assessment centre",
  "Offer",
  "Rejected",
] as const;
export type Status = (typeof STATUSES)[number];

export type Application = {
  id: string;
  employer: string;
  role: string;
  deadline: string;
  status: Status;
  notes: string;
};

export type Story = {
  id: string;
  title: string;
  competencies: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
};

export type SessionRecord = {
  id: string;
  date: string;
  stage: Stage;
  mode: "text" | "video";
  overall: number;
  summary: string;
  jobSnippet: string;
  turns: { question: string; answer: string; score: number }[];
};

export type PracticeRecord = {
  id: string;
  date: string;
  category: string;
  score: number;
  total: number;
};
