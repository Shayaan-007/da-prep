import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TestPlayer from "@/components/assess/TestPlayer";
import { TESTS, getTest } from "@/lib/assess/tests";

export const generateStaticParams = () => TESTS.map((t) => ({ id: t.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const test = getTest((await params).id);
  return { title: test ? test.name : "Test not found" };
}

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const test = getTest((await params).id);
  if (!test) notFound();
  return (
    <div className="space-y-4">
      <ul className="mx-auto max-w-3xl list-disc space-y-1 pl-5 text-xs text-muted">
        {test.formatNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <TestPlayer test={test} />
    </div>
  );
}
