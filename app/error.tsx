"use client";

import Link from "next/link";
import { useEffect } from "react";

// In this Next.js version the recovery callback is `retry` (not `reset`).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="page-title">Something went wrong</h1>
      <p className="lead">
        That page hit an unexpected problem. Your saved data is safe. Try again, and if it keeps happening, go back to
        the home page.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={() => retry()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}
