"use client";

// Last-resort boundary for errors in the root layout itself. It replaces the whole document, so it carries its own
// <html> and <body> and uses plain styles (the app stylesheet may not have loaded).
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "4rem 1rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>Your saved data is safe. Please try again.</p>
        <button onClick={() => retry()} style={{ padding: "0.6rem 1.2rem", fontSize: "1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
