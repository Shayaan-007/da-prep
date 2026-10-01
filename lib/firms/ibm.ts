import type { FirmProfile } from "./types";

const IBM_PROCESS = "https://www.amazingapprenticeships.com/employers/ibm/";
const IBM_APPLY = "https://www.ibm.com/uk-en/careers/application-process";
const IBM_2026 = "https://talents.studysmarter.co.uk/companies/ibm/technology-level-6-digital-and-technology-solutions-degree-apprenticeship-2026-30177994/";
const IBM_BLACKPOOL = "https://sites.google.com/blackpoolsixth.ac.uk/futures/apprenticeships/ibm";
const IBM_GDJ = "https://www.graduate-jobs.com/interviews/company/ibm";

export const ibm: FirmProfile = {
  slug: "ibm",
  name: "IBM UK",
  sector: "Technology / consulting",
  programmes: [
    {
      name: "Digital & Technology Solutions Degree Apprenticeship (IT Consultant / Software Engineer / Cyber / Data pathways)",
      level: "Level 6",
      degree: "BSc (Hons) Digital & Technology Solutions",
      locations: ["Manchester", "London"],
    },
    {
      name: "Public Sector Junior Management Consultant",
      level: "Level 4",
      locations: ["UK (client-facing, public sector)"],
    },
  ],
  entry: {
    ucas: "Minimum 120 UCAS points (2026 start advert)",
    predictedGrades: "GCSE Maths and English grade 4+ (2026 advert)",
    other:
      "Right to work in England without sponsorship; must not have started/completed a similar degree or apprenticeship; STEM subject preferred not mandatory; must live within commuting distance and be office-based (if not on client site) min. 3 days/week.",
    source: IBM_2026,
  },
  timeline: {
    opens: "Advert for Sept 2026 start gave an application deadline of 4 March 2026 (may close earlier on volume)",
    closes: "4 March 2026 (2026 cycle, per third-party advert)",
    rolling: true,
    notes:
      "The 2026 advert says a full application form must be submitted within 48 hours of the initial quick application. Assessment centres ('exploration sessions') have historically run around February for some roles and are mandatory with fixed dates. Start date 7 Sept 2026.",
    source: IBM_2026,
  },
  stages: [
    {
      order: 1,
      name: "Initial application",
      format:
        "Quick online initial application, followed by a full application form (2026 advert: complete the full form within 48 hours). Amazing Apprenticeships advises using the full word count to sell yourself and describes IBM professionals screening applications.",
      tips: [
        "Complete the full form promptly after the quick application - the 48-hour window is stated on the 2026 advert.",
        "Use the whole word count and give a variety of examples, per IBM's own guidance as relayed by Amazing Apprenticeships.",
      ],
      source: IBM_PROCESS,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 2,
      name: "Online assessment",
      format:
        "Online assessment in which IBM's careers site says may include coding, video and English-language assessments depending on role. Third-party summaries for the UK apprenticeship describe an online cognitive ability test. Exact UK apprentice content is not officially published.",
      provider: "IBM (in-house/Kenexa-family platform reported by prep sites - unverified for UK apprentices)",
      tips: [
        "Expect timed numerical/logical-style items; practise speed, as older candidate reports say to be quick at maths.",
        "Do it in a quiet place on a laptop; IBM's AI policy prohibits using AI to complete assessments.",
      ],
      source: IBM_APPLY,
      confidence: "single-report",
    },
    {
      order: 3,
      name: "Exploration session (assessment centre)",
      format:
        "Briefing (not assessed), then a group exercise/discussion and one or more interviews (~45 minutes for the interview per a TSR summary), plus a chance to meet existing apprentices. Amazing Apprenticeships lists a group exercise and a manager interview. Group exercise assessed on communicating effectively, understanding customer needs and creating opportunities to collaborate.",
      tips: [
        "In the group exercise, draw quieter members in and tie ideas back to the 'customer' - assessors mark client focus and collaboration.",
        "Dates are fixed and mandatory, so check availability before applying.",
      ],
      source: IBM_BLACKPOOL,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 4,
      name: "Business / matching interview",
      format:
        "Interview with a business manager combining job-related, behavioural and situational questions; successful candidates enter a matching pool and are aligned to a role/team then interviewed by that team's manager (reported by candidates).",
      tips: [
        "Have 6-8 STAR stories mapped to IBM's eight attributes.",
        "Research the client/industry areas IBM works in and be ready to say which pathway (consulting vs software) you want and why.",
      ],
      source: IBM_PROCESS,
      confidence: "multiple-candidate-reports",
    },
  ],
  oa: {
    provider: "Not officially published for UK apprentices; IBM's own careers page says coding, video and English-language assessments may apply by role",
    tests: [
      {
        name: "Cognitive ability test",
        format: "Timed online reasoning (numerical / logical style) - reported by third-party summaries of the UK apprenticeship route",
        notes: "Third-party sites quote figures (e.g. 100 minutes total, 30 questions in 20 minutes) that are not verifiable for UK apprentices - treat as unconfirmed.",
      },
    ],
    styleNotes:
      "Write look-alike practice as fast numerical series/word-problem items and logical/diagrammatic pattern questions with tight per-question time (older candidate reports: ~2 minutes per question numerical/abstract). Also practise answering on-camera video questions and a short English-language exercise.",
    source: IBM_APPLY,
    confidence: "single-report",
  },
  videoInterview: {
    text: "IBM's careers site lists a video assessment where you answer interview questions using webcam and microphone as one possible online assessment depending on role. Not confirmed as used for the degree apprenticeship in the 2026 cycle.",
    source: IBM_APPLY,
    confidence: "official",
  },
  assessmentCentre: {
    text: "'Exploration session': non-assessed briefing, group exercise (~45 mins per TSR summary) and interview (~45 mins), meet current apprentices. Older graduate reports also mention presentations and practical team tasks (e.g. tower-building).",
    source: IBM_BLACKPOOL,
    confidence: "multiple-candidate-reports",
  },
  finalInterview: {
    text: "Business interview with job-related, behavioural and situational questions; then matching to a team and interview with that manager (candidate reports).",
    source: IBM_PROCESS,
    confidence: "multiple-candidate-reports",
  },
  values: [
    "Adaptability",
    "Communication",
    "Client focus",
    "Creative problem solving",
    "Drive",
    "Teamwork",
    "Passion for IBM",
    "Taking ownership",
    "Celebration of individuality / curiosity / turning problems into possibility (IBM's three pillars per Amazing Apprenticeships)",
  ],
  questions: [
    {
      stage: "Exploration session (assessment centre)",
      question: "Describe an occasion where you have thought outside the box to come up with a new way of doing something.",
      type: "competency",
      competency: "Problem solving",
      source: IBM_GDJ,
      confidence: "single-report",
    },
    {
      stage: "Exploration session (assessment centre)",
      question: "What are your weaknesses?",
      type: "competency",
      source: IBM_GDJ,
      confidence: "single-report",
    },
    {
      stage: "Business / matching interview",
      question: "What are your long-term goals and what value would you bring to the organisation?",
      type: "motivation",
      source: IBM_GDJ,
      confidence: "single-report",
    },
  ],
  specificAdvice: [
    "Build answers around IBM's eight attributes (adaptability, communication, client focus, creative problem solving, drive, teamwork, passion for IBM, ownership) - they are the published assessment criteria.",
    "In the group exercise treat a 'customer' as the third party in the room: state their need early and come back to it; this maps to the published client-focus criterion.",
    "Submit the full application inside the 48 hours after the quick application and apply early - 2026 advert says it may close before the 4 March deadline.",
    "Practise quick mental arithmetic and number series; older reports stress speed in early screening.",
    "Decide between pathways (software engineer vs IT consultant vs public-sector consulting) before the matching interview.",
  ],
  officialLinks: [
    "https://www.ibm.com/uk-en/careers/application-process",
    "https://www.ibm.com/uk-en/careers/apprenticeships",
    "https://www.amazingapprenticeships.com/employers/ibm/",
  ],
  lastVerified: "2026-09-30",
  gaps: [
    "Exact UK apprentice online assessment provider, item counts and timings (prep-site claims of IPAT/Kenexa/Cognify/100 minutes are unverified for apprentices).",
    "The Student Room and Glassdoor returned HTTP 403, so 2025-26 candidate threads were only seen as search snippets; no verbatim 2025/26 questions captured.",
    "Whether a video interview is part of the current apprenticeship cycle.",
    "Pass marks, exact exploration-session timetable, and current (2027 intake) opening dates.",
    "Level 4 JMC entry requirements not captured.",
    "Only graduate-era (2017-18) interview questions are attributed on Graduate-jobs.com; reliability for 2026 is low.",
  ],
};
