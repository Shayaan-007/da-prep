import Link from "next/link";
import Icon from "@/components/Icon";
import { NAV_GROUPS } from "@/lib/nav";

export const metadata = {
  title: "Resources",
  description: "Free guides to degree apprenticeship applications: process, tips, timeline, sectors, employers and FAQ.",
};

export default function Learn() {
  const learn = NAV_GROUPS.find((g) => g.label === "Learn")!;
  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="page-title">Resources</h1>
        <p className="lead">
          Free guides to how degree apprenticeship applications work. They describe common practice, so always check the
          advert and the employer&apos;s own pages.
        </p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {learn.links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="card card-hover group flex h-full flex-col gap-2 p-6">
              <h2 className="text-lg font-bold tracking-tight">{l.label}</h2>
              <p className="flex-1 text-sm leading-relaxed text-muted">{l.blurb}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                Read
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
