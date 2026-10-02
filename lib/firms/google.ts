import type { FirmProfile } from "./types";

const G_UPTREE = "https://uptree.co/opportunities/google/3586533217/";
const G_PSYCH = "https://psychometric-success.com/application-advice/internships-graduate-schemes/google-apprenticeship-program";
const G_MAKERS = "https://makers.tech/learn/apprenticeships";
const G_CAREERS = "https://www.google.com/about/careers/applications/jobs/results/113010970447487686-software-development-apprenticeship-engineering-october-2026-start";
const G_SEARCH = "https://uk.prosple.com/graduate-employers/google-uk/jobs-internships/engineering-software-development-apprenticeship";

export const google: FirmProfile = {
  slug: "google",
  name: "Google UK",
  sector: "Technology",
  programmes: [
    {
      name: "Software Development Apprenticeship (Engineering), 24 months, 12-14 week Makers bootcamp then team rotations",
      level: "Level 4 (NOT a degree apprenticeship)",
      locations: ["London"],
    },
    {
      name: "Other Google UK apprenticeships reported in search summaries (not read): Infrastructure Technician (Level 3) and Digital Business / Digital Marketer (Level 3, about 15 months, Sales or Marketing team, October 2026 start, Makers bootcamp)",
      level: "Level 3",
    },
  ],
  entry: {
    predictedGrades: "GCSE Maths and English 4-9",
    other:
      "A-level or equivalent STEM qualification; experience coding in any language; fluent English. A Level 6 'degree' route was claimed by one commercial page but is not confirmed by Google's listings.",
    source: G_UPTREE,
  },
  timeline: {
    opens: "Listings appear irregularly on Google Careers (e.g. 'Software Development Apprenticeship, Engineering, October 2026 Start')",
    closes: "2023 cycle closed 18 March 2023; 2026 cycle deadline not verified",
    rolling: false,
    notes: "Reported average 90 days to hire. Apply when a live UK apprenticeship vacancy is published on Google Careers.",
    source: G_UPTREE,
  },
  stages: [
    {
      order: 1,
      name: "Online application",
      format:
        "Via Google Careers: CV, motivational letter/short route-specific questions (why this apprenticeship, what excites you about software engineering, how you have learned about tech). Attach transcript if applicable.",
      tips: ["Link GitHub or projects; show self-directed learning."],
      source: G_SEARCH,
      confidence: "multiple-candidate-reports",
    },
    {
      order: 2,
      name: "Recruiter call and role-relevant assessment",
      format:
        "Vacancy-specific screening and assessments; technical routes may include role-relevant problem solving or coding. Google-UK-specific reports list a call with a recruiter, then a leadership/teamwork interview, a coding interview and a project interview.",
      tips: [
        "Be able to code a beginner-level problem aloud and explain your reasoning.",
        "Prepare one project you can walk through end to end.",
      ],
      source: "https://www.glassdoor.co.uk/Interview/Google-Apprenticeship-Program-Interview-Questions-EI_IE9079.0,6_KO7,29.htm",
      confidence: "single-report",
    },
    {
      order: 3,
      name: "Interviews (leadership/teamwork, coding, project)",
      format: "Series of interviews; typical Google assessment areas are role-related knowledge, general cognitive ability and 'Googleyness'/leadership. Not confirmed per round for 2026.",
      tips: ["Use STAR with numbers; Google is reported to favour data-driven results."],
      source: G_PSYCH,
      confidence: "single-report",
    },
  ],
  videoInterview: undefined,
  values: [
    "Googleyness / culture fit, emergent leadership, collaboration (candidate-reported framing)",
    "Enthusiasm for new technologies and learning; independent and team working; communication; organisation (from the listing)",
  ],
  questions: [
    {
      stage: "Interviews (leadership/teamwork, coding, project)",
      question: "Why are you interested in the Software Development apprenticeship at Google, and what are you most excited about in software engineering?",
      type: "motivation",
      source: G_SEARCH,
      confidence: "multiple-candidate-reports",
    },
    {
      stage: "Online application",
      question: "How have you learned about the tech space / tell us about your background and experiences.",
      type: "motivation",
      source: G_SEARCH,
      confidence: "multiple-candidate-reports",
    },
  ],
  specificAdvice: [
    "Know the route: Google UK's engineering apprenticeship is Level 4 with Makers, not a BSc, so frame it as a technical-skills entry route and be prepared to justify it over a degree apprenticeship elsewhere.",
    "Do coding practice beforehand (Makers' own pathway uses a Coderbyte challenge and resources before a 30-minute review) - practise in one language you can explain.",
    "Prepare a 'project walk-through' - a GitHub project you can discuss in depth.",
    "Practise emergent-leadership stories (lead when you have expertise, step back when you don't) for the teamwork round.",
    "Watch Google Careers for live UK listings; closing dates can arrive earlier than stated.",
  ],
  officialLinks: [
    G_CAREERS,
    "https://www.google.com/about/careers/applications/how-we-hire/",
    G_MAKERS,
  ],
  lastVerified: "2026-10-02",
  gaps: [
    "Re-checked 2 Oct 2026: found no evidence of a Google UK Level 6 degree apprenticeship. Google's careers pages returned only navigation text. Older read pages (a 2023 listing: STEM A-level, coding experience, closed 18 March 2023, 12-week Makers bootcamp; a 2021 listing asking for a B at A-level) are historical and requirements may have changed.",
    "The two listed 'questions' above are generic motivation prompts attributed to a Prosple listing that could not be verified.",
    "Google's own listing/How-we-hire pages returned only navigation; no official stage-by-stage detail for the UK apprenticeship obtained.",
    "Whether Google UK runs a true Level 6 degree apprenticeship - not found; treat as unavailable unless a listing appears.",
    "OA provider/format, video interview, any 2025-26 candidate-reported questions (Glassdoor/TSR/Medium blocked with 403).",
    "Interview round details above come from a search summary of Glassdoor and from older (2022-23) sources.",
    "The Makers generic pathway (Coderbyte, 30 min interview) is Makers' process for partners and may not be Google's exact flow.",
  ],
};
