import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import Icon, { type IconName } from "@/components/Icon";
import ScoreRing from "@/components/ScoreRing";

const features: { href: string; title: string; body: string; icon: IconName }[] = [
  {
    href: "/interview",
    title: "AI mock interview",
    body: "Paste a job advert and get tailored questions, in text or timed video style, with STAR feedback and a score.",
    icon: "chat",
  },
  {
    href: "/practice",
    title: "Practice tests",
    body: "Situational judgement, numerical, verbal and logical reasoning, with explanations.",
    icon: "test",
  },
  {
    href: "/review",
    title: "Statement review",
    body: "Honest feedback on your personal statement or application answers.",
    icon: "pencil",
  },
  {
    href: "/tracker",
    title: "Application tracker",
    body: "Every employer, stage and closing date in one place. Roles can close early.",
    icon: "board",
  },
  {
    href: "/stories",
    title: "Stories bank",
    body: "Build reusable STAR examples once and use them everywhere.",
    icon: "bookmark",
  },
  {
    href: "/sectors",
    title: "Sector guides",
    body: "What is the same in every degree apprenticeship and what changes for tech, engineering, finance, law and more.",
    icon: "compass",
  },
];

const steps = [
  { title: "Paste a real advert", body: "Questions are built around the role, not generic lists." },
  { title: "Answer in text or on the clock", body: "Try the timed video style to feel the pressure." },
  { title: "Review your feedback", body: "See what worked, what didn't, and a stronger version." },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 py-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-brand-600">For UK degree apprenticeship applicants</p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Prepare for your degree apprenticeship application
          </h1>
          <p className="lead max-w-xl text-lg">
            Practise interviews with an AI that reads the real job advert, sharpen your online tests, and keep every
            application on track.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/interview" className="btn btn-primary !px-5 !py-2.5">
              Start a mock interview
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/guide" className="btn btn-secondary !px-5 !py-2.5">
              How it works
            </Link>
          </div>
          <p className="text-sm text-muted">Free to try. No account needed.</p>
        </div>

        <div className="card space-y-4 p-6">
          <div className="flex items-center gap-5">
            <ScoreRing value={78} size={104} label="out of 100" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sample feedback</p>
              <p className="font-semibold">Motivation interview</p>
              <p className="text-sm text-muted">Clear reasons. Add a specific result to land it.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-md bg-mint-50 px-2.5 py-1 text-mint-600">✓ Situation</span>
            <span className="rounded-md bg-mint-50 px-2.5 py-1 text-mint-600">✓ Action</span>
            <span className="rounded-md bg-coral-50 px-2.5 py-1 text-coral-600">✗ Result</span>
          </div>
          <p className="callout bg-brand-50">
            <strong>Stronger answer:</strong> &quot;I led our robotics team, and we cut build time by a third…&quot;
          </p>
        </div>
      </section>

      <Dashboard />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="space-y-1.5">
              <span className="text-sm font-bold text-brand-600">Step {i + 1}</span>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Everything in one place</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card card-hover space-y-3 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
