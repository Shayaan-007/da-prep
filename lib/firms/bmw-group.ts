import type { FirmProfile } from "./types";

const RECRUIT = "https://www.bmwgroup.jobs/gb/en/apprentices/recruitment-process-apprentices.html";
const HIGHERIN = "https://higherin.com/jobs/43052/bmw-group-uk/register-your-interest-business-degree-apprenticeship-2027";
const GF_TESTS = "https://www.graduatesfirst.com/bmw-assessment-tests";
const GF_AC = "https://www.graduatesfirst.com/bmw-assessment-centre";
const CULTURE = "https://www.bmwgroup.jobs/nl/en/about-us/our-culture-and-values.html";
const BRIGHT = "https://www.brightnetwork.co.uk/graduate-jobs/bmw/apprentice-and-associate-training-placement-oxford-2026";

export const bmwGroup: FirmProfile = {
  slug: "bmw-group",
  name: "BMW Group UK (BMW, MINI, Rolls-Royce Motor Cars)",
  sector: "Automotive manufacturing and retail",
  programmes: [
    {
      name: "Business Degree Apprenticeship (finance, marketing, HR, business operations)",
      level: "Level 6 (Level 3 to 6 depending on role)",
      degree: "Business and Management (earlier listing: BA (Hons) Management and Business)",
      locations: ["Oxford (MINI Plant)", "Hams Hall (Birmingham)", "Swindon", "Farnborough", "Chichester/Goodwood"],
    },
    { name: "Level 6 IT and engineering-type degree apprenticeships (e.g. Level 6 IT at MINI Plant Oxford; control engineer, Coleshill)", level: "Level 6" },
  ],
  entry: {
    other:
      "No CV at application. Per-role requirements sit in each advert; generic Level 6 norm is about 112-120 UCAS points plus GCSE Maths and English (not BMW-specific). The 2027 business degree apprenticeship is 'register your interest', not yet open.",
    source: HIGHERIN,
  },
  timeline: {
    notes:
      "Earlier cycle: AC provisionally week commencing 10 March 2025 (BMW job listing). Online assessment must be completed within 5 days of invitation; video interview window reported as five days. Reports say decisions 2-3 weeks after the AC; whole process can take up to about six months. Opening dates for 2027 not confirmed.",
    rolling: true,
    source: RECRUIT,
  },
  stages: [
    {
      order: 1,
      name: "Online application",
      format: "Online form; eligibility check; no CV needed.",
      tips: ["Apply early since recruitment is continuous for some roles."],
      source: RECRUIT,
      confidence: "official",
    },
    {
      order: 2,
      name: "Online assessment",
      format: "Online tests sent after application, to complete within 5 days. Reported to include an SJT plus numerical, verbal and abstract reasoning; a commercial source says numerical/verbal/abstract are combined in a Criteria RCAT of 51 questions in 20 minutes.",
      provider: "Criteria Corp (commercial source)",
      durationMins: 20,
      tips: ["Practise timed mixed-reasoning sets (about 23 seconds per item) and do the test in one sitting."],
      source: GF_TESTS,
      confidence: "single-report",
    },
    {
      order: 3,
      name: "Video interview",
      format: "One-way recorded questions, completed any time in the invitation window; the first question is a practice and not assessed.",
      tips: ["Use the practice question to check your camera and framing."],
      source: RECRUIT,
      confidence: "official",
    },
    {
      order: 4,
      name: "Assessment centre",
      format: "Face-to-face at a UK site (Oxford, Hams Hall, Swindon): interview, group activity and presentation. Notification reported 7-10 days before the date.",
      tips: ["Prepare a presentation around BMW business topics and the role; topics are reported as given in advance or on the day."],
      source: RECRUIT,
      confidence: "official",
    },
  ],
  oa: {
    provider: "Criteria Corp (commercial source; not confirmed by BMW)",
    tests: [
      { name: "Situational Judgement Test", format: "Workplace scenarios, choose best/worst action.", notes: "Length not confirmed." },
      { name: "Combined reasoning (numerical, verbal, abstract)", format: "Mixed multiple choice", items: 51, timeMins: 20, notes: "Commercial source describing an RCAT-style test; unconfirmed for the UK apprenticeship." },
    ],
    styleNotes:
      "Fast mixed-reasoning battery (roughly 23 seconds per question) combining short numerical problems, short verbal logic items and abstract pattern matrices, plus an SJT aligned to BMW values. Write original look-alikes for each section and time them tightly.",
    source: GF_TESTS,
    confidence: "single-report",
  },
  videoInterview: {
    text: "Recorded answers to a set of questions within a five-day window; first question is an unassessed practice. Question count, prep and answer time not published.",
    source: RECRUIT,
    confidence: "official",
  },
  assessmentCentre: {
    text:
      "Official page: interview, group activity and presentation, face-to-face. A commercial guide adds a roleplay (about 30 min), a presentation of about 30 minutes (topic 7+ days ahead or same day) and a 30-40 minute group exercise in groups of 4-6; this is general BMW Group rather than UK-apprentice-specific.",
    source: GF_AC,
    confidence: "single-report",
  },
  finalInterview: {
    text: "Competency-based interview at the assessment centre exploring motivation, strengths and values fit.",
    source: GF_AC,
    confidence: "single-report",
  },
  values: ["Responsibility", "Appreciation", "Transparency", "Trust", "Openness"],
  questions: [],
  specificAdvice: [
    "Complete the video interview early in its window; use the unassessed first question to fix your setup.",
    "Prepare to tie answers to BMW's values of Responsibility, Appreciation, Transparency, Trust and Openness.",
    "Get to know the site you apply to (MINI Plant Oxford, Hams Hall engines, Swindon pressings) and the business area: the AC is at a UK site.",
    "Notice periods are short (7-10 days) so pre-build a presentation template.",
  ],
  officialLinks: [RECRUIT, "https://www.bmwgroup.jobs/gb/en/apprentices.html", CULTURE],
  lastVerified: "2026-09-30",
  gaps: [
    "BMW page could not be fetched directly (404/timeouts); the three-step process and five-day windows come from search extracts of the official page and a BMW job listing (" + BRIGHT + ").",
    "OA provider and item counts are from a commercial source describing BMW Group in general.",
    "No candidate-reported interview questions or AC details found for UK degree apprentices; Student Room BMW threads were not readable.",
    "2027 opening dates and per-role entry requirements not confirmed.",
    "Source for values is a search result summarising BMW's culture page.",
  ],
};
