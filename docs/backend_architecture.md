# Backend Architecture (MVP)

Supabase를 BaaS로 사용하여 별도 백엔드 서버 없이 구성한다.

---

## 1. 기술 스택

| 영역 | 기술 | 설명 |
| --- | --- | --- |
| Database | Supabase PostgreSQL | 메인 데이터 저장소 |
| Auth | Supabase Auth | Email/Password + Google OAuth |
| 접근 제어 | Row Level Security (RLS) | 테이블 단위 보안 정책 |
| 자동화 | PostgreSQL Triggers + Functions | 알림 생성, 프로필 초기화 |
| 타입 생성 | Supabase CLI (`supabase gen types`) | DB 스키마 → TypeScript 타입 자동 생성 |
| 클라이언트 | @supabase/supabase-js, @supabase/ssr | Next.js App Router 통합 |

---

## 2. 데이터베이스 스키마

### 2.1 ERD

```
┌──────────────┐       ┌──────────────┐
│  auth.users  │       │   profiles   │
│──────────────│       │──────────────│
│  id (PK)     │──1:1──│  id (PK,FK)  │
│  email       │       │  email       │
│  ...         │       │  name        │
└──────────────┘       │  department  │
                       │  grade       │
                       │  bio         │
                       │  skills[]    │
                       │  portfolio_url│
                       └──────┬───────┘
                              │
                 ┌────────────┼────────────┐
                 │ 1:N        │            │ 1:N
                 ▼            │            ▼
          ┌──────────┐       │     ┌───────────────┐
          │  posts   │       │     │ notifications │
          │──────────│       │     │───────────────│
          │  id (PK) │       │     │  id (PK)      │
          │  author_id│──FK──┘     │  user_id (FK) │
          │  contest_│             │  type          │
          │  name    │             │  message       │
          │  ...     │             │  post_id (FK)  │
          │  status  │             │  is_read       │
          └────┬─────┘             └───────────────┘
               │ 1:N                       ▲
               ▼                           │
        ┌──────────────┐                   │
        │ applications │                   │
        │──────────────│                   │
        │  id (PK)     │                   │
        │  post_id (FK)│                   │
        │  applicant_id│──FK── profiles    │
        │  message     │                   │
        │  status      │───── trigger ─────┘
        │  UNIQUE(post_id, applicant_id)   │
        └──────────────┘
```

### 2.2 테이블 정의

#### profiles

```sql
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
```

#### posts

```sql
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
```

#### applications

```sql
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (post_id, applicant_id)
);
```

#### notifications

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('new_application', 'accepted', 'rejected')),
  message text not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
```

### 2.3 인덱스

```sql
-- 모집글 리스트: 상태 필터 + 최신순 정렬
create index idx_posts_status_created on public.posts (status, created_at desc);

-- 모집글 검색: 공모전 이름
create index idx_posts_contest_name on public.posts using gin (to_tsvector('simple', contest_name));

-- 지원: 모집글별 지원자 조회
create index idx_applications_post_id on public.applications (post_id);

-- 지원: 사용자별 지원 현황 조회
create index idx_applications_applicant_id on public.applications (applicant_id);

-- 알림: 사용자별 알림 조회 (읽지 않은 것 우선)
create index idx_notifications_user_id on public.notifications (user_id, is_read, created_at desc);
```

---

## 3. Row Level Security (RLS)

모든 테이블에 `alter table ... enable row level security;`를 적용한다.

### 3.1 profiles

```sql
-- 누구나 프로필 조회 가능 (공개)
create policy "profiles_select"
  on public.profiles for select
  using (true);

-- 본인만 프로필 수정
create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

### 3.2 posts

```sql
-- 누구나 모집글 조회 가능
create policy "posts_select"
  on public.posts for select
  using (true);

-- 로그인한 사용자만 작성
create policy "posts_insert"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- 작성자만 수정 (내용 수정 + 상태 변경)
create policy "posts_update"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
```

### 3.3 applications

```sql
-- 지원자 본인 또는 해당 모집글 작성자만 조회
create policy "applications_select"
  on public.applications for select
  using (
    auth.uid() = applicant_id
    or auth.uid() = (select author_id from public.posts where id = post_id)
  );

-- 로그인한 사용자만 지원 (본인 명의로만)
create policy "applications_insert"
  on public.applications for insert
  with check (
    auth.uid() = applicant_id
    and auth.uid() != (select author_id from public.posts where id = post_id)
  );

-- 모집글 작성자(팀장)만 승인/거절
create policy "applications_update"
  on public.applications for update
  using (
    auth.uid() = (select author_id from public.posts where id = post_id)
  );
```

### 3.4 notifications

```sql
-- 본인 알림만 조회
create policy "notifications_select"
  on public.notifications for select
  using (auth.uid() = user_id);

-- 본인 알림만 읽음 처리
create policy "notifications_update"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 4. Database Functions & Triggers

### 4.1 프로필 자동 생성

회원가입 시 `auth.users`에 레코드가 생기면 `profiles`에 초기 프로필을 자동 생성한다.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

### 4.2 updated_at 자동 갱신

```sql
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
```

### 4.3 지원 시 알림 생성 (팀장에게)

```sql
create or replace function public.handle_new_application()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_author_id uuid;
  v_contest_name text;
  v_applicant_name text;
begin
  -- 모집글 작성자와 공모전명 조회
  select author_id, contest_name into v_author_id, v_contest_name
  from public.posts where id = new.post_id;

  -- 지원자 이름 조회
  select name into v_applicant_name
  from public.profiles where id = new.applicant_id;

  -- 팀장에게 알림 생성
  insert into public.notifications (user_id, type, message, post_id)
  values (
    v_author_id,
    'new_application',
    v_applicant_name || '님이 [' || v_contest_name || '] 팀에 지원했습니다',
    new.post_id
  );

  return new;
end;
$$;

create trigger on_application_created
  after insert on public.applications
  for each row
  execute function public.handle_new_application();
```

### 4.4 승인/거절 시 알림 생성 (지원자에게)

```sql
create or replace function public.handle_application_status_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_contest_name text;
  v_message text;
begin
  -- 상태가 변경된 경우만 처리
  if old.status = new.status then
    return new;
  end if;

  -- 공모전명 조회
  select contest_name into v_contest_name
  from public.posts where id = new.post_id;

  -- 알림 메시지 생성
  if new.status = 'accepted' then
    v_message := '[' || v_contest_name || '] 팀에 승인되었습니다';
  elsif new.status = 'rejected' then
    v_message := '[' || v_contest_name || '] 팀 지원이 거절되었습니다';
  else
    return new;
  end if;

  -- 지원자에게 알림 생성
  insert into public.notifications (user_id, type, message, post_id)
  values (
    new.applicant_id,
    new.status,
    v_message,
    new.post_id
  );

  return new;
end;
$$;

create trigger on_application_status_changed
  after update on public.applications
  for each row
  execute function public.handle_application_status_change();
```

---

## 5. Supabase Auth 설정

### 5.1 인증 제공자

| Provider | 설정 |
| --- | --- |
| Google OAuth | Client ID/Secret 설정, Redirect URL 등록 |

> Email/Password 인증은 사용하지 않는다. Google OAuth만 사용.

### 5.2 이메일 제한 (@snu.ac.kr)

OAuth 콜백에서 서버 사이드로 검증한다.

| 검증 위치 | 방법 |
| --- | --- |
| **서버 (OAuth 콜백)** | `app/(auth)/callback/route.ts`에서 이메일 확인 후 @snu.ac.kr이 아니면 로그아웃 |

### 5.3 OAuth 콜백 처리

```
GET /auth/callback?code=xxx
 │
 ├── 1. code → session 교환 (supabase.auth.exchangeCodeForSession)
 ├── 2. 사용자 이메일 확인
 │      ├─ @snu.ac.kr 아님 → supabase.auth.signOut() → /login?error=invalid_email
 │      └─ @snu.ac.kr 맞음 ▼
 ├── 3. 프로필 완성 여부 확인
 │      ├─ 미완성 (department 빈 값) → /profile/edit
 │      └─ 완성 → /
 └── 4. 리다이렉트
```

---

## 6. 데이터 접근 패턴

### 6.1 주요 쿼리

#### 모집글 리스트 (필터 + 검색 + 페이지네이션)

```
supabase
  .from('posts')
  .select('*, profiles!author_id(name, department, skills)')
  .eq('status', 'recruiting')           -- 모집중 필터 (선택)
  .contains('roles', ['프론트엔드'])      -- 역할 필터 (선택)
  .ilike('contest_name', '%해커톤%')     -- 키워드 검색 (선택)
  .order('created_at', { ascending: false })
  .range(0, 11)                          -- 페이지네이션 (12개씩)
```

#### 모집글 상세 + 팀장 프로필 + 내 지원 여부

```
-- 모집글 + 팀장 프로필
supabase
  .from('posts')
  .select('*, profiles!author_id(*)')
  .eq('id', postId)
  .single()

-- 현재 사용자의 지원 여부 (로그인 시)
supabase
  .from('applications')
  .select('id, status')
  .eq('post_id', postId)
  .eq('applicant_id', userId)
  .maybeSingle()
```

#### 지원자 목록 (팀장)

```
supabase
  .from('applications')
  .select('*, profiles!applicant_id(*)')
  .eq('post_id', postId)
  .order('created_at', { ascending: false })
```

#### 마이페이지 - 내 모집글

```
supabase
  .from('posts')
  .select('*, applications(count)')
  .eq('author_id', userId)
  .order('created_at', { ascending: false })
```

#### 마이페이지 - 내 지원 현황

```
supabase
  .from('applications')
  .select('*, posts(contest_name, status)')
  .eq('applicant_id', userId)
  .order('created_at', { ascending: false })
```

#### 알림 (읽지 않은 개수 + 목록)

```
-- 읽지 않은 알림 개수
supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false)

-- 알림 목록
supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 19)
```

### 6.2 쓰기 작업

| 작업 | 쿼리 | 비고 |
| --- | --- | --- |
| 프로필 수정 | `.from('profiles').update({...}).eq('id', userId)` | RLS가 본인 검증 |
| 모집글 작성 | `.from('posts').insert({...})` | author_id = auth.uid() |
| 모집글 수정 | `.from('posts').update({...}).eq('id', postId)` | RLS가 작성자 검증 |
| 모집 상태 변경 | `.from('posts').update({ status }).eq('id', postId)` | RLS가 작성자 검증 |
| 팀 지원 | `.from('applications').insert({...})` | UNIQUE 제약이 중복 방지 |
| 지원 승인/거절 | `.from('applications').update({ status }).eq('id', appId)` | RLS가 팀장 검증, Trigger가 알림 생성 |
| 알림 읽음 | `.from('notifications').update({ is_read: true }).eq('id', notiId)` | RLS가 본인 검증 |

---

## 7. 보안

### 7.1 보안 레이어

```
요청 흐름:

[브라우저] → [Supabase Client + anon key]
                    │
                    ▼
            [Supabase Auth] ─── JWT 검증
                    │
                    ▼
            [Row Level Security] ─── 테이블별 접근 정책
                    │
                    ▼
            [PostgreSQL] ─── CHECK 제약조건, UNIQUE 제약조건
```

### 7.2 보안 체크리스트

| 위협 | 대응 |
| --- | --- |
| 비인증 접근 | RLS `auth.uid()` 검증 |
| 타인 데이터 수정 | RLS `auth.uid() = author_id` 등 소유권 검증 |
| 중복 지원 | `UNIQUE(post_id, applicant_id)` 제약조건 |
| 자기 모집글에 지원 | RLS INSERT 정책에서 `auth.uid() != author_id` 검증 |
| 잘못된 상태값 | `CHECK (status in (...))` 제약조건 |
| 모집인원 음수 | `CHECK (recruit_count >= 1)` 제약조건 |
| anon key 노출 | anon key는 공개 가능 — RLS가 실제 보안 담당 |
| SQL Injection | Supabase Client가 parameterized query 사용 |

### 7.3 security definer 함수 주의

Trigger 함수에서 `security definer`를 사용하는 경우 RLS를 우회하므로, 함수 내부에서 직접 권한을 검증하거나 `set search_path = ''`로 스키마 경로를 고정한다.

---

## 8. Middleware (Next.js)

`middleware.ts`에서 Supabase 세션 갱신과 경로 보호를 처리한다.

```
middleware.ts
 │
 ├── 1. Supabase 세션 갱신
 │      모든 요청마다 supabase.auth.getUser() 호출
 │      → 만료된 토큰을 자동으로 리프레시
 │      → 갱신된 쿠키를 응답에 설정
 │
 ├── 2. 보호 경로 체크
 │      대상: /posts/new, /posts/*/edit, /posts/*/applicants,
 │            /profile/edit, /mypage, /notifications
 │      → 미인증 시 /login?redirectTo={현재경로}로 리다이렉트
 │
 └── 3. 인증 페이지 체크
        대상: /login, /signup
        → 이미 로그인 상태면 /로 리다이렉트
```

---

## 9. 에러 처리

### 9.1 Supabase 에러 코드

| 에러 | 원인 | 사용자 메시지 |
| --- | --- | --- |
| `23505` (unique_violation) | 중복 지원 | "이미 지원한 팀입니다" |
| `42501` (insufficient_privilege) | RLS 위반 | "권한이 없습니다" |
| `23503` (foreign_key_violation) | 존재하지 않는 FK | "해당 모집글을 찾을 수 없습니다" |
| `23514` (check_violation) | CHECK 제약 위반 | "입력값이 올바르지 않습니다" |
| `PGRST116` | `.single()` 결과 없음 | "데이터를 찾을 수 없습니다" |

### 9.2 프론트엔드 에러 처리 패턴

```
const { data, error } = await supabase.from('...').insert({...})

if (error) {
  if (error.code === '23505') {
    toast.error('이미 지원한 팀입니다')
  } else {
    toast.error('문제가 발생했습니다. 다시 시도해주세요.')
    console.error(error)
  }
  return
}

// 성공 처리
```

---

## 10. 마이그레이션 실행 순서

Supabase Dashboard의 SQL Editor 또는 Supabase CLI로 실행한다.

```
1. 테이블 생성
   → profiles → posts → applications → notifications

2. 인덱스 생성

3. RLS 활성화 + 정책 생성
   → 각 테이블별 enable RLS + create policy

4. Functions 생성
   → handle_new_user
   → handle_updated_at
   → handle_new_application
   → handle_application_status_change

5. Triggers 생성
   → on_auth_user_created
   → on_profiles_updated
   → on_application_created
   → on_application_status_changed

6. Supabase Auth 설정
   → Email/Password 활성화
   → Google OAuth 설정
```
