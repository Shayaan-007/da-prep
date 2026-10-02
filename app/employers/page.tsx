import EmployersList from "@/components/EmployersList";
import { directory } from "@/lib/directory";

export default function Employers() {
  return <EmployersList entries={directory()} />;
}
