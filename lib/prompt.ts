/**
 * Neutralise anything in user text that looks like a tag, so it can't close one of our delimiters
 * (<job_ad>, <notes>, ...) and smuggle in instructions.
 */
export const esc = (s: string | undefined) => (s ?? "").replace(/<\s*\/?\s*[a-zA-Z_][^>]*>/g, (m) => `[${m.replace(/[<>/]/g, "").trim()}]`);

/** Free-text label for a competency: letters, numbers, spaces and basic punctuation only. */
export const label = (s: string | undefined) => (s ?? "").replace(/[^\p{L}\p{N} &,'-]/gu, "").slice(0, 60);
