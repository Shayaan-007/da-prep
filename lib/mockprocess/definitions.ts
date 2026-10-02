// Mock processes for the wave-1 firms. Stage order, names and timings follow lib/firms/<firm>.ts and the research in
// docs/research/03-firm-processes-wave1.md. Where the research found conflicts or no source, the stage says so in `note`.
// Reported interview questions come from the firm profiles (paraphrased candidate reports, each with its own source);
// the rest are original questions written against the firm's own values or behaviours.

import { FIRMS } from "@/lib/firms";
import {
  BAKERY_CASE,
  DELOITTE_TOPICS,
  ENGINE_CASE,
  GYM_CASE,
  LLOYDS_EMAIL,
  RECYCLING_CASE,
  RR_PRESENTATION,
} from "./cases";
import type { MockProcess, MockStage, QaPrompt } from "./types";

const firm = (slug: string) => {
  const f = FIRMS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Unknown firm ${slug}`);
  return f;
};

/** Reported questions for a firm, kept only if they read as a single standalone question. */
function reported(slug: string, stage: RegExp, max = 6, maxLen = 230): QaPrompt[] {
  return firm(slug)
    .questions.filter((q) => stage.test(q.stage) && q.question.length < maxLen && !/^(Reported in|Common questions)/.test(q.question) && !/\(reported/.test(q.question))
    .slice(0, max)
    .map((q) => ({ text: q.question.replace(/\s*\(BrightStart\)$/, "") }));
}

const prompts = (...texts: string[]): QaPrompt[] => texts.map((text) => ({ text }));

const framework = (slug: string, name: string, take?: number) => ({ name, items: firm(slug).values.slice(0, take) });

const APPLICATION = (stageOrder: number, summary: string, tips: string[]): MockStage => ({
  kind: "info",
  name: "Online application",
  stageOrder,
  summary,
  tips,
});

const NOT_REPLICATED = (name: string, stageOrder: number, summary: string, note: string): MockStage => ({
  kind: "info",
  name,
  stageOrder,
  summary,
  tips: ["This stage is not simulated here. Read the firm guide for what to expect and how to prepare."],
  note,
});

export const MOCKS: MockProcess[] = [
  {
    firm: "pwc",
    title: "PwC mock process",
    confidence: "multiple-candidate-reports",
    framework: framework("pwc", "The PwC Professional"),
    notes: [
      "PwC is the least certain profile: PwC's pages could not be read directly and sources conflict on stages, video format and assessment-centre length. Treat the order and timings as approximate and follow your invitation.",
    ],
    stages: [
      APPLICATION(1, "An online form with your details and qualifications. Flying Start programmes are also applied for through UCAS, and you can only make one application per cycle.", [
        "Be specific to the programme if there are motivation questions.",
        "Check you meet the university offer as well as PwC's process (Flying Start).",
      ]),
      { kind: "test", name: "Immersive job preview (situational judgement)", testId: "sjt-most-least", stageOrder: 2, note: "PwC's page describes about 15 short video scenarios; this replica uses written scenarios." },
      { kind: "test", name: "Psychometric questionnaire", testId: "work-style-forced-choice", stageOrder: 2, note: "PwC's current list includes a games-based assessment, which is not replicated; other reports describe a behavioural questionnaire and SHL cognitive tests. This stands in for the questionnaire part." },
      {
        kind: "qa",
        name: "On-demand video interview",
        mode: "video",
        stageOrder: 3,
        intro: "Questions appear on screen, and you record your answers. Reports of the format conflict (30 seconds to 3 minutes of preparation, 2 to 3 minutes to answer, 3 to 10 questions): this uses 30 seconds and 2 minutes.",
        prepSeconds: 30,
        answerSeconds: 120,
        retakes: 0,
        prompts: [
          ...reported("pwc", /Video interview/),
          ...prompts(
            "Describe a time you worked with other people to get something done at school, work or in a club. What was your part?",
            "Tell me about a time you had to learn something new quickly.",
            "Tell me about a time you saw a better way to do something and what you did about it.",
            "How do you make sure you get on with people who think differently from you?",
          ),
        ],
        note: "Question count, preparation time and retakes conflict across sources.",
      },
      {
        kind: "qa",
        name: "Virtual assessment centre: case study",
        mode: "exercise",
        stageOrder: 4,
        intro: "Candidates report case-study tasks involving data and short written recommendations. Read the case, prepare, then give your recommendation. The real agenda for 2026/27 is not confirmed.",
        prepSeconds: 600,
        answerSeconds: 360,
        retakes: 0,
        prompts: [{ text: BAKERY_CASE.brief, stimulus: BAKERY_CASE.stimulus }],
        note: "Assessment-centre length and activities conflict across sources; group exercises are not simulated.",
      },
      {
        kind: "qa",
        name: "Final interview",
        mode: "interview",
        stageOrder: 5,
        intro: "A competency interview with a senior leader from your business area. This stage is not confirmed in PwC's current five-stage list, so it is included as unconfirmed.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: prompts(
          "Why PwC, why this line of service, and why a route that combines work with study?",
          "Tell me about a time you built a good working relationship with someone.",
          "Tell me about a time you used data or evidence to make a decision.",
          "Pick a technology and describe how it has influenced the industries PwC works in.",
          "Tell me about a time you took responsibility for getting something right.",
        ),
        note: "Not in PwC's current five-stage excerpt: unconfirmed for 2026/27.",
      },
    ],
  },
  {
    firm: "deloitte",
    title: "Deloitte mock process",
    confidence: "official",
    framework: framework("deloitte", "Deloitte's five values"),
    notes: [
      "Based on Deloitte's own pages (five steps). Deloitte publishes no timings for the online assessment or job simulation, so those are approximate.",
    ],
    stages: [
      APPLICATION(1, "About 15 minutes: personal and educational details, submitted in one session. Deloitte allows one application per academic year.", [
        "Check eligibility (104 UCAS points for BrightStart) before you apply.",
      ]),
      { kind: "test", name: "Immersive assessment: ranking actions", testId: "sjt-ranking", stageOrder: 3, note: "Deloitte says you rank the most and least likely actions in workplace scenarios. Timings are not published." },
      { kind: "test", name: "Immersive assessment: numerical reasoning", testId: "scales-numerical", stageOrder: 3, note: "Deloitte includes numerical and verbal reasoning; this uses an Aon-style statement format as a stand-in." },
      { kind: "test", name: "Immersive assessment: verbal reasoning", testId: "scales-verbal", stageOrder: 3 },
      {
        kind: "qa",
        name: "Job simulation: recorded answers",
        mode: "video",
        stageOrder: 4,
        intro: "The job simulation includes video-recorded answers, reported at 30 seconds to 2 minutes each, alongside written and email tasks. Deloitte publishes no timings.",
        prepSeconds: 30,
        answerSeconds: 120,
        retakes: 0,
        prompts: prompts(
          "Tell us about a time you worked well with someone whose approach was different from yours.",
          "Describe a time you took the lead on something. What did you do and what happened?",
          "Why does this kind of work interest you, and what do you hope to learn in your first year?",
        ),
        note: "Preparation and answer times are single-report; the number of questions varies.",
      },
      {
        kind: "qa",
        name: "Final stage: topic discussion",
        mode: "exercise",
        stageOrder: 5,
        intro: "Deloitte sends four topics in advance; you prepare one and discuss it with an assessor for 30 to 40 minutes. In this mock you prepare for ten minutes and talk through your chosen topic.",
        prepSeconds: 600,
        answerSeconds: 240,
        retakes: 0,
        prompts: prompts(DELOITTE_TOPICS),
      },
      {
        kind: "qa",
        name: "Final stage: skills and motivation interview",
        mode: "interview",
        stageOrder: 5,
        intro: "About 50 minutes of competency, motivation, scenario and topical questions. This mock asks a selection of them.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: reported("deloitte", /Final stage/, 6),
      },
      { kind: "info", name: "Outcome", stageOrder: 6, summary: "Deloitte gives personalised feedback whatever the result.", tips: ["Use the feedback to improve, and reapply next academic year if unsuccessful."] },
    ],
  },
  {
    firm: "kpmg",
    title: "KPMG mock process",
    confidence: "official",
    framework: framework("kpmg", "KPMG's strengths"),
    notes: [
      "Based on KPMG's apprentice application page. The live provider, cognitive test item counts and video preparation time are not published.",
    ],
    stages: [
      APPLICATION(1, "About 45 minutes: a job preview quiz that is not assessed, then an application form.", ["Use the job preview to learn what the role involves day to day."]),
      { kind: "test", name: "Skills assessment (untimed, about 20 minutes)", testId: "work-style-rating", stageOrder: 2, note: "KPMG's skills assessment is untimed and about 20 minutes; this uses a work-style rating questionnaire as a stand-in." },
      { kind: "test", name: "Cognitive assessment: numerical (first half of 36 minutes)", testId: "shl-numerical", stageOrder: 2, note: "KPMG's cognitive assessment is 36 minutes covering numerical and logical reasoning; this splits it into two 18-minute replicas." },
      { kind: "test", name: "Cognitive assessment: logical (second half of 36 minutes)", testId: "shl-inductive", stageOrder: 2 },
      {
        kind: "qa",
        name: "Video interview (about 40 minutes)",
        mode: "video",
        stageOrder: 3,
        intro: "KPMG's video interview is six pre-recorded questions put by an AI avatar, with preparation time before each answer, and takes about 40 minutes. Topics: skills, experience and motivation.",
        prepSeconds: 30,
        answerSeconds: 120,
        retakes: 0,
        prompts: prompts(
          "Why are you interested in a career at KPMG and in this service line?",
          "Tell me about a time you had to be resilient.",
          "Tell me about a time you built a relationship with someone new.",
          "Describe a time you planned your time to meet a deadline.",
          "Tell me about a time you used critical thinking to solve a problem.",
          "What do you want to learn from an apprenticeship, and how will you make the most of it?",
        ),
        note: "Preparation and answer times for the apprentice version are not confirmed.",
      },
      {
        kind: "qa",
        name: "Launch Pad: analysis task",
        mode: "exercise",
        stageOrder: 4,
        intro: "Launch Pad is an in-person half day. Third-party sources report a group exercise, an analysis task and a senior interview. This stage replicates a short individual analysis task.",
        prepSeconds: 480,
        answerSeconds: 300,
        retakes: 0,
        prompts: [{ text: GYM_CASE.brief, stimulus: GYM_CASE.stimulus }],
        note: "The Launch Pad agenda is from third-party sources only; the group exercise is not simulated.",
      },
      {
        kind: "qa",
        name: "Launch Pad: senior interview",
        mode: "interview",
        stageOrder: 4,
        intro: "Reported at about 45 minutes, on motivation and scenarios.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: reported("kpmg", /Launch Pad/, 4),
        note: "Questions are from a single commercial prep page.",
      },
    ],
  },
  {
    firm: "ey",
    title: "EY mock process",
    confidence: "official",
    framework: framework("ey", "EY's strengths (list not confirmed on an official page)"),
    notes: [
      "Based on EY's process page and FAQ. Apprentices attend the Experience Day in person. Apprentice item counts and timings are not published, and the final interview is probably part of the Experience Day.",
    ],
    stages: [
      APPLICATION(1, "Create an account and complete the application form. Apprentices wait three months after a rejection before applying again.", ["Roles close once filled, so apply early."]),
      { kind: "test", name: "Online assessment: realistic job preview", testId: "sjt-ranking", stageOrder: 2, note: "EY describes rank-order questions on teamwork and learning capability. Counts and timings are not published." },
      { kind: "test", name: "Online assessment: numerical reasoning", testId: "shl-numerical", stageOrder: 2, note: "EY says some programmes include a timed numerical test. Format and timing are not published." },
      {
        kind: "qa",
        name: "Online assessment: recorded video answers",
        mode: "video",
        stageOrder: 2,
        intro: "Recorded video answers are part of EY's online assessment. The number of questions and timings are not published.",
        prepSeconds: 30,
        answerSeconds: 120,
        retakes: 0,
        prompts: prompts(
          "Tell me about a time you worked as part of a team. What was your role?",
          "Why are you interested in a career at EY?",
          "Tell me about a time you had to adapt to something unexpected.",
        ),
        note: "Question count and timings are not published.",
      },
      {
        kind: "qa",
        name: "Experience Day: case study and presentation",
        mode: "exercise",
        stageOrder: 4,
        intro: "A single graduate-oriented report gives case preparation of 60 minutes, then a 15-minute presentation and 15 minutes of questions. This mock shortens the preparation to keep the session practical.",
        prepSeconds: 900,
        answerSeconds: 360,
        retakes: 0,
        prompts: [{ text: RECYCLING_CASE.brief, stimulus: RECYCLING_CASE.stimulus }],
        note: "Experience Day agenda is a single report and graduate-oriented; the group exercise is not simulated.",
      },
      {
        kind: "qa",
        name: "Experience Day: strengths and motivation interview",
        mode: "interview",
        stageOrder: 5,
        intro: "EY describes an interview on your strengths and motivations. Questions below combine reported ones with original ones.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: [...reported("ey", /Final interview/, 4), ...prompts("Tell me about a time you were curious enough to find something out for yourself.", "Tell me about a time you were accountable for something that did not go to plan.")],
      },
    ],
  },
  {
    firm: "barclays",
    title: "Barclays mock process",
    confidence: "official",
    framework: framework("barclays", "RISES", 5),
    notes: [
      "Based on Barclays' apprentice application journey page. The test vendor, item counts and whether the group activity runs are unconfirmed. Barclays says using third-party AI tools in an assessment or interview ends the application: do not use AI tools in the real process.",
    ],
    stages: [
      APPLICATION(1, "About 30 minutes: academic background and work experience, plus your CV. You can only apply once every six months.", ["Check the minimum entry criteria first and keep your login details."]),
      { kind: "test", name: "Initial assessment: interactive numerical", testId: "shl-numerical", stageOrder: 2, note: "Barclays describes two interactive assessments totalling about 60 minutes, completed within 5 days. Candidates report SHL-style numerical and personality content; Barclays does not name the vendor." },
      { kind: "test", name: "Initial assessment: preferred ways of working", testId: "work-style-rating", stageOrder: 2, note: "Barclays' wording is 'preferred ways of working'." },
      {
        kind: "qa",
        name: "Interview with leadership",
        mode: "interview",
        stageOrder: 3,
        intro: "A motivational interview with leadership, reported at about 70 minutes with mostly behavioural questions and a few about the role. This mock asks a selection.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: [
          ...reported("barclays", /Interview/, 4),
          ...prompts(
            "Tell me about a time you treated someone with respect when it would have been easier not to.",
            "Tell me about a time you put someone else's needs first.",
            "Tell me about a time you set a high standard for your own work.",
            "Tell me about a time you were honest when it was difficult.",
          ),
        ],
      },
      NOT_REPLICATED("Group activity", 3, "Barclays' page lists a group activity alongside the interview, but the only candidate report found described an interview with no group exercise.", "Whether the group activity runs is unconfirmed."),
      { kind: "info", name: "Offer or feedback", stageOrder: 4, summary: "Successful candidates move to pre-employment checks. Unsuccessful candidates receive a personalised feedback report and can reapply after six months.", tips: ["Use the feedback report if you reapply."] },
    ],
  },
  {
    firm: "rolls-royce",
    title: "Rolls-Royce mock process",
    confidence: "official",
    framework: framework("rolls-royce", "The four Rolls-Royce behaviours", 4),
    notes: [
      "Based on Rolls-Royce's published 2026 assessment-centre guide, which lists the interview questions and the 1 to 6 behaviour rating scale. The online assessment guide is from 2021/22, so those timings are approximate.",
    ],
    stages: [
      APPLICATION(1, "An application form followed by three short essay-style questions of roughly 300 words each (no CV).", ["Tie every example back to Rolls-Royce.", "Choose two topical issues you can defend at interview: the interview repeats this question."]),
      { kind: "test", name: "Online assessment: situational judgement exercise", testId: "sjt-most-least", stageOrder: 2, note: "Rolls-Royce describes a chat-style situational judgement exercise of up to about 15 minutes. This replica uses written scenarios." },
      { kind: "test", name: "Online assessment: work-style questionnaire", testId: "work-style-rating", stageOrder: 2, note: "The Measurement of Competencies questionnaire is untimed." },
      { kind: "test", name: "Online assessment: numerical and logical reasoning (about 6 minutes each)", testId: "scales-numerical", stageOrder: 2, note: "The 2021/22 guide gives about 6 minutes per reasoning test and the test ends when time is up. Role-specific tests vary." },
      {
        kind: "qa",
        name: "Assessment centre: interview",
        mode: "interview",
        stageOrder: 3,
        intro: "Degree apprentices attend in person. The guide publishes the interview questions (seven for degree apprentices), and assessors rate each behaviour from 1 to 6.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: reported("rolls-royce", /Assessment centre/, 7, 2000),
      },
      {
        kind: "qa",
        name: "Assessment centre: prepared presentation",
        mode: "exercise",
        stageOrder: 3,
        intro: "A seven-minute presentation on a technical subject, followed by short questions. In person there is no projector, so use notes or handouts.",
        prepSeconds: 300,
        answerSeconds: 420,
        retakes: 0,
        prompts: prompts(RR_PRESENTATION),
      },
      {
        kind: "qa",
        name: "Assessment centre: technical case study",
        mode: "exercise",
        stageOrder: 3,
        intro: "Degree and higher apprentices respond to a case study given on the day. The real content differs; this is an original engineering-style case.",
        prepSeconds: 600,
        answerSeconds: 300,
        retakes: 0,
        prompts: [{ text: ENGINE_CASE.brief, stimulus: ENGINE_CASE.stimulus }],
        note: "The real case-study content is not published.",
      },
      { kind: "info", name: "Offer and feedback", stageOrder: 4, summary: "A decision follows the assessment centre. Candidates report offers within about two weeks, and detailed feedback if unsuccessful.", tips: ["Ask for feedback if unsuccessful."] },
    ],
  },
  {
    firm: "bae-systems",
    title: "BAE Systems mock process",
    confidence: "official",
    framework: framework("bae-systems", "BAE Systems values and behaviours"),
    notes: [
      "BAE's page confirms three stages: application, a virtual assessment with gamified challenges and video questions, then an interview. Game names, video timings and the number of questions come only from single reports, and the games are not replicated.",
    ],
    stages: [
      APPLICATION(1, "A short form with your grades, work experience and interests. Qualifications are reviewed against the role criteria. Applications reopen in January 2027 for about six weeks.", ["Give full grades and relevant interests.", "Pick the business area that genuinely fits and say why."]),
      NOT_REPLICATED("Virtual assessment: gamified challenges", 2, "BAE says the virtual assessment includes gamified challenges. Candidates report a shape-matching game, a maths game and an image-choice game.", "Game names and formats are single-report and are not replicated here."),
      {
        kind: "qa",
        name: "Virtual assessment: video questions",
        mode: "video",
        stageOrder: 2,
        intro: "Candidates report 3 to 5 past-experience questions on a HireVue-style platform, with retakes mentioned. Preparation time conflicts across reports (30 seconds to 3 minutes): this uses 60 seconds.",
        prepSeconds: 60,
        answerSeconds: 120,
        retakes: 1,
        prompts: prompts(
          "Tell me about a time you had to make a decision with very little time.",
          "Why do you want to work for BAE Systems as an apprentice?",
          "Tell me about a time you met a requirement that was outside your comfort zone.",
          "Tell me about a time you worked well in a team.",
        ),
        note: "Number of questions, preparation time and retakes are single-report and conflict.",
      },
      {
        kind: "qa",
        name: "Interview",
        mode: "interview",
        stageOrder: 3,
        intro: "A virtual or face-to-face interview. Candidates report behavioural questions similar to the video round plus technical questions about the role.",
        prepSeconds: 0,
        answerSeconds: 180,
        retakes: 0,
        prompts: [...reported("bae-systems", /Interview/, 4), ...prompts("Tell me about a time you showed courage or did the right thing when it was difficult.")],
      },
      { kind: "info", name: "Offer and vetting", stageOrder: 4, summary: "Many roles need security vetting, and nationality or residency rules can apply. Check the live advert.", tips: [] },
    ],
  },
  {
    firm: "lloyds",
    title: "Lloyds Banking Group mock process",
    confidence: "official",
    framework: framework("lloyds", "Lloyds' values and behaviours"),
    notes: [
      "Lloyds' pages confirm three stages and that you may need a pen, paper and calculator. Test vendor, timings and the assessment-centre contents are not official and conflict across sources, so the final stage is approximate.",
    ],
    stages: [
      APPLICATION(1, "A form about yourself and your qualifications. Applications open on 3 November (the year is not stated). Those who meet the minimum criteria go to the assessments.", ["Check the minimum criteria for your specific apprenticeship."]),
      { kind: "test", name: "Online assessment: motivation, behaviours and values", testId: "work-style-rating", stageOrder: 2, note: "Lloyds describes assessments of motivations, behaviours and values. The format is not published." },
      { kind: "test", name: "Online assessment: situational judgement", testId: "sjt-most-least", stageOrder: 2, note: "A 2025 candidate report says the online test was scenario-based with nothing numerical for their route." },
      {
        kind: "qa",
        name: "Online assessment: written communication",
        mode: "exercise",
        stageOrder: 2,
        intro: "Lloyds says written communication is assessed. Write your answer as a reply to the customer.",
        prepSeconds: 0,
        answerSeconds: 600,
        retakes: 0,
        prompts: prompts(LLOYDS_EMAIL),
        note: "The real written task is not published.",
      },
      {
        kind: "qa",
        name: "Final stage: strengths-based interview",
        mode: "interview",
        stageOrder: 3,
        intro: "Candidates report a strengths-based interview: what you enjoy, what you are like at your best, and how you would put the customer first. The exact format varies by apprenticeship.",
        prepSeconds: 0,
        answerSeconds: 150,
        retakes: 0,
        prompts: [
          ...reported("lloyds", /Final interview/, 1),
          ...prompts(
            "What are you like when you are at your best?",
            "What do you enjoy doing, and why?",
            "Tell me about something you achieved and how you did it.",
            "How would you put the customer first in this role?",
            "What kind of tasks do you find draining, and how do you handle them?",
          ),
        ],
        note: "Strengths-based style is single-report.",
      },
      NOT_REPLICATED("Assessment day exercises", 3, "Reports mention micro-exercises, a group exercise and, for some routes, a virtual reality exercise. Contents conflict and none is official.", "Not replicated: contents are unconfirmed."),
    ],
  },
];

export const getMock = (firmSlug: string) => MOCKS.find((m) => m.firm === firmSlug);

