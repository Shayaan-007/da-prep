import type { FirmProfile } from "./types";

// Research date 2026-09-30. Limited candidate data for Aviva degree apprenticeships: process is from Aviva's own careers site plus prep-site descriptions.
const A_TECH = "https://careers.aviva.co.uk/early-careers/apprenticeships/tech-change/";
const A_APPS = "https://careers.aviva.co.uk/early-careers/apprenticeships/";
const A_PROCESS = "https://www.graduatesfirst.com/aviva-application-process";
const A_VIDEO = "https://www.graduatesfirst.com/aviva-interviews";
const A_SST = "https://www.assessmentday.co.uk/profiles/aviva-situational-strengths-test.html";

export const aviva: FirmProfile = {
  slug: "aviva",
  name: "Aviva",
  sector: "Insurance / financial services",
  programmes: [
    {
      name: "Software Engineer Apprentice (Level 4 and Level 6 routes, applicants state a preference)",
      level: "Level 4 (about 19 months) and Level 6 (about 40-48 months)",
      degree: "BSc (Hons) Digital and Technology Solutions (Level 6)",
      locations: ["Norwich"],
    },
    {
      name: "Automation Engineer Apprentice",
      level: "Level 6 (about 40-48 months)",
      degree: "BSc (Hons) Digital and Technology Solutions",
      locations: ["Norwich"],
    },
    {
      name: "Data Engineer Apprentice",
      level: "Level 5 (foundation degree/HND equivalent, about 18 months)",
      locations: ["Norwich"],
    },
    {
      name: "Other pathways listed on the apprenticeships site: Data, Claims, Underwriting (2025), Change Management",
      level: "Varies by role (check each listing)",
      locations: ["Birmingham, Bristol, Chelmsford, Leeds, London, Manchester, Southampton (underwriting 2025 listing)"],
    },
  ],
  entry: {
    other:
      "Not retrievable from official pages (403 on Aviva's process pages). Prep sites suggest role-specific criteria. The Norwich tech pages say Software Development suits people who think logically, enjoy problem solving and have some coding knowledge.",
    source: A_TECH,
  },
  timeline: {
    closes: "2026 Software Engineer (Norwich) listing closed on 16 March 2026 (Find an Apprenticeship); the 2027 date was not found",
    notes:
      "Direct Line Group is now part of Aviva and its careers site redirects to careers.aviva.co.uk, so Norwich tech apprenticeship pages appear under Aviva. The gov.uk Find an Apprenticeship listing shows the 2026 Software Engineer vacancy closed on 16 March 2026 (that page shows only the closure). Search summaries (not read) report Software Engineer and Underwriting both closing mid-March 2026 with a 7 September 2026 start, so Aviva's cycle looks like a September start with a mid-March close rather than 'closes when filled'. The 2027 window is not published where we could read it: expect it to open in autumn or winter 2026 (inferred).",
    source: "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000017088",
  },
  stages: [
    {
      order: 1,
      name: "Online application",
      format:
        "Attach a CV and answer a short questionnaire about why you are interested in the programme, what you enjoy doing, what you are good at, and how you connect with Aviva's values.",
      tips: ["Write your values answer with specific examples of care, community and confidence."],
      source: A_PROCESS,
      confidence: "single-report",
    },
    {
      order: 2,
      name: "Online tests",
      format:
        "Situational Strengths test (scenarios showing how you like to work and your thought process, may include short videos). Depending on role you may also sit numerical reasoning and, for tech roles, a coding test. A minimum score (top ~50% of applicants, prep-site claim) is needed.",
      provider: "Not officially named; prep sites mention Talent Q reasoning tests",
      passMarkNotes: "Prep-site claim: applicants need a score placing them in roughly the top half; varies by role.",
      tips: [
        "Practise SJT-style strengths questions and numerical reasoning.",
        "For Software/Automation/Data roles, prepare a coding test in a mainstream language.",
      ],
      source: A_SST,
      confidence: "single-report",
    },
    {
      order: 3,
      name: "Video interview",
      format:
        "Pre-recorded HireVue-style interview: a practice question, then strengths-based questions. Reports conflict and mostly describe the graduate route: about 5-6 questions at 1-2 minutes each (GraduatesFirst), or 5 questions with 2 minutes' preparation and 2 minutes to answer, about 30 minutes overall (a Glassdoor summary, search summary only). Live Teams interviews are possible depending on role. The apprenticeship format is not confirmed.",
      provider: "HireVue",
      durationMins: 30,
      tips: ["Use STAR+R (situation, task, action, result, reflection) and reference Care, Community and Confidence.", "Answer strengths questions honestly: what energises you, what you are good at."],
      source: A_VIDEO,
      confidence: "single-report",
    },
    {
      order: 4,
      name: "Assessment day",
      format:
        "Insight into working at Aviva and meeting colleagues. Prep-site description: second interview, group exercise and tasks such as a written exercise, a meeting or a presentation; assessors look at how you form relationships and contribute to a team.",
      tips: ["Ask colleagues questions and be visibly collaborative; group exercises assess how you contribute to a team.", "Prepare a short talk on a topic of your choice in case a presentation is set."],
      source: A_SST,
      confidence: "single-report",
    },
  ],
  oa: {
    provider: "Aviva Situational Strengths test (vendor not named by Aviva); Talent Q-type numerical/critical reasoning (prep site)",
    tests: [
      { name: "Situational Strengths Test", format: "Scenario text (sometimes with video) with multiple-choice responses about how you would act", notes: "Item count and time limit not found." },
      { name: "Numerical / Critical reasoning", format: "Role-dependent numerical or critical reasoning", notes: "Item count and timing not found." },
      { name: "Coding test", format: "Role-dependent coding assessment for technology pathways", notes: "Provider and language not found." },
    ],
    styleNotes:
      "Situational-strengths items present a short workplace scenario and ask which responses fit you best, scored against Aviva's strengths and values; some use short videos to set the scene. Reasoning tests follow Talent Q-style tables and text. Because Aviva publishes little, write look-alike items as short workplace dilemmas with 4 response options that reveal a preference (for example balance between asking for help and acting independently).",
    source: A_SST,
    confidence: "single-report",
  },
  videoInterview: {
    text:
      "Practice question then 5-6 strengths-based questions, about 1-2 minutes each, 20-30 minutes total; the video interview screens candidates for the assessment day.",
    source: A_VIDEO,
    confidence: "single-report",
  },
  assessmentCentre: {
    text:
      "In-person or virtual assessment day: interview, group exercise and tasks such as written exercise, meeting or presentation.",
    source: A_SST,
    confidence: "single-report",
  },
  finalInterview: {
    text: "A second interview takes place during the assessment day (prep-site description); format not confirmed by Aviva.",
    source: A_SST,
    confidence: "single-report",
  },
  values: [
    "Care",
    "Community",
    "Confidence",
    "Commitment (prep sites list four values: Commitment with courage and ownership, Care, Community, Confidence)",
  ],
  questions: [],
  specificAdvice: [
    "The video interview is strengths-based: prepare answers about what you enjoy, what you are good at and how you behave at your best, not just competency stories.",
    "Technology apprentices are based in Norwich: confirm the location works for you and decide between Level 4 and Level 6 routes at application.",
    "Show knowledge of Aviva plus Direct Line Group now part of Aviva: the tech apprenticeship pages have moved across.",
    "Practise Situational Strengths and numerical tests because a minimum score screens you before the video stage.",
    "Learn Aviva's values (Care, Community, Confidence, Commitment) and have one specific example for each.",
  ],
  officialLinks: [A_APPS, A_TECH, "https://careers.aviva.co.uk/apply/application-process/"],
  lastVerified: "2026-10-02",
  gaps: [
    "Re-checked 2 Oct 2026: careers.aviva.co.uk pages still returned 403, so nothing here comes from a direct read of Aviva's own pages. The only official read was the gov.uk listing, which shows just the 16 March 2026 closure (search summaries say 15 March).",
    "Two motivation questions (why this role at Aviva; why a career in this industry) appear in Glassdoor summaries for the graduate route, but the exact source page could not be identified, so they are not listed.",
    "Official Aviva application process and entry requirements for degree apprenticeships: careers pages returned 403 or a redirect; process details come from prep sites.",
    "Candidate-reported real questions for any stage: no Aviva apprenticeship threads found on TSR, Reddit or Glassdoor.",
    "Item counts and timings for the Situational Strengths, numerical and coding tests.",
    "Vendor of the assessments (Talent Q mention is unverified).",
    "Application opening dates for 2026-27 and whether Aviva offers non-Norwich degree apprenticeships.",
    "Official Aviva values list from aviva.com (Commitment may be outdated).",
  ],
};
