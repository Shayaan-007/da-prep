"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { postJson } from "@/lib/api";
import { clearLocalData } from "@/lib/store";

export default function Login() {
  const { enabled, ready, user, signInEmail, signInGoogle, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  if (!enabled) {
    return (
      <div className="space-y-3">
        <h1 className="page-title">Accounts</h1>
        <p className="text-muted">
          Accounts aren&apos;t set up on this deployment. Everything still works and is saved in this browser.
        </p>
      </div>
    );
  }
  if (!ready) return <p className="text-muted">Loading...</p>;

  if (user) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Your account</h1>
        <p>Signed in as {user.email}. Your tracker, stories and progress sync across devices.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={signOut} className="btn btn-secondary">
            Sign out
          </button>
          <button
            onClick={async () => {
              if (!confirm("Permanently delete your account and all saved data? This can't be undone.")) return;
              try {
                await postJson("/api/account", undefined, "DELETE");
                clearLocalData();
                await signOut();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
            className="btn btn-danger"
          >
            Delete my account and data
          </button>
        </div>
        {error && <p className="text-sm text-coral-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="page-title">Sign in</h1>
      <p className="text-sm text-muted">Save your progress and sync across devices. Optional: the site works without it.</p>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const err = await signInEmail(email);
          if (err) setError(err);
          else setMsg("Check your email for a sign-in link.");
        }}
      >
        <input
          type="email"
          required
          className="w-full input text-sm"
          placeholder="you@example.com"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary w-full">Email me a link</button>
      </form>
      <button
        onClick={async () => setError((await signInGoogle()) ?? "")}
        className="btn btn-secondary w-full"
      >
        Continue with Google
      </button>
      {msg && <p className="text-sm text-mint-600">{msg}</p>}
      {error && <p className="text-sm text-coral-600">{error}</p>}
      <p className="text-xs text-muted">
        By signing in you agree to our <a className="underline" href="/privacy">privacy notice</a>. If you&apos;re under
        16, ask a parent or carer first.
      </p>
    </div>
  );
}
