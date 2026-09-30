// Sector packs. The application process is shared across degree apprenticeships; these describe what differs.
// Standard names and requirements change: always confirm on IfATE (instituteforapprenticeships.org) and the advert.

import type { Category } from "@/lib/questions";

export const SECTOR_IDS = ["digital", "engineering", "finance", "law", "business", "construction", "public"] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

export type Sector = {
  id: SectorId;
  name: string;
  blurb: string;
  examples: string[];
  differs: string[];
  tests: Category[];
  showcase: string[];
  promptHint: string;
  sampleAd: string;
};

export const SECTORS: Sector[] = [
  {
    id: "digital",
    name: "Digital and technology",
    blurb: "Software, data, cyber security and IT roles.",
    examples: [
      "Digital and Technology Solutions Professional (Level 6, e.g. software engineering pathway)",
      "Data scientist",
      "Cyber security technical professional",
    ],
    differs: [
      "Interviews often include problem-solving questions and sometimes a small technical or logic task.",
      "Logical and numerical aptitude tests are common.",
      "Employers look for genuine interest in technology outside school: projects, clubs, self-teaching.",
    ],
    tests: ["logical", "numerical", "sjt"],
    showcase: ["A project you built or fixed", "How you learn a new tool", "Explaining something technical simply"],
    promptHint:
      "Include a question on problem solving with technology, one on interest in tech beyond school (projects, self-teaching), and one on explaining something technical simply. Do not ask for code.",
    sampleAd:
      "Example Ltd: Digital and Technology Solutions Degree Apprentice (Software Engineering, Level 6). Join our platform team building internal web tools. You will study part-time for a BSc while working alongside engineers, learning to write, test and deploy software. We want curious problem solvers who enjoy logic and working in teams. Requirements: 112 UCAS points, ideally including maths or a computing-related subject.",
  },
  {
    id: "engineering",
    name: "Engineering",
    blurb: "Civil, mechanical, electrical, aerospace, systems and manufacturing.",
    examples: ["Civil engineer (degree)", "Mechanical, electrical and manufacturing engineering degrees", "Systems engineer"],
    differs: [
      "Maths and physics or other STEM grades are often specified in the advert.",
      "Numerical, logical and sometimes mechanical reasoning tests are common.",
      "Degree apprenticeships can lead towards professional engineering registration through a professional body.",
      "Safety awareness and practical teamwork are valued.",
    ],
    tests: ["numerical", "logical", "sjt"],
    showcase: ["Building or fixing something", "Working safely", "Teamwork on a practical project"],
    promptHint:
      "Include a question about a practical or engineering-style problem the candidate has tackled, one about safety or attention to detail, and one about teamwork on a project.",
    sampleAd:
      "Example Engineering Ltd: Mechanical Engineering Degree Apprentice (Level 6). Spend four days a week on site rotating through design, manufacturing and testing, with one day at university towards a BEng. You will learn to apply maths and physics to real products and work safely in a team. Requirements: A-levels including maths and a science (or equivalent), strong problem-solving skills and a safety-first attitude.",
  },
  {
    id: "finance",
    name: "Finance and accountancy",
    blurb: "Accountancy, tax, banking and financial services.",
    examples: ["Accountancy or taxation professional (Level 7)", "Banking and financial services degree apprenticeships"],
    differs: [
      "Numerical tests carry a lot of weight, plus situational judgement tests.",
      "Commercial awareness questions: what is happening in business and the economy, and why it matters.",
      "Professional exams (e.g. accountancy bodies) may be studied alongside the degree.",
    ],
    tests: ["numerical", "sjt", "verbal"],
    showcase: ["Handling numbers accurately", "Following business news", "Responsibility with money or data"],
    promptHint:
      "Include a commercial awareness question (a recent business or economic news story and why it matters), one about accuracy and attention to detail, and one about motivation for finance.",
    sampleAd:
      "Example Advisory LLP: Accountancy Degree Apprentice. Train towards a professional accountancy qualification while working on real client audits and accounts. You'll study part-time, sit professional exams and build a career in finance without university fees. We want numerate, accurate, commercially curious people. Requirements: strong GCSE maths and English, 120 UCAS points.",
  },
  {
    id: "law",
    name: "Law",
    blurb: "Solicitor and legal executive routes.",
    examples: ["Solicitor (Level 7)", "Chartered legal executive"],
    differs: [
      "Very competitive, and firms often offer only a few places.",
      "Commercial awareness and critical thinking tests are common, with a strong focus on verbal reasoning.",
      "Expect questions about why law and why this firm, and current affairs.",
      "The route is long and involves professional legal qualifications.",
    ],
    tests: ["verbal", "sjt", "logical"],
    showcase: ["Debating or writing", "Careful reading and argument", "Discretion and integrity"],
    promptHint:
      "Include a question on why law and why an apprenticeship route, one on a current affairs or commercial awareness topic, and one testing careful argument or integrity.",
    sampleAd:
      "Example Law LLP: Solicitor Degree Apprentice (Level 7 route). Work in our commercial team while studying for a law degree and preparing for qualification as a solicitor. We're looking for sharp communicators with strong written skills, commercial curiosity and integrity. Requirements: strong A-levels in essay-based subjects, excellent English.",
  },
  {
    id: "business",
    name: "Business and management",
    blurb: "Chartered manager, project management, HR, marketing and operations.",
    examples: ["Chartered manager", "Project manager (degree)", "Digital marketer"],
    differs: [
      "Fewer technical tests: more emphasis on teamwork, leadership and situational judgement.",
      "Strengths-based and motivation questions are common.",
      "Broad roles, so your examples matter more than specific subjects.",
    ],
    tests: ["sjt", "verbal", "numerical"],
    showcase: ["Leading or organising a group", "Managing priorities", "Communicating clearly"],
    promptHint:
      "Include a question about leading or organising a group, one about managing competing priorities, and one about why this kind of business role.",
    sampleAd:
      "Example Group plc: Business Management Degree Apprentice (Level 6, Chartered Manager). Rotate through operations, project and people teams while studying part-time for a management degree. We're looking for organised, positive team players who take initiative. Requirements: 112 UCAS points in any subjects, strong communication skills.",
  },
  {
    id: "construction",
    name: "Construction and property",
    blurb: "Surveying, site management and built-environment roles.",
    examples: ["Chartered surveyor", "Construction site management (degree)", "Civil engineer (degree)"],
    differs: [
      "Health and safety matters a lot and often features in interviews and tests.",
      "Site visits and practical exposure are a big part of the job.",
      "Professional bodies (e.g. for surveyors) are part of the route.",
    ],
    tests: ["sjt", "numerical", "logical"],
    showcase: ["Practical or outdoors experience", "Safety attitude", "Reliability and teamwork"],
    promptHint:
      "Include a question about safety and responsibility, one about working in a practical team on a deadline, and one about interest in the built environment.",
    sampleAd:
      "Example Construction Ltd: Construction Site Management Degree Apprentice (Level 6). Learn on live building sites while studying part-time for a degree in construction management. You'll coordinate teams, programme work and keep people safe. We want reliable, practical people who communicate well. Requirements: 112 UCAS points, strong GCSE maths and English.",
  },
  {
    id: "public",
    name: "Public sector and policing",
    blurb: "Civil Service, police and other public service roles.",
    examples: ["Civil Service Fast Track Apprenticeship", "Police constable degree apprenticeship"],
    differs: [
      "Assessment often follows a published framework of behaviours and strengths: read it and match your examples.",
      "Situational judgement tests are very common.",
      "Police roles involve extra checks such as vetting and fitness.",
    ],
    tests: ["sjt", "verbal", "numerical"],
    showcase: ["Helping or serving others", "Fairness and integrity", "Staying calm under pressure"],
    promptHint:
      "Include a question about fairness or integrity, one about staying calm under pressure, and one about why public service.",
    sampleAd:
      "Example Public Body: Policy and Delivery Degree Apprentice. Work on real projects that affect communities while studying part-time for a degree. We value integrity, teamwork and clear communication. The selection process includes an online test, a video interview and an assessment day assessed against published behaviours.",
  },
];

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s])) as Record<SectorId, Sector>;

/** What is the same in every degree apprenticeship versus what changes. */
export const SHARED = [
  "The stages: online application, online tests, video interview, assessment centre, offer.",
  "Who you apply to: the employer directly, not UCAS. No national deadline.",
  "Core skills: STAR examples, motivation for the apprenticeship route, teamwork, communication, resilience.",
  "Test formats: situational judgement, numerical, verbal and logical reasoning.",
  "The funding model: employer-paid wage, part-time study, no tuition fees (England).",
];
