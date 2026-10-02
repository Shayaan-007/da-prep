// Original verbal reasoning passages with true / false / cannot say statements. Hand-written: every statement was
// checked against its passage. "Cannot say" means the passage does not give enough information either way.

import type { Item, Stimulus, TfAnswer } from "@/lib/assess/types";

type Statement = [text: string, answer: TfAnswer, why: string];

const GROUPS: { id: string; title: string; body: string; statements: Statement[] }[] = [
  {
    id: "vtf-g1",
    title: "Brightwater Logistics",
    body:
      "Brightwater Logistics introduced a delivery window system in 2023. Customers choose a morning, afternoon or evening window, and drivers receive updated routes each night. In the first year, missed deliveries fell from 8 per cent to 5 per cent, although the company reports that fuel costs rose because routes became less direct. Evening windows are the most popular, chosen for about half of all orders. Brightwater plans to extend the system to its two smaller depots next year, provided that driver turnover, which stood at 14 per cent in 2023, does not increase.",
    statements: [
      ["Missed deliveries fell by three percentage points in the first year.", 0, "They fell from 8 per cent to 5 per cent, which is a fall of three percentage points."],
      ["Fuel costs rose after the delivery window system was introduced.", 0, "The passage says the company reports that fuel costs rose because routes became less direct."],
      ["Morning windows are the most popular choice.", 1, "The passage says evening windows are the most popular."],
      ["The system is already in use at the two smaller depots.", 1, "The passage says Brightwater plans to extend it to them next year."],
      ["The delivery window system has increased Brightwater's profits.", 2, "The passage gives no information about profits."],
      ["Driver turnover is now higher than it was in 2023.", 2, "Only the 2023 figure (14 per cent) is given, so the current level cannot be known."],
    ],
  },
  {
    id: "vtf-g2",
    title: "Northfield College",
    body:
      "Northfield College runs degree apprenticeships in engineering, digital and business. Apprentices spend four days a week at work and one day at college. Employers pay no course fees for apprentices because the programmes are funded through the apprenticeship levy or by government co-investment. The college reports that 92 per cent of apprentices who started in 2021 completed their programme, compared with a national completion rate of 64 per cent. Applications are made to the employer, not to the college, and each employer sets its own selection process.",
    statements: [
      ["Apprentices at Northfield College spend one day a week at college.", 0, "Four days at work and one day at college."],
      ["Northfield's completion rate for apprentices starting in 2021 was higher than the national rate.", 0, "92 per cent compared with 64 per cent nationally."],
      ["Apprentices apply directly to Northfield College.", 1, "The passage says applications are made to the employer, not the college."],
      ["Employers must pay the full course fees for each apprentice.", 1, "Employers pay no course fees, because the programmes are funded through the levy or co-investment."],
      ["Engineering apprentices at Northfield earn more than business apprentices.", 2, "The passage says nothing about pay."],
      ["Most apprentices at Northfield are under 19.", 2, "No information about apprentices' ages is given."],
    ],
  },
  {
    id: "vtf-g3",
    title: "Office working survey",
    body:
      "A survey of 1,200 office workers found that 58 per cent preferred a hybrid pattern of working, with two or three days at home each week. Fewer than one in five wanted to work entirely from the office. Among workers aged under 25, however, the preference for office-based work was noticeably stronger than in other age groups, with respondents citing easier learning from colleagues. The survey did not ask about commuting costs, and the authors caution that results may differ in sectors where remote work is not possible.",
    statements: [
      ["A majority of respondents preferred hybrid working.", 0, "58 per cent is more than half."],
      ["Fewer than 240 respondents wanted to work entirely from the office.", 0, "Fewer than one in five of 1,200 is fewer than 240."],
      ["Workers under 25 were less keen on office-based work than other age groups.", 1, "The passage says their preference for office-based work was stronger."],
      ["The survey asked respondents about their commuting costs.", 1, "The passage says it did not."],
      ["Hybrid workers are more productive than office-only workers.", 2, "Productivity is not mentioned."],
      ["Most workers under 25 wanted to work entirely from the office.", 2, "Their preference was stronger than other groups', but the passage does not say it was a majority."],
    ],
  },
];

export const VERBAL_TF_STIMULI: Record<string, Stimulus> = Object.fromEntries(
  GROUPS.map((g) => [g.id, { type: "text", title: g.title, body: g.body } satisfies Stimulus]),
);

export const VERBAL_TF: Item[] = GROUPS.flatMap((g) =>
  g.statements.map(
    ([text, answer, why], i): Item => ({
      id: `${g.id}-${i + 1}`,
      kind: "tf-cannot-say",
      stimulus: g.id,
      prompt: text,
      answer,
      explanation: why,
      difficulty: 3,
    }),
  ),
);
