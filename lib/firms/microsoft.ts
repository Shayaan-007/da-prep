import type { FirmProfile } from "./types";

const MS_GMFJ = "https://www.getmyfirstjob.co.uk/discover-opportunities/employers/4067fef4-e1bd-4b0c-8c09-2f2b95af25c7/microsoft";
const MS_STORY = "https://ukstories.microsoft.com/features/national-apprenticeship-week-just-say-yes-and-go-for-it/";
const MS_BEMORE = "https://lcrbemore.co.uk/apprenticeships/start-your-career-with-the-microsoft-future-forward-apprentice-programme/";
const MS_TSR = "https://www.thestudentroom.co.uk/showthread.php?t=7552661";

export const microsoft: FirmProfile = {
  slug: "microsoft",
  name: "Microsoft UK",
  sector: "Technology",
  programmes: [
    {
      name: "Future Forward Apprentice Programme - Digital & Technology Solutions Professional (Data / technical tracks), 3-year employment contract",
      level: "Level 6",
      degree: "Level 6 Digital & Technology Solutions Professional (degree apprenticeship)",
      locations: ["London (West London / Paddington)", "Reading"],
    },
    {
      name: "Other technical and non-technical apprenticeships (e.g. Customer Technical Solutions, Xbox Studios Quality Engineer, sales, corporate)",
      level: "Various",
      locations: ["West London", "Reading", "Paddington"],
    },
  ],
  entry: {
    other:
      "Eligibility is screened through application questions, with no CV screening. Specific UCAS/grade requirements not verified for the current cycle.",
    source: MS_GMFJ,
  },
  timeline: {
    opens: "Varies by programme; roles reported to close very quickly (within days in some cycles)",
    closes: "2024 Data Academy cohort closed 22 Jan 2024 with final interviews on 14 Feb",
    rolling: false,
    notes: "Microsoft UK has ~125 apprentices at any time and works with providers QA, Corndel, Firebrand, BPP, TDM and Multiverse.",
    source: MS_BEMORE,
  },
  stages: [
    {
      order: 1,
      name: "Application questions",
      format: "Online questions used to check eligibility; Microsoft states it does not screen on CV.",
      tips: ["Answer eligibility questions accurately - this is a gate, not a scored essay (per Microsoft's description)."],
      source: MS_GMFJ,
      confidence: "official",
    },
    {
      order: 2,
      name: "Strengths-based video interview (MyInterview)",
      format:
        "One-way recorded interview on the MyInterview system, record at a time that suits you, two attempts per question and you pick your favourite. Questions are motivational and skills/strengths based.",
      provider: "MyInterview",
      tips: [
        "Use both attempts: the second is often the better one.",
        "Frame answers around what energises you and where you use it, not only what you achieved.",
      ],
      source: MS_GMFJ,
      confidence: "official",
    },
    {
      order: 3,
      name: "Manager and team interview",
      format:
        "Highest-scoring video candidates are invited to a virtual interview with a manager and a team member; for most roles this is the final stage. TSR candidates describe relaxed interviewers asking generic motivation and strengths questions in a conversational style.",
      tips: ["Prepare a few questions about the team's day-to-day work; treat it as a conversation."],
      source: MS_GMFJ,
      confidence: "official",
    },
    {
      order: 4,
      name: "Additional assessment (select roles)",
      format:
        "Customer Technical Solutions and Xbox Studios Quality Engineer applicants complete a further assessment with the learning provider before a final decision.",
      tips: ["Check your programme's page for this extra step."],
      source: MS_GMFJ,
      confidence: "official",
    },
  ],
  videoInterview: {
    text: "MyInterview one-way strengths-based video; two takes per question; motivational and skills-based questions. Number of questions and time limits not published (a '15 questions x 3 minutes' figure found elsewhere relates to a different Microsoft process and is excluded).",
    source: MS_GMFJ,
    confidence: "official",
  },
  finalInterview: {
    text: "Virtual interview with a hiring manager and a team member; generic motivation and strengths-based questions; conversational (TSR reports, 2025 cycle).",
    source: MS_TSR,
    confidence: "multiple-candidate-reports",
  },
  values: [
    "Strengths-based: uses strengths to drive engagement and goals (Microsoft apprenticeship process page)",
    "Growth mindset, customer focus and diversity/inclusion are Microsoft-wide values but are not confirmed as apprenticeship scoring criteria here",
    "Apprentices do 'real work with real responsibility' (Microsoft UK Apprentice Lead)",
  ],
  questions: [],
  specificAdvice: [
    "There is no online psychometric test and no CV screen in the official flow, so the MyInterview video carries the weight - rehearse recording yourself.",
    "Think in strengths: name 3-4 things you do well and enjoy, with an example of each, and link them to the apprenticeship.",
    "Apply within the first days of a listing opening; 2026 roles were reported to close fast.",
    "Know Microsoft's mix of partners/providers (e.g. QA, BPP, Multiverse) - you will study with one of them.",
    "For Customer Technical Solutions or Xbox QA, expect an extra learning-provider assessment.",
  ],
  officialLinks: [
    "https://partner.microsoft.com/en-gb/training/apprenticeships-candidates",
    MS_STORY,
    MS_GMFJ,
  ],
  lastVerified: "2026-09-30",
  gaps: [
    "Microsoft's own candidate page could not be fetched (certificate error); process taken from its GetMyFirstJob profile.",
    "Video interview question count/timing and real questions; TSR threads returned 403, so only search snippets were available.",
    "Exact UCAS/grade requirements, current (Sept 2026/2027) degree programme dates, and locations for Level 6 roles.",
    "A search result suggesting a 'Microsoft Reading / Warwick University' Level 6 role was actually a Thales listing and was discarded.",
    "No verified pass marks or scoring method.",
  ],
};
