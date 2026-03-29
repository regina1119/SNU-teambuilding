-- =============================================
-- 1. 테이블 생성
-- =============================================

-- profiles (auth.users와 1:1)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  department text not null default '',
  grade text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- posts (모집글)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  contest_name text not null,
  contest_url text,
  contest_deadline date,
  recruit_deadline date not null,
  recruit_count int not null check (recruit_count >= 1),
  roles text[] not null default '{}',
  description text not null,
  status text not null default 'recruiting' check (status in ('recruiting', 'closed')),
  created_at timestamptz not null default now()
);

-- applications (지원)
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (post_id, applicant_id)
);

-- notifications (알림)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('new_application', 'accepted', 'rejected')),
  message text not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
