import { firmOptions } from "@/lib/firms/context";
import InterviewApp from "./InterviewApp";

export default function InterviewPage() {
  return <InterviewApp firms={firmOptions()} />;
}
