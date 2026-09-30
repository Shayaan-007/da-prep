import type { FirmProfile } from "./types";

// Research date 2026-09-30.
const K_PROC = "https://www.kpmgcareers.co.uk/apprentice/applying-to-kpmg/application-process/";
const K_APPLY = "https://www.kpmgcareers.co.uk/apprentice/applying-to-kpmg/";
const K_AA = "https://www.amazingapprenticeships.com/employers/kpmg/";

export const kpmg: FirmProfile = {
  slug: "kpmg",
  name: "KPMG UK",
  sector: "Professional services (Big 4)",
  programmes: [
    { name: "Audit Apprenticeship", level: "Apprenticeship with professional qualification" },
    { name: "Tax Apprenticeship", level: "Apprenticeship with professional qualification" },
    { name: "KPMG Business Services (KBS) Apprenticeship", level: "Apprenticeship supporting internal specialist teams" },
  ],
  entry: {
    ucas: "Criteria on each programme page; KPMG encourages applications a few grades/points short, as applications are read alongside assessment performance.",
    other: "Contextual recruitment considers socio-economic circumstances.",
    source: K_AA,
  },
  timeline: {
    rolling: true,
    notes:
      "Launch Pad dates listed for Nov 2026 to May 2027 across UK locations. Offers within 2 working days of Launch Pad. Unofficial prep site suggests application window Oct-Feb for a Sept start, rolling offers, typical application to offer 6-10 weeks.",
    source: K_PROC,
  },
  stages: [
    {
      order: 1,
      name: "Explore and Apply",
      format: "About 45 minutes: non-assessed scenario-based job preview quiz, then application form on academic background and any work experience.",
      durationMins: 45,
      tips: ["Use the job preview to learn the day-to-day of the role you are applying for."],
      source: K_PROC,
      confidence: "official",
    },
    {
      order: 2,
      name: "Online assessments",
      format: "Two assessments (about 60 min total): an untimed skills assessment (~20 min) and a timed 36-minute cognitive assessment covering numerical and logical reasoning. Needs laptop/desktop and Chrome. Practice tests provided via SHL.",
      provider: "SHL (practice per KPMG); live-test provider not named",
      durationMins: 60,
      passMarkNotes: "Not published. KPMG reads assessments together with grades.",
      tips: ["Use the SHL practice tests KPMG links to.", "Answer the skills assessment naturally against KPMG's 12 strengths."],
      source: K_PROC,
      confidence: "official",
    },
    {
      order: 3,
      name: "Video interview",
      format: "Six pre-recorded questions put by an AI avatar called Leah; record answers after preparation time; about 40 minutes in total; reviewed by the student recruitment team. Question topics: skills, experience and career motivation.",
      durationMins: 40,
      tips: ["Practise six timed answers in a row; keep each concise.", "Expect motivation for the firm, the service line and the apprenticeship route."],
      source: K_PROC,
      confidence: "official",
    },
    {
      order: 4,
      name: "Launch Pad",
      format: "Half-day in-person assessment centre mixing assessed and non-assessed activities. Third-party sources report a group task on a case, an analysis exercise, a 10 min reflection/situational interview after the group task, and a ~45 min senior interview. Offer within 2 working days if successful.",
      tips: ["Prepare for a senior interview on motivation and scenarios.", "Be collaborative and structured in the group task."],
      source: K_PROC,
      confidence: "official",
    },
  ],
  oa: {
    provider: "SHL practice platform referenced by KPMG (live provider not confirmed)",
    tests: [
      { name: "Skills assessment", format: "Untimed, ~20 minutes, workplace-skills items", timeMins: 20 },
      { name: "Cognitive assessment", format: "Timed numerical and logical reasoning", timeMins: 36 },
    ],
    styleNotes: "Short and conventional: a behavioural/skills questionnaire then timed numerical and logical reasoning (chart/table interpretation and pattern/logic). Item counts not published. A separate graduate-route description (AssessmentDay) mentions a longer untimed blended test plus a 'Delivering Outcomes' job simulation with four timed video questions; this appears to differ from the apprentice page.",
    source: K_PROC,
    confidence: "official",
  },
  videoInterview: { text: "Six questions from AI avatar Leah; ~40 min in all; KPMG recruiters review later. (Graduate-route third-party text mentions 2 min prep and 2 min record per question.)", source: K_PROC, confidence: "official" },
  assessmentCentre: {
    text: "Launch Pad half-day: assessed group exercise, analysis/case task and senior interview; also meet people from your business area. Assessors score against KPMG's 12 strengths.",
    source: K_APPLY,
    confidence: "official",
  },
  finalInterview: { text: "Senior interview during Launch Pad (reported ~45 min) covering motivation and situational questions.", source: "https://www.assessmentday.co.uk/profiles/kpmg-application-process.html", confidence: "single-report" },
  values: [
    "Career motivation and learning curiosity",
    "Resilience",
    "Relationship building",
    "Effective communication",
    "Initiative",
    "Planning",
    "Results focus",
    "Critical thinking",
    "Inclusive collaboration",
    "Integrity",
    "Technical proficiency",
  ],
  questions: [],
  specificAdvice: [
    "The video interview is answered to an AI avatar and reviewed by humans later; practise talking to a screen, not a person.",
    "KPMG reads grades together with assessment results, so a strong OA can offset being a point or two short.",
    "Launch Pad offers come within 2 working days, so prepare your senior-interview examples before the day.",
    "Integrity matters: KPMG states dishonesty (including AI misuse) can lead to withdrawal and referral to professional bodies.",
  ],
  officialLinks: [K_PROC, K_APPLY, "https://www.kpmgcareers.co.uk/apprentice/"],
  lastVerified: "2026-09-30",
  gaps: [
    "No candidate-reported apprentice questions obtained: TSR, Glassdoor, Reddit and the hackingthecaseinterview pages returned 403.",
    "Cognitive test item count, live test provider and pass mark not published.",
    "Video interview prep/answer times for the apprentice version not confirmed.",
    "Launch Pad exact agenda (group case topics, analysis task) only from third-party sites; KPMG lists 12 strengths, the AssessmentDay page lists nine older behaviours.",
    "Degree level/university partners for KPMG degree apprenticeships and UCAS requirements not verified.",
  ],
};
