# Launch checklist

Status as of 2 October 2026, on branch `prelaunch-hardening`.

## Done and verified

- Supabase migration applied to the live project (`supabase/migrations/20261001000000_init.sql`), re-runnable.
- Row-level security checked with two real users: no cross-user read or write, no self-upgrade to Pro, quota functions not callable by users, deleting a user removes their data.
- AI routes (`/api/interview/*`, `/api/star`, `/api/review`, `/api/transcribe`) require sign-in when `ENFORCE_LIMITS=true`; per-user rate limit, 150 AI calls a day, 2 free interviews a month and 2 free reviews a week (Pro is unlimited for both). Verified end to end against real Supabase and OpenAI on a production build.
- OpenAI model ids (`gpt-6.1-sol`, `gpt-6-luna`, `gpt-transcribe`) accepted by the live API.
- Moderation and UK safeguarding signposting on all free-text AI inputs (verified live).
- Prompt-injection hardening: user text can no longer close our prompt delimiters.
- Security headers and CSP (verified in a real browser: no blocked resources, pages hydrate).
- Stripe: no double subscriptions, customer reuse, billing portal, plan changes on `subscription.updated`, webhook retries on database errors, subscription cancelled before account deletion. Unit tested; **not tested against Stripe itself**.
- Privacy notice and terms rewritten (UK GDPR and Children's Code oriented).
- Content corrections (UCAS, deadlines, video length, stale links, closed schemes, negative single-source claims).
- One employer directory covering all 32 researched firms; firm and directory data tests; sitemap includes every firm page.
- `/api/health`, global error boundary, loading state, OG image, Dependabot, CI typecheck and audit.
- Accessibility pass on practice tests (timer, answer state, feedback region).

## Needs you (accounts, keys, decisions)

1. **Email provider (you are setting up Resend).** Supabase's built-in email is limited to 2 magic-link emails per hour for the whole project. Create an account with an SMTP provider (for example Resend) and set it under Supabase, Project Settings, Authentication, SMTP.
2. **Auth settings** in Supabase (Authentication, URL Configuration): Site URL = your production domain; add `https://<domain>/**` and `http://localhost:3000/**` to Redirect URLs. Consider shortening the magic-link expiry to 15 minutes (Providers, Email).
3. **Stripe**: account, product and monthly price, then `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`. Enable the customer portal. Run one test-mode checkout, cancel and refund, and one account deletion with a live subscription.
4. **Upstash Redis** (free tier): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
5. **Vercel**: create the project, set every variable from `.env.example` (including `ENFORCE_LIMITS=true`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`), then connect the domain.
6. **Legal review** of `/privacy` and `/terms` by someone qualified. Confirm who the data controller is, whether you need to register with the ICO (a fee is usually due), and complete a short DPIA because users are under 18.
7. **Google sign-in** (optional): OAuth client in Google Cloud Console, then enable in Supabase.
8. **Error tracking** (optional but recommended): Sentry or similar.
9. **Resend**: once set up, add its SMTP details in Supabase (item 1) and verify your sending domain.
10. **Revoke the Supabase access token** used during setup.

## Content upkeep

- Every firm profile carries one bulk `lastVerified` date (2026-09-30). Re-check each profile before each application cycle; deadlines in `timeline.closes` for past cycles are already out of date.
- Several firms have little or no official sourcing (Aviva, Cisco, Google, JP Morgan, IBM, HSBC); see each profile's `gaps`. Google may not run a UK degree apprenticeship.
- `docs/research/01-selection-process.md` is marked interim; its "still to do" list is open.

## Assessment replicas and mock processes (branch `assessment-replicas`)

Built and verified in a browser: ten replica tests (timers, adaptive serving, no-back, calculator, resume after reload, forced expiry, ranking and most/least formats, trait profile) and the Barclays mock end to end with real AI scoring, resume from a new tab, and a production build. Unit tests recompute every generated answer independently.

Apply before this goes live: `supabase/migrations/20261002010000_mocks_key.sql` (already applied to the development project).

What the replicas are not:
- **Not the vendors' real tests.** They copy the published format (counts, timing, response style), not questions, norms, difficulty calibration or adaptive algorithms. Every replica is labelled approximate and lists what is unconfirmed.
- **Interactive SHL responses** (building charts, filling spreadsheets) are replaced by multiple choice on tables and charts.
- **Games** (Arctic Shores, Pymetrics, BAE) and **group exercises** are not simulated; those stages appear as information with a note.
- **Voice answers in the mock stages** use the existing recorder and transcription, but were not exercised in automated browser tests (no microphone). Typed answers were.
- **PwC is the least certain mock**: its stage list, video format and assessment-centre length conflict across sources.
- **Reported questions** are paraphrased candidate reports from single sources; several firms have none yet (see each profile's `gaps`).

Costs and limits: a mock process counts as one interview against the free monthly allowance (charged when its first question stage is scored), and every scoring call also counts against the daily AI budget.

## Known limitations

- The free-interview allowance is counted when an interview starts; a client that fakes history can start extra questions, but is still bounded by the daily budget.
- The CSP allows inline scripts (a per-request nonce would make every page dynamic).
- No automated browser tests; accessibility has had one targeted pass, not a full audit.

## Domain and Stripe status (2 October 2026)

- **Canonical domain is `https://www.level6.uk`.** Vercel redirects the bare domain `level6.uk` to `www` with a 308. Set `NEXT_PUBLIC_SITE_URL=https://www.level6.uk` in Vercel (Production) and use `www` in Supabase's Site URL. **The Stripe webhook URL must be `https://www.level6.uk/api/stripe/webhook`: Stripe does not follow redirects, so the bare domain would silently fail.**
- **Vercel needs its environment variables.** The live site responds, but `/api/health` showed ai, accounts and payments all false, meaning the Production variables were not set when it last built. Set them and redeploy (`NEXT_PUBLIC_*` values are baked in at build time).
- **Stripe, test mode: done and verified against the local app.** A test product (Level6 Pro, £9.99 a month), price and billing-portal configuration exist in the sandbox account, and `STRIPE_PRICE_ID` and `NEXT_PUBLIC_PRO_PRICE_LABEL` are in the local `.env.local`. Verified with a temporary user: checkout requires sign-in and creates a subscription session for the Pro price tied to the user; the billing portal opens; signed webhooks upgrade and downgrade the plan; a bad signature is rejected; a Pro user cannot buy twice; deleting an account cancels the Stripe subscription first. Not tested: a card entered on Stripe's hosted page, and real Stripe-delivered webhooks (the handler was exercised with correctly signed events).
- **Stripe, live mode: not done.** Needs the activated account, a restricted live key, then a live product, price, portal configuration and webhook endpoint (live objects are separate from the test ones), and the three live values in Vercel: `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`.
