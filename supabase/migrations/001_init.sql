create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  markdown text not null,
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.progress (
  user_id uuid not null references public.users(id) on delete cascade,
  step_id uuid not null references public.steps(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, step_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  answer_index int not null,
  explanation text not null
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score int not null,
  answers jsonb not null,
  attempt_kind text not null default 'lesson',
  attempted_at timestamptz default now()
);

create table if not exists public.vocab_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  definition text not null,
  interval_days int not null default 1
);

create table if not exists public.vocab_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  term_id uuid not null references public.vocab_terms(id) on delete cascade,
  quality int not null,
  next_review_at timestamptz not null,
  reviewed_at timestamptz default now()
);

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.steps enable row level security;
alter table public.progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.vocab_terms enable row level security;
alter table public.vocab_reviews enable row level security;

create policy "read learning content" on public.modules for select using (true);
create policy "read lessons" on public.lessons for select using (true);
create policy "read steps" on public.steps for select using (true);
create policy "read quizzes" on public.quizzes for select using (true);
create policy "read quiz questions" on public.quiz_questions for select using (true);
create policy "read vocab" on public.vocab_terms for select using (true);

create policy "user progress own rows" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user quiz attempts own rows" on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user vocab reviews own rows" on public.vocab_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
