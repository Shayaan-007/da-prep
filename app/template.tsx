// A template remounts on every navigation, so each page fades up instead of snapping in.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
