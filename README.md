# DA Prep

AI mock interviews, practice tests, application tracker and guides for UK degree apprenticeships.

## Features
- **Mock interview** (`/interview`): questions tailored to a pasted job advert; text or timed video style (60s, one attempt); optional read-aloud, dictation and camera self-view; STAR feedback, score and stronger sample answers.
- **Practice tests** (`/practice`): original SJT, numerical, verbal and logical questions with explanations and timers.
- **Statement review** (`/review`) and **stories bank** with AI STAR builder (`/stories`).
- **Tracker** (`/tracker`), **progress** (`/progress`), **employers**, **guide**, **timeline**, **FAQ**.
- Optional **accounts + cloud sync** (Supabase), **free-tier limits and Pro subscription** (Stripe).

## Run
```
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
npm test                     # vitest
npm run lint && npm run build
```
Without Supabase env vars the app is local-only (data in the browser). Without Stripe/`ENFORCE_LIMITS`, everything is free.

## Enabling accounts
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Enable Email (magic link) and, optionally, Google in Auth providers; add your site URL to the redirect list.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Enabling limits and payments
1. Create a Stripe subscription Product/Price; set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`.
2. Point a webhook at `/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.deleted`; set `STRIPE_WEBHOOK_SECRET`.
3. Set `ENFORCE_LIMITS=true`. Free users get 2 interviews/month (`FREE_INTERVIEWS` in `lib/server/usage.ts`).

## Layout
- `app/` pages and API routes (`app/api/*`), `lib/` prompts, schemas, question bank, store; `lib/server/` service-role helpers (never import from client code); `supabase/schema.sql`.
- Claude model: `lib/claude.ts` (`MODEL`).

## Before going public
- The in-memory rate limiter (`lib/rateLimit.ts`) is per-instance: replace with Redis/Upstash on serverless.
- Have the privacy notice reviewed; check employer data in `lib/employers.ts` and guide content, and keep the "last updated" dates current.
- Supabase, Stripe and Google sign-in code paths are written but were not exercised against live services.
