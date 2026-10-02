import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MockRunner from "@/components/mock/MockRunner";
import { getFirm } from "@/lib/firms";
import { MOCKS, getMock } from "@/lib/mockprocess/definitions";
import { pageMeta } from "@/lib/site";

export const generateStaticParams = () => MOCKS.map((m) => ({ firm: m.firm }));

export async function generateMetadata({ params }: { params: Promise<{ firm: string }> }): Promise<Metadata> {
  const slug = (await params).firm;
  const mock = getMock(slug);
  const firm = getFirm(slug);
  if (!mock || !firm) return { title: "Mock process not found" };
  return pageMeta({
    title: `${firm.name} mock application process`,
    description: `Practise the ${firm.name} degree apprenticeship stages in order: ${mock.stages.map((s) => s.name).join(", ")}. Timed like the real thing, with marked feedback.`.slice(0, 300),
    path: `/mock/${slug}`,
  });
}

export default async function MockPage({ params }: { params: Promise<{ firm: string }> }) {
  const slug = (await params).firm;
  const mock = getMock(slug);
  const firm = getFirm(slug);
  if (!mock || !firm) notFound();
  return <MockRunner mock={mock} firmName={firm.name} />;
}
