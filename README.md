# DA Prep

AI mock interviews, practice tests, an application tracker and guides for UK degree apprenticeship applicants.

## Features
- **Mock interview** (`/interview`): questions built from a pasted job advert and a chosen sector; text or timed video style (60s, one attempt); optional read-aloud, dictation and camera self-view; STAR feedback, score and stronger sample answers.
- **Practice tests** (`/practice`): 48 original SJT, numerical, verbal and logical questions with explanations, timers and a review of the ones you missed.
- **Statement review** (`/review`), **stories bank** with AI STAR builder (`/stories`).
- **Tracker** (`/tracker`) with closing-date warnings and calendar (.ics) export.
- **Progress** (`/progress`): score trend, STAR coverage, and every past interview with full feedback.
- **Sectors** (`/sectors`): what is shared by every degree apprenticeship and what differs for seven sector groups.
- **Content**: process guide, tips (tests, video interviews, assessment centres), timeline, employers, FAQ.
- **Data**: backup/restore as JSON and clear local data from the account page.
- Optional **accounts + cloud sync** (Supabase) and **free-tier limits + Pro subscription** (Stripe).

## Run
```
cp .env.example .env.local   # add OPENAI_API_KEY, or set MOCK_AI=1 to develop without one
npm install
npm run dev                  # http://localhost:3000
npm test                     # vitest
npm run lint && npx tsc --noEmit && npm run build
```
Without Supabase env vars the app is local-only (data in the browser). Without Stripe / `ENFORCE_LIMITS`, everything is free.

`MOCK_AI=1` serves canned AI responses so every screen can be developed and tested offline. It is ignored in production builds.

## Enabling accounts
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Enable Email (magic link) and, optionally, Google in Auth providers; add your site URL to the redirect list.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Enabling limits and payments
1. Create a Stripe subscription Product/Price; set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`.
2. Point a webhook at `/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.deleted`; set `STRIPE_WEBHOOK_SECRET`.
3. Set `ENFORCE_LIMITS=true`. Free users get 2 interviews/month (`FREE_INTERVIEWS` in `lib/server/usage.ts`).

## Deploying
Any Node host works (Vercel is the simplest). Set the environment variables above, including `NEXT_PUBLIC_SITE_URL`. CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a build on every push and pull request.

## Layout
- `app/` pages and API routes (`app/api/*`); `components/` shared UI; `lib/` prompts, schemas, question bank, sector packs, store, backup and calendar helpers; `lib/server/` service-role helpers (never import from client code); `supabase/schema.sql`; `tests/`.
- AI provider: OpenAI Responses API in `lib/ai.ts`. Two tiers, set by `OPENAI_MODEL` (marking and feedback, default `gpt-6.1-sol`) and `OPENAI_MODEL_FAST` (questions and STAR drafts, default `gpt-6-luna`). Requests use `store: false`. Canned dev responses: `lib/mocks.ts`.

## Before going public
- The in-memory rate limiter (`lib/rateLimit.ts`) is per-instance: replace with Redis/Upstash on serverless.
- Privacy notice and terms are drafts: have them reviewed. Check employer data in `lib/employers.ts`, sector content in `lib/sectors.ts` and the guide content, and keep the "last updated" dates current.
- Supabase, Stripe and Google sign-in code paths are written but were not exercised against live services. The OpenAI integration (request shape, model ids, output token budgets) was only exercised through mocks and unit tests, not a live key.
