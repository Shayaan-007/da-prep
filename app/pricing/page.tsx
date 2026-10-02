"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { postJson } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const FREE = [
  "2 AI mock interviews a month",
  "2 statement or answer reviews a week",
  "Unlimited practice tests, tracker, stories bank, guides",
  "Progress history",
];
const PRO = ["Unlimited AI mock interviews", "Unlimited statement and answer reviews", "Everything in Free"];

export default function Pricing() {
  const { enabled, user } = useAuth();
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Reading the URL needs the browser, so this can't be initial state without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccess(new URLSearchParams(window.location.search).has("success"));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase()
      ?.from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setPlan((data?.plan as "free" | "pro") ?? "free"));
  }, [user]);

  async function upgrade() {
    setError("");
    try {
      const { url } = await postJson<{ url: string }>("/api/stripe/checkout");
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function manage() {
    setError("");
    try {
      const { url } = await postJson<{ url: string }>("/api/stripe/portal");
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const label = process.env.NEXT_PUBLIC_PRO_PRICE_LABEL;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Plans</h1>
      {success && <p className="callout bg-mint-50 text-mint-600">Thanks! Your Pro plan will be active shortly.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="space-y-2 card p-4">
          <h2 className="font-semibold">Free</h2>
          <ul className="list-disc pl-5 text-sm">{FREE.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
        <section className="space-y-2 card ring-2 ring-brand-500 p-4">
          <h2 className="font-semibold">Pro {label && <span className="font-normal text-muted">· {label}</span>}</h2>
          <ul className="list-disc pl-5 text-sm">{PRO.map((f) => <li key={f}>{f}</li>)}</ul>
          {plan === "pro" ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-mint-600">You&apos;re on Pro.</p>
              <button onClick={manage} className="btn">
                Manage or cancel subscription
              </button>
            </div>
          ) : enabled && user ? (
            <button onClick={upgrade} className="btn btn-primary">
              Upgrade
            </button>
          ) : (
            <p className="text-sm text-muted">
              <Link href="/login" className="underline">Sign in</Link> to upgrade.
            </p>
          )}
          {error && <p className="text-sm text-coral-600">{error}</p>}
        </section>
      </div>
      <p className="text-xs text-muted">
        Limits and payments only apply when this site is configured with accounts and payments. Otherwise everything is
        free.
      </p>
    </div>
  );
}
