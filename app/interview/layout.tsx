import { pageMeta } from "@/lib/site";
export const metadata = pageMeta({
  title: "AI mock interview for degree apprenticeships",
  description: "Practise a degree apprenticeship interview with questions built from the job advert, then get marked feedback on structure and evidence.",
  path: "/interview",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
