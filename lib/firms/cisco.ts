import type { FirmProfile } from "./types";

const CISCO_PROG = "https://www.cisco.com/c/en_uk/about/our-programmes.html";
const CISCO_SEARCH = "https://uk.indeed.com/q-cisco-apprentice-jobs.html";
const CISCO_TSR = "https://www.thestudentroom.co.uk/showthread.php?t=7655783";
const CISCO_DEGREE = "https://uk.indeed.com/Degree-Apprenticeship-Cisco-jobs";

export const cisco: FirmProfile = {
  slug: "cisco",
  name: "Cisco UK",
  sector: "Technology / networking",
  programmes: [
    {
      name: "Cisco Degree Apprenticeship (rotational, 4 years)",
      level: "Level 6",
      degree: "BSc (Hons) Digital and Technology Solutions OR BSc (Hons) Professional Management (Applied Business Management / Chartered Manager reported)",
      locations: ["Greater London (Bedfont Lakes, Feltham)", "Manchester"],
    },
  ],
  entry: {
    ucas: "104 UCAS points (BCC at A level or DMM BTEC) per 2026-cycle listing summary",
    predictedGrades: "7 GCSEs 9-4 including English and Maths",
    other:
      "No prior Level 6+ qualification; right to work in UK; lived in UK/EEA 3+ years; ready to start full-time from Sept 2026. Older 2024 listing said 90 UCAS points - requirements changed between cycles.",
    source: CISCO_SEARCH,
  },
  timeline: {
    opens: "Registration of interest page kept open; recruitment cycle reported to start in January",
    closes: "2025 cycle deadline reported as 26 Feb 2025 (forum/summary)",
    rolling: false,
    notes:
      "2026 cycle: sift, then eligibility and skills check run by training provider Velocity, scheduled mid-July to mid-August 2026 (per search summary of Cisco posting), so the 2026 process ran late in the year. Applications for Sept 2027 intake typically appear Sept-Nov 2026 across employers generally.",
    source: CISCO_SEARCH,
  },
  stages: [
    {
      order: 1,
      name: "Online application and sift",
      format:
        "Personal details, employment history and a personal statement. A sift panel assesses employment history and personal statement against essential criteria; a pass mark applies.",
      tips: [
        "Write the personal statement against the essential criteria in the advert - it is scored, not skim-read.",
        "Mention Cisco products, customers and how Cisco competes; a current apprentice's only advice was 'build a knowledge of what Cisco do and also how we compete'.",
      ],
      source: CISCO_SEARCH,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 2,
      name: "Eligibility and skills check (Velocity)",
      format:
        "Candidates passing the sift are passed to training provider Velocity, which emails them and checks qualifications, eligibility, functional skills (if required) and a skills scan.",
      provider: "Velocity",
      tips: ["Have certificates and ID to hand; respond to Velocity emails quickly."],
      source: CISCO_SEARCH,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 3,
      name: "HireVue video interview",
      format: "If shortlisted, invite to record answers to a few questions on HireVue (question count and timings not published).",
      provider: "HireVue",
      tips: ["Prepare 4-5 STAR stories and a two-line answer on why Cisco and why an apprenticeship."],
      source: CISCO_DEGREE,
      confidence: "single-report",
    },
    {
      order: 4,
      name: "Assessment centre (London office)",
      format:
        "Final stage at the London office where candidates meet managers and current apprentices. Activities not published; forum posts mention mandatory events at the office.",
      tips: ["Ask current apprentices real questions - the day doubles as an introduction to the team."],
      source: CISCO_TSR,
      confidence: "single-report",
    },
  ],
  videoInterview: {
    text: "HireVue one-way video after shortlisting; 'a few questions'. Exact count, prep and answer time not verified.",
    source: CISCO_DEGREE,
    confidence: "single-report",
  },
  assessmentCentre: {
    text: "Held at Cisco's London office; meet managers and current apprentices. Specific exercises not verified.",
    source: CISCO_DEGREE,
    confidence: "single-report",
  },
  values: [
    "Cisco's programme pages stress exploring roles, a major business project and strong support network (mentors, managers, peer apprentices)",
    "Behaviour framework used in assessment not verified (a 'Communicating and Influencing / Delivering at Pace / Developing Self and Others' list surfaced in search but could not be attributed to Cisco)",
  ],
  questions: [],
  specificAdvice: [
    "Cisco's programme is a rotation: explain which areas (tech vs customer experience vs operations) interest you and why.",
    "Because the sift scores your personal statement, treat it as the main test - tie each essential criterion to a concrete example.",
    "Check the Velocity email and skills-check window (mid-July to mid-August in 2026); missing it ends the application.",
    "Read Cisco blogs and customer-success stories before the HireVue and assessment centre (advice reported by search summaries).",
    "Note Cisco lists two degrees (Digital & Technology Solutions, Professional Management); know which role you applied for.",
  ],
  officialLinks: [
    "https://www.cisco.com/c/en_uk/about/our-programmes.html",
    "https://www.cisco.com/c/en/us/about/careers/communities/students-and-new-graduates/apprenticeship.html",
  ],
  lastVerified: "2026-09-30",
  gaps: [
    "Cisco's own apprenticeship recruitment pages returned redirects/no detail; process stages were taken from search-result summaries of Cisco's job posting, not fetched directly.",
    "Whether an online aptitude test is used - none found.",
    "HireVue question count/timing and real candidate questions (Glassdoor/TSR returned 403).",
    "Assessment centre exercises, pass marks and offer timing.",
    "Glassdoor/GeeksforGeeks 'Cisco apprentice' results refer to India hiring (HackerRank 50 MCQ, technical/managerial/HR) and are NOT applicable to the UK degree apprenticeship; deliberately excluded.",
  ],
};
