import type { FirmProfile } from "./types";

// Research date 2026-09-30. Most recent cycle with candidate detail: 2025 entry (applications opened Oct 2024).
const H_GUIDE = "https://www.hsbc.com/careers/students-and-graduates/application-guide";
const H_PROGS = "https://www.hsbc.com/careers/students-and-graduates/find-a-programme";
const TSR_P1 = "https://www.thestudentroom.co.uk/showthread.php?t=7534949";
const TSR_P6 = "https://www.thestudentroom.co.uk/showthread.php?t=7534949&page=6";
const TSR_P29 = "https://www.thestudentroom.co.uk/showthread.php?t=7534949&page=29";
const JTP_IMMERSIVE = "https://www.jobtestprep.co.uk/hsbc-online-immersive-assessment";
const GAP_HSBC = "https://www.gameassessmentprep.com/employers/hsbc";

export const hsbc: FirmProfile = {
  slug: "hsbc",
  name: "HSBC UK",
  sector: "Banking / financial services",
  programmes: [
    {
      name: "Degree Apprenticeship: Commercial Banking (CMB)",
      level: "Level 6",
      degree: "BSc (Hons) Financial Services Management, London Institute of Banking & Finance (candidate-reported)",
      locations: ["Birmingham", "London", "Manchester (2025 cycle)"],
    },
    {
      name: "Degree Apprenticeship: Asset Management and Global Private Banking (2025 cycle)",
      level: "Level 6",
      degree: "BSc Financial Services Management via LIBF (candidate-reported; one applicant suggested Finance & Investment for Asset Management)",
      locations: ["London"],
    },
    {
      name: "Degree Apprenticeship: Wealth and Personal Banking (Retail), e.g. Leeds",
      level: "Level 6",
      degree: "BSc Financial Services Management via LIBF (candidate-reported)",
      locations: ["Leeds (2026 start listed on Find an Apprenticeship)"],
    },
    {
      name: "Digital Business Services: Data, Cyber, Engineering",
      level: "Level 6",
      locations: ["Sheffield"],
    },
  ],
  entry: {
    other:
      "Varies by programme; A-level/UCAS requirements not retrievable from the official page. Applicants use the talent community and the careers site. Salary reported for 2025: just under GBP 26k outside London, about GBP 28k in London (single candidate, unverified).",
    source: TSR_P29,
  },
  timeline: {
    opens: "2025 cycle opened October 2024 (several routes, Asset Management and Private Banking closing within weeks). Expect roughly October for the next cycle; HSBC posts to its talent community first.",
    rolling: true,
    notes:
      "HSBC reviews rolling and may close before the printed deadline once places fill (aggregator claim). One applicant received the Simulate feedback report the day after taking the assessment. Start dates and places can change, so keep a backup option.",
    source: TSR_P1,
  },
  stages: [
    {
      order: 1,
      name: "Online application",
      format:
        "Official early-careers guide: 10-15 minutes, eligibility questions, possibly a CV, adjustment requests, optional equal-opportunities data. One application only per cycle reported.",
      durationMins: 15,
      tips: [
        "Apply early: rolling process and places can fill before the published close.",
        "Pick your division deliberately (Commercial, Asset Management, Private Banking, Digital).",
      ],
      source: H_GUIDE,
      confidence: "official",
    },
    {
      order: 2,
      name: "Simulate online assessment (video and behavioural simulation)",
      format:
        "Official: online assessment (~90 minutes quoted for graduates; ~40 minutes per assessment section) using audio/video content, mock emails, data tables, graphs, short written and video responses. Candidates for the DA route report situational questions plus recorded video answers, and received a written feedback report (2 strengths and 1 area to improve) rather than a pass/fail. Valid for 7 days after the invitation.",
      provider: "Cappfinity (HSBC-built immersive simulation); video via Modern Hire/HireVue (prep-site claims)",
      durationMins: 90,
      passMarkNotes: "Feedback report does not say whether you are through; outcome arrives separately.",
      tips: [
        "Use HSBC's Practice Zone / Candidate Zone (official) before starting.",
        "Answer video responses in STAR structure and weave in HSBC's four values.",
        "Complete the whole simulation in one sitting with a laptop, camera and mic tested.",
      ],
      source: H_GUIDE,
      confidence: "official",
    },
    {
      order: 3,
      name: "Technical assessment (Digital Business Services routes only)",
      format:
        "Coding assessment on Codility after Simulate. Reports from the 2025 data/engineering applicants: 3 questions in 100 minutes (Python pandas and SQL for data) or 4 tasks in 160 minutes (two in Java; an in-tool AI helper was available). Feedback received was generic development tips.",
      provider: "Codility",
      durationMins: 100,
      tips: ["Read the language requirements in each task; one engineering applicant was surprised by forced Java questions.", "Finish complete solutions to easier questions rather than half-answering all."],
      source: TSR_P6,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 4,
      name: "Final interviews (no assessment centre reported for banking routes) / Virtual Experience Day (tech)",
      format:
        "Banking routes (2025 Global Private Banking, London): candidate reports a final stage of three interviews with no separate assessment centre ('There's no AC for HSBC'). Digital/engineering routes go to a Virtual Experience Day. The official guide for graduates lists a ~3 hour assessment centre with multiple interviews and practical exercises, mostly virtual, so prepare for variation.",
      durationMins: 180,
      tips: [
        "Research your specific division and quote it in answers: applicants call the questions generic but advise tying answers to the programme and division.",
        "Prepare for three back-to-back interviews rather than a group exercise, but be ready for exercises in case the format changes.",
      ],
      source: TSR_P6,
      confidence: "single-report",
    },
  ],
  oa: {
    provider: "Cappfinity (built for HSBC); candidate-reported Simulate stage",
    tests: [
      { name: "Project Kick-Off", format: "Situational judgement, 4 questions", items: 4 },
      { name: "Global Engagement", format: "Situational judgement on communication and conflict, 4 questions", items: 4 },
      { name: "Data Monitoring", format: "Mixed cognitive (data interpretation) and SJT, 10 questions", items: 10 },
      { name: "Navigating Competing Commitments", format: "Cognitive and SJT on multitasking, 9 questions", items: 9 },
      { name: "Pause and Reflect", format: "SJT and personality profiling, 11 questions", items: 11 },
    ],
    styleNotes:
      "Prep sites describe 38 questions in total (16 cognitive: numerical, verbal, inductive; 22 SJT/personality), presented as tiles unlocked in sequence, with 5-6 information sources (tables, graphs, text) for cognitive sections and 1-5 ranking responses for SJT. Officially untimed but expect ~40-90 minutes. Some routes add short video answers and an email-writing task. Write original look-alike items as work scenarios with mock inbox data, then rank four actions against 'succeed together' and 'take responsibility'. Structure is from prep sites, not HSBC, so treat the item counts as approximate.",
    source: JTP_IMMERSIVE,
    confidence: "single-report",
  },
  videoInterview: {
    text:
      "Pre-recorded video responses are embedded in the Simulate assessment (short video answers to scenarios). Questions are on-demand; retakes may or may not be allowed per on-screen instructions. Candidate 2025: 'situational questions and video interviews (both proper interview and situational questions)'.",
    source: GAP_HSBC,
    confidence: "multiple-candidate-reports",
  },
  assessmentCentre: {
    text:
      "For banking DA routes, a 2025 candidate reports there is no assessment centre (three interviews instead). Official graduate guide says a 3-hour mostly virtual assessment centre, so it may apply to other programmes.",
    source: TSR_P6,
    confidence: "single-report",
  },
  finalInterview: {
    text: "Reported for Global Private Banking (London, 2025): three interviews on the final day. Questions described as quite generic; research the programme and division.",
    source: TSR_P6,
    confidence: "single-report",
  },
  values: [
    "We value difference",
    "We succeed together",
    "We take responsibility",
    "We get it done",
  ],
  questions: [
    {
      stage: "Simulate online assessment (video and behavioural simulation)",
      question: "Given a real-work scenario, record a video response to each specific situation (behavioural style); one task also required typing an email reply.",
      type: "situational",
      source: "https://www.glassdoor.com/Interview/In-the-job-simulation-assessment-you-ll-be-given-a-real-work-scenario-then-ask-you-to-give-video-responses-regarding-of-e-QTN_2429388.htm",
      confidence: "single-report",
    },
    {
      stage: "Final interviews (no assessment centre reported for banking routes) / Virtual Experience Day (tech)",
      question: "Interview questions were generic motivation/competency questions; candidates advise referencing the specific programme and division.",
      type: "motivation",
      source: TSR_P1,
      confidence: "single-report",
    },
  ],
  specificAdvice: [
    "Apply in the first week or two: HSBC's DA routes reviewed rolling and some (Asset Management, Private Banking) closed within weeks in 2025.",
    "Do the Candidate Zone practice before the Simulate assessment; it is the official rehearsal for the exact interface.",
    "Treat the feedback report (2 strengths, 1 improvement) as developmental only; it does not say you passed.",
    "For Digital Business Services, drill Python/pandas, SQL and Java on Codility-style tasks with a 100-160 minute limit.",
    "Prepare division-specific answers (Commercial Banking vs Private Banking vs Asset Management); candidates say questions are generic so specificity differentiates you.",
    "Map your STAR stories to 'succeed together' and 'take responsibility', the values the situational items are scored against.",
    "Keep a backup application: one thread reported HSBC withdrawing some 2025 starts.",
  ],
  officialLinks: [H_GUIDE, H_PROGS, "https://www.hsbc.com/careers/students-and-graduates/student-opportunities/uk-degree-apprenticeship"],
  lastVerified: "2026-09-30",
  gaps: [
    "Official HSBC page stating DA entry requirements (UCAS points / A-level subjects) could not be retrieved.",
    "Official HSBC values page could not be read; values are from prep-site and aggregator descriptions (JobTestPrep, Quizlet-style pages) and match HSBC's publicly known four values.",
    "Item-level detail of the Simulate assessment comes from prep sites, not HSBC or candidate screenshots.",
    "No verbatim interview questions for 2025 DA final interviews; Glassdoor pages were blocked.",
    "Reddit (r/UKApprenticeships, r/UKJobs) had no retrievable HSBC DA threads via search.",
    "Whether banking DA routes ever include the 3-hour assessment centre in the 2026 cycle.",
  ],
};
