# SVOV Academy (Spec • Orchestrate • Verify)

Mobile-first PWA learning platform built with **Next.js + TypeScript + Supabase**.

## Features

- Email magic-link auth via Supabase
- Modules → Lessons → Steps navigation
- Markdown lesson viewer (DB-backed with local dev fallback)
- Step progress tracking with completion %
- Quiz engine (multiple-choice, scoring, explanations)
- Vocabulary terms with spaced repetition review queue
- Benchmarks (baseline + monthly retest history chart)
- Admin screen restricted to a configured admin email

## Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth + Postgres)

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ADMIN_EMAIL=admin@svov.academy
```

If Supabase vars are missing, the app runs in local-dev mode using seeded in-memory content.

## Database schema + seed

- Migration: `supabase/migrations/001_init.sql`
- Seed script: `scripts/seed.sql`

Apply with your preferred Supabase workflow (CLI or SQL editor).

## Notes

- Sample content includes **1 module** and **3 lessons**.
- Example Markdown files are included under `/content` for local authoring.
