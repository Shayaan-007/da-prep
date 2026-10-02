# Launch checklist

Status as of 2 October 2026, on branch `prelaunch-hardening`.

## Done and verified

- Supabase migration applied to the live project (`supabase/migrations/20261001000000_init.sql`), re-runnable.
- Row-level security checked with two real users: no cross-user read or write, no self-upgrade to Pro, quota functions not callable by users, deleting a user removes their data.
- AI routes (`/api/interview/*`, `/api/star`, `/api/review`, `/api/transcribe`) require sign-in when `ENFORCE_LIMITS=true`; per-user rate limit, 150 AI calls a day, 2 free interviews a month. Verified end to end against real Supabase and OpenAI on a production build.
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

1. **Email provider.** Supabase's built-in email is limited to 2 magic-link emails per hour for the whole project. Create an account with an SMTP provider (for example Resend) and set it under Supabase, Project Settings, Authentication, SMTP.
2. **Auth settings** in Supabase (Authentication, URL Configuration): Site URL = your production domain; add `https://<domain>/**` and `http://localhost:3000/**` to Redirect URLs. Consider shortening the magic-link expiry to 15 minutes (Providers, Email).
3. **Stripe**: account, product and monthly price, then `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`. Enable the customer portal. Run one test-mode checkout, cancel and refund, and one account deletion with a live subscription.
4. **Upstash Redis** (free tier): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
5. **Vercel**: create the project, set every variable from `.env.example` (including `ENFORCE_LIMITS=true`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`), then connect the domain.
6. **Legal review** of `/privacy` and `/terms` by someone qualified. Confirm who the data controller is, whether you need to register with the ICO (a fee is usually due), and complete a short DPIA because users are under 18.
7. **Google sign-in** (optional): OAuth client in Google Cloud Console, then enable in Supabase.
8. **Error tracking** (optional but recommended): Sentry or similar.
9. **Decision: Pro "statement reviews".** The pricing page lists it as a Pro benefit but `/api/review` is available to every signed-in user (within the daily budget). Decide what free users get.
10. **Revoke the Supabase access token** used during setup.

## Content upkeep

- Every firm profile carries one bulk `lastVerified` date (2026-09-30). Re-check each profile before each application cycle; deadlines in `timeline.closes` for past cycles are already out of date.
- Several firms have little or no official sourcing (Aviva, Cisco, Google, JP Morgan, IBM, HSBC); see each profile's `gaps`. Google may not run a UK degree apprenticeship.
- `docs/research/01-selection-process.md` is marked interim; its "still to do" list is open.

## Known limitations

- The free-interview allowance is counted when an interview starts; a client that fakes history can start extra questions, but is still bounded by the daily budget.
- The CSP allows inline scripts (a per-request nonce would make every page dynamic).
- No automated browser tests; accessibility has had one targeted pass, not a full audit.
