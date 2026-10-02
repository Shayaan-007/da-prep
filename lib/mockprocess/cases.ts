// Original case-study and exercise stimuli for the mock processes. Invented scenarios and data: nothing here is taken
// from any employer's materials.

import type { Stimulus } from "@/lib/assess/types";

export const BAKERY_CASE: { brief: string; stimulus: Stimulus } = {
  brief:
    "Hearth & Crumb is a bakery chain with four shops. The owner is considering starting a home delivery service from two of the shops. Delivery would need two vans and four part-time drivers. Look at the data, then in your answer: (1) say what the data suggests about where delivery is most likely to work, (2) name two risks, (3) say what other information you would want, and (4) give a clear recommendation.",
  stimulus: {
    type: "table",
    title: "Hearth & Crumb: last year's figures by shop",
    columns: ["Shop", "Annual sales (£k)", "Customers within 3 miles (thousand)", "Online enquiries per week", "Rent and rates (£k)"],
    rows: [
      ["Marlow Street", 410, 38, 52, 64],
      ["Riverside", 295, 21, 9, 41],
      ["Station Road", 360, 44, 47, 58],
      ["Oakfield", 180, 12, 4, 26],
    ],
    note: "A van costs about £9k a year to run. A part-time driver costs about £7k a year.",
  },
};

export const GYM_CASE: { brief: string; stimulus: Stimulus } = {
  brief:
    "FitFirst, a local gym, is losing members in the first three months. A manager suggests cutting the monthly price. Study the figures. In your answer: (1) explain what the data does and does not show about why members leave, (2) suggest one or two ways to test your idea cheaply, (3) recommend what the gym should do next and why.",
  stimulus: {
    type: "table",
    title: "FitFirst: members leaving within three months, by joining month",
    columns: ["Joined in", "New members", "Left within 3 months", "Used the gym 8+ times in month 1", "Left (of those 8+ visits)"],
    rows: [
      ["January", 220, 88, 90, 9],
      ["April", 140, 42, 70, 6],
      ["July", 95, 38, 31, 4],
      ["October", 160, 56, 66, 7],
    ],
    note: "The monthly price has not changed during these months.",
  },
};

export const RECYCLING_CASE: { brief: string; stimulus: Stimulus } = {
  brief:
    "A council wants to raise the share of household waste that is recycled. You have been given the figures for four neighbourhoods. In your answer: (1) say which neighbourhood needs help most and why, (2) point out one thing the data cannot tell you, (3) recommend a first step, with a way to check whether it worked.",
  stimulus: {
    type: "table",
    title: "Household waste by neighbourhood (tonnes per month)",
    columns: ["Neighbourhood", "Households", "Total waste", "Recycled", "Collection day changed this year"],
    rows: [
      ["Eastgate", 3200, 410, 148, "No"],
      ["Millbank", 2100, 290, 64, "Yes"],
      ["Hallfield", 2800, 350, 133, "No"],
      ["Priory", 1500, 205, 43, "Yes"],
    ],
  },
};

export const ENGINE_CASE: { brief: string; stimulus: Stimulus } = {
  brief:
    "A small component on a test rig has failed twice in six months. You are given a summary of the three test runs so far. In ten minutes, explain what the data suggests, what you would check next, and what you recommend before the next run. Keep your language simple enough for a non-specialist colleague to follow.",
  stimulus: {
    type: "table",
    title: "Test rig: component failures",
    columns: ["Run", "Hours since service", "Operating temperature (°C)", "Vibration (mm/s)", "Outcome"],
    rows: [
      ["1", 120, 310, 2.1, "Passed"],
      ["2", 340, 355, 3.4, "Failed"],
      ["3", 95, 350, 3.2, "Passed"],
      ["4", 410, 312, 2.0, "Passed"],
      ["5", 360, 358, 3.6, "Failed"],
    ],
    note: "Runs 2 and 5 were the two failures. Runs are listed in the order they were carried out.",
  },
};

export const DELOITTE_TOPICS =
  "Choose ONE of these four topics and talk through it as you would with an assessor:\n1. How should organisations use artificial intelligence responsibly?\n2. What can businesses do to attract and keep young people?\n3. How should a company decide whether to expand overseas?\n4. What makes a business trustworthy?\nAim to cover facts, who is affected, the impact on clients or customers, and one argument against your own view.";

export const LLOYDS_EMAIL =
  "A customer emailed to say they were charged a £6 fee on their account that nobody warned them about. The fee was correct under the account terms. Write a reply of around 150 words. Show empathy, explain clearly, say what you can do to help, and keep a friendly, professional tone.";

export const RR_PRESENTATION =
  "Imagine you are presenting for seven minutes to a senior colleague from a different discipline. Explain a complex technical idea you understand well (it can be from school, a hobby or a project), say why it matters, and say what you learned or what skills you developed by understanding it. Give your presentation as you would in the room.";
