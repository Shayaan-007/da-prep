import type { Application } from "@/lib/types";

const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const compact = (isoDate: string) => isoDate.replace(/-/g, "");

/** The day after an ISO date (YYYY-MM-DD), as YYYYMMDD. All-day events end on the following day. */
function nextDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Build an iCalendar file with an all-day event for each application that has a closing date. */
export function applicationsToIcs(apps: Application[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = apps
    .filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.deadline))
    .flatMap((a) => [
      "BEGIN:VEVENT",
      `UID:${a.id}@da-prep`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(a.deadline)}`,
      `DTEND;VALUE=DATE:${nextDay(a.deadline)}`,
      `SUMMARY:${escapeText(`Closes: ${a.employer}${a.role ? ` (${a.role})` : ""}`)}`,
      `DESCRIPTION:${escapeText(`Status: ${a.status}${a.notes ? `\n${a.notes}` : ""}`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P3D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Application closing in 3 days",
      "END:VALARM",
      "END:VEVENT",
    ]);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Level6//Deadlines//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}

export const hasDeadlines = (apps: Application[]) => apps.some((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.deadline));
