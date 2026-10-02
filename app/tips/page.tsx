import Link from "next/link";

export const metadata = {
  title: "Tips",
  description: "Practical tips for online tests, recorded video interviews and assessment centres.",
};

const sections = [
  {
    id: "tests",
    title: "Online tests",
    intro:
      "Usually sent straight after you apply, and often used to filter out many applicants early. Formats include situational judgement, numerical, verbal and logical reasoning.",
    tips: [
      "Do them in a quiet place on a reliable connection, with a pen, paper and a calculator if the instructions allow one.",
      "Read the instructions fully. Check whether wrong answers lose marks and whether you can go back.",
      "Watch the clock, but don't rush every question. If one is taking too long, make your best guess and move on.",
      "For situational judgement, think about the employer's values and what a reliable colleague would do: be honest, speak up early, involve the right people, stay calm.",
      "Practise the formats beforehand so the style isn't new on the day.",
    ],
    cta: { href: "/practice", label: "Practise the tests" },
  },
  {
    id: "video",
    title: "Recorded video interviews",
    intro:
      "You answer on-screen questions into your camera, with a time limit that varies by employer, with no live interviewer. Your recording is reviewed afterwards.",
    tips: [
      "Test your camera, microphone and lighting first. Face a window or lamp, with a plain background and the camera at eye level.",
      "Look at the camera lens, not the screen, for the main part of your answer.",
      "Use STAR (Situation, Task, Action, Result) and aim to finish within the time. Practise to a timer.",
      "Have brief notes of your key examples nearby, but don't read from a script.",
      "Dress as you would for an in-person interview, and check whether you get a practice question or a second attempt.",
      "Smile and speak a little slower than feels natural. Nerves make people rush.",
    ],
    cta: { href: "/interview", label: "Try the timed video style" },
  },
  {
    id: "centre",
    title: "Assessment centres",
    intro:
      "Held in person or online. They often combine a group exercise, a role-play or presentation, and a further interview, sometimes across a full day.",
    tips: [
      "Group exercise: contribute early, listen, build on others' ideas, and help quieter people join in. Employers are watching how you work with others, not who talks most.",
      "Watch the time. Suggest a plan or assign roles if the group is stuck, and keep an eye on the clock.",
      "Role-play: read the brief carefully, stay calm, be polite and clear, and ask questions to understand the other person.",
      "Presentations: keep to the time, use a clear structure (what, why, what next) and finish with a clear recommendation.",
      "Every interaction counts, including breaks and chats with staff. Be friendly and professional throughout.",
      "Ask the organisers in advance if you need adjustments. Employers expect and support this.",
    ],
    cta: { href: "/stories", label: "Prepare your examples" },
  },
  {
    id: "answers",
    title: "Answering interview questions",
    intro: "Most questions fall into a few types, and the same stories can often be reused.",
    tips: [
      "Motivation: why an apprenticeship, why this employer, why this role. Mention specifics from the advert and something you've actually done to explore the area.",
      "Competency: use STAR for questions starting \"Tell me about a time...\". Keep the focus on what you did, and end with the result and what you learnt.",
      "Strengths: answer quickly and honestly. They look at what energises you, so there are rarely wrong answers.",
      "Prepare 5 to 8 real examples (school, clubs, work experience, volunteering, projects) that can be adapted to several questions.",
      "Prepare one or two questions to ask them, such as about training, mentoring or typical projects.",
    ],
    cta: { href: "/interview", label: "Run a mock interview" },
  },
];

export default function Tips() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-3">
        <h1 className="page-title">Tips for each stage</h1>
        <p className="lead">
          Practical advice for the parts of a degree apprenticeship application that most people find hardest. Formats
          vary between employers, so check the instructions you are sent.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-1">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="chip">
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="card scroll-mt-20 space-y-4 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{s.title}</h2>
            <p className="text-sm text-muted">{s.intro}</p>
          </div>
          <ul className="space-y-2.5 text-sm leading-relaxed">
            {s.tips.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                {t}
              </li>
            ))}
          </ul>
          <Link href={s.cta.href} className="btn btn-secondary">
            {s.cta.label}
          </Link>
        </section>
      ))}

      <p className="text-xs text-muted">
        General guidance drawn from common practice. It isn&apos;t specific to any employer.{" "}
        <Link href="/guide" className="underline">
          See the full process
        </Link>
        .
      </p>
    </div>
  );
}
