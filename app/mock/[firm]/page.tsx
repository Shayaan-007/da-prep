import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MockRunner from "@/components/mock/MockRunner";
import { getFirm } from "@/lib/firms";
import { MOCKS, getMock } from "@/lib/mockprocess/definitions";

export const generateStaticParams = () => MOCKS.map((m) => ({ firm: m.firm }));

export async function generateMetadata({ params }: { params: Promise<{ firm: string }> }): Promise<Metadata> {
  const mock = getMock((await params).firm);
  return { title: mock ? mock.title : "Mock process not found" };
}

export default async function MockPage({ params }: { params: Promise<{ firm: string }> }) {
  const slug = (await params).firm;
  const mock = getMock(slug);
  const firm = getFirm(slug);
  if (!mock || !firm) notFound();
  return <MockRunner mock={mock} firmName={firm.name} />;
}
