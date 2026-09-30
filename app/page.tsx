import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import Icon, { type IconName } from "@/components/Icon";
import ScoreRing from "@/components/ScoreRing";

const features: { href: string; title: string; body: string; icon: IconName; tint: string }[] = [
  {
    href: "/interview",
    title: "AI mock interview",
    body: "Paste a job advert and get tailored questions, in text or timed video style, with STAR feedback and a score.",
    icon: "chat",
    tint: "bg-brand-50 text-brand-600",
  },
  {
    href: "/practice",
    title: "Practice tests",
    body: "Situational judgement, numerical, verbal and logical reasoning, with explanations.",
    icon: "test",
    tint: "bg-mint-50 text-mint-600",
  },
  {
    href: "/review",
    title: "Statement review",
    body: "Honest feedback on your personal statement or application answers.",
    icon: "pencil",
    tint: "bg-coral-50 text-coral-600",
  },
  {
    href: "/tracker",
    title: "Application tracker",
    body: "Every employer, stage and closing date in one place. Roles can close early.",
    icon: "board",
    tint: "bg-sun-50 text-sun-600",
  },
  {
    href: "/stories",
    title: "Stories bank",
    body: "Build reusable STAR examples once and use them everywhere.",
    icon: "bookmark",
    tint: "bg-brand-50 text-brand-600",
  },
  {
    href: "/sectors",
    title: "Sector guides",
    body: "What's the same in every degree apprenticeship and what changes for tech, engineering, finance, law and more.",
    icon: "compass",
    tint: "bg-mint-50 text-mint-600",
  },
];

const steps = [
  { n: "1", title: "Paste a real advert", body: "Questions are built around the role, not generic lists." },
  { n: "2", title: "Answer out loud or in text", body: "Try the timed video style to feel the pressure." },
  { n: "3", title: "Get scored, then improve", body: "See what worked, what didn't, and a stronger version." },
];

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-brand-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-10 h-64 w-64 animate-float rounded-full bg-pop-500/20 blur-3xl [animation-delay:-3s]"
        />

        <div className="relative space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-600" />
            Built for UK degree apprenticeships
          </span>
          <h1 className="display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Ace your <span className="gradient-text">degree apprenticeship</span> application
          </h1>
          <p className="lead max-w-xl text-lg">
            Practise interviews with an AI that reads the real job advert, sharpen your online tests, and keep every
            application on track.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/interview" className="btn btn-primary !px-5 !py-3 !text-base">
              Start a mock interview
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/guide" className="btn btn-secondary !px-5 !py-3 !text-base">
              How it works
            </Link>
          </div>
          <p className="text-xs text-muted">Free to try. No account needed.</p>
        </div>

        <div className="relative animate-pop [animation-delay:150ms]">
          <div className="card space-y-4 p-6 shadow-2xl shadow-brand-500/10 lg:rotate-2">
            <div className="flex items-center gap-5">
              <ScoreRing value={78} size={112} label="/ 100" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sample feedback</p>
                <p className="display font-bold">Motivation interview</p>
                <p className="text-sm text-muted">Clear reasons. Add a specific result to land it.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-mint-50 px-2.5 py-1 text-mint-600">✓ Situation</span>
              <span className="rounded-full bg-mint-50 px-2.5 py-1 text-mint-600">✓ Action</span>
              <span className="rounded-full bg-coral-50 px-2.5 py-1 text-coral-600">✗ Result</span>
            </div>
            <div className="callout bg-brand-50 text-sm">
              <strong>Stronger answer:</strong> &quot;I led our robotics team, and we cut build time by a third…&quot;
            </div>
          </div>
        </div>
      </section>

      <Dashboard />

      <section className="space-y-6">
        <h2 className="display text-center text-2xl font-extrabold tracking-tight">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="animate-fade-up space-y-2 text-center"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="display mx-auto grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-extrabold text-white shadow-lg shadow-brand-500/30">
                {s.n}
              </div>
              <h3 className="display font-bold">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="display text-2xl font-extrabold tracking-tight">Everything in one place</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Link
              key={f.href}
              href={f.href}
              className="card card-hover group animate-fade-up space-y-3 p-5"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${f.tint}`}>
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <h3 className="display flex items-center justify-between font-bold">
                {f.title}
                <Icon
                  name="arrow"
                  className="h-4 w-4 -translate-x-1 text-brand-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                />
              </h3>
              <p className="text-sm text-muted">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
