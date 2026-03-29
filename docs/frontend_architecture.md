# Frontend Architecture (MVP)

---

## 1. 기술 스택

| 영역 | 기술 | 버전 |
| --- | --- | --- |
| 프레임워크 | Next.js (App Router, Turbopack) | 16.1.7 |
| 언어 | TypeScript (strict) | 5.9 |
| UI 컴포넌트 | shadcn/ui (Radix UI) | 4.1 |
| 스타일링 | Tailwind CSS + CSS Variables | 4.2 |
| 아이콘 | Lucide React | 1.7 |
| 테마 | next-themes | 0.4 |
| BaaS | Supabase (DB + Auth + Storage) | — |
| Supabase 클라이언트 | @supabase/supabase-js, @supabase/ssr | latest |
| 패키지 매니저 | pnpm | — |

---

## 2. 디렉토리 구조

```
app/
├── layout.tsx                          # 루트 레이아웃 (폰트, ThemeProvider, Header)
├── page.tsx                            # L-01 랜딩 페이지
├── (auth)/
│   ├── layout.tsx                      # 인증 레이아웃 (헤더 없음, 중앙 정렬)
│   ├── login/
│   │   └── page.tsx                    # A-01 로그인 (Google OAuth)
│   └── callback/
│       └── route.ts                    # Supabase OAuth 콜백 처리
├── posts/
│   ├── page.tsx                        # R-01 모집글 리스트
│   ├── new/
│   │   └── page.tsx                    # R-03 모집글 작성
│   └── [id]/
│       ├── page.tsx                    # R-02 모집글 상세
│       ├── edit/
│       │   └── page.tsx               # R-04 모집글 수정
│       └── applicants/
│           └── page.tsx               # R-05 지원자 관리
├── profile/
│   └── edit/
│       └── page.tsx                    # P-01 프로필 작성/수정
├── mypage/
│   └── page.tsx                        # M-01 마이페이지
└── notifications/
    └── page.tsx                        # N-01 알림 목록

components/
├── ui/                                 # shadcn/ui 컴포넌트 (자동 생성)
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── ...
├── layout/
│   ├── header.tsx                      # G-01 헤더
│   └── notification-bell.tsx           # 알림 벨 + 뱃지
├── posts/
│   ├── post-card.tsx                   # 모집글 카드 (리스트용)
│   ├── post-form.tsx                   # 모집글 작성/수정 공용 폼
│   ├── post-detail.tsx                 # 모집글 상세 본문
│   ├── post-filters.tsx               # 검색 + 역할 필터 + 모집중 토글
│   └── apply-modal.tsx                 # G-02 지원 모달
├── applicants/
│   ├── applicant-card.tsx              # 지원자 카드 (프로필 + 메시지 + 버튼)
│   └── applicant-list.tsx              # 지원자 카드 리스트
├── profile/
│   ├── profile-form.tsx                # 프로필 작성/수정 폼
│   └── profile-summary.tsx             # 프로필 요약 (팀장 정보, 마이페이지용)
├── mypage/
│   ├── my-posts-tab.tsx                # 내 모집글 탭
│   └── my-applications-tab.tsx         # 내 지원현황 탭
└── shared/
    ├── skill-tag-select.tsx            # 기술스택/역할 태그 멀티셀렉트
    ├── status-badge.tsx                # 상태 뱃지 (모집중/완료, 대기/승인/거절)
    └── empty-state.tsx                 # 빈 상태 안내 메시지

hooks/
├── use-auth.ts                         # 현재 로그인 사용자 정보 (Supabase 세션)
├── use-notifications.ts                # 알림 목록 + 읽지않은 개수
└── use-posts.ts                        # 모집글 필터/검색 상태 관리

lib/
├── utils.ts                            # cn() 등 유틸리티 (기존)
├── supabase/
│   ├── client.ts                       # 브라우저용 Supabase 클라이언트
│   ├── server.ts                       # Server Component / Route Handler용 클라이언트
│   └── middleware.ts                   # Middleware용 클라이언트 (세션 갱신)
├── validations.ts                      # Zod 스키마 (폼 유효성 검증)
└── constants.ts                        # 역할 태그 목록, 학년 옵션 등 상수

types/
├── index.ts                            # 공용 TypeScript 타입 정의
└── supabase.ts                         # Supabase DB 타입 (supabase gen types로 자동 생성)

middleware.ts                            # Supabase 세션 갱신 + 보호 경로 리다이렉트
```

---

## 3. Supabase 클라이언트 구성

Next.js App Router에서는 환경별로 다른 Supabase 클라이언트를 사용한다.

### 3.1 클라이언트 종류

| 파일 | 사용 환경 | 생성 방식 |
| --- | --- | --- |
| `lib/supabase/client.ts` | Client Component (`"use client"`) | `createBrowserClient()` |
| `lib/supabase/server.ts` | Server Component, Server Action, Route Handler | `createServerClient()` with `cookies()` |
| `lib/supabase/middleware.ts` | `middleware.ts` | `createServerClient()` with `request/response` |

### 3.2 사용 패턴

```
Client Component  → import { createClient } from "@/lib/supabase/client"
Server Component  → import { createClient } from "@/lib/supabase/server"
Middleware        → import { createClient } from "@/lib/supabase/middleware"
```

### 3.3 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 4. Supabase DB 스키마

### 4.1 테이블

```sql
-- 프로필 (auth.users와 1:1)
profiles
├── id (uuid, PK, FK → auth.users.id)
├── email (text)
├── name (text)
├── department (text)           -- 학과
├── grade (text)                -- 학년
├── bio (text)                  -- 자기소개
├── skills (text[])             -- 기술/역량 태그 배열
├── portfolio_url (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- 모집글
posts
├── id (uuid, PK)
├── author_id (uuid, FK → profiles.id)
├── contest_name (text)
├── contest_url (text, nullable)
├── contest_deadline (date, nullable)
├── recruit_deadline (date)
├── recruit_count (int)
├── roles (text[])              -- 모집 역할 태그 배열
├── description (text)
├── status (text: 'recruiting' | 'closed')
└── created_at (timestamptz)

-- 지원
applications
├── id (uuid, PK)
├── post_id (uuid, FK → posts.id)
├── applicant_id (uuid, FK → profiles.id)
├── message (text)
├── status (text: 'pending' | 'accepted' | 'rejected')
├── created_at (timestamptz)
└── UNIQUE(post_id, applicant_id)   -- 중복 지원 방지

-- 알림
notifications
├── id (uuid, PK)
├── user_id (uuid, FK → profiles.id)
├── type (text: 'new_application' | 'accepted' | 'rejected')
├── message (text)
├── post_id (uuid, FK → posts.id)
├── is_read (boolean, default false)
└── created_at (timestamptz)
```

### 4.2 Row Level Security (RLS)

Supabase RLS로 API 라우트 없이 안전하게 데이터 접근을 제어한다.

| 테이블 | 정책 | 조건 |
| --- | --- | --- |
| **profiles** | SELECT | 누구나 (공개 프로필) |
| | UPDATE | `auth.uid() = id` (본인만) |
| **posts** | SELECT | 누구나 |
| | INSERT | 인증된 사용자 |
| | UPDATE | `auth.uid() = author_id` (작성자만) |
| **applications** | SELECT (지원자) | `auth.uid() = applicant_id` |
| | SELECT (팀장) | `auth.uid() = posts.author_id` (본인 모집글의 지원자만) |
| | INSERT | 인증된 사용자, 중복 방지 |
| | UPDATE | `auth.uid() = posts.author_id` (팀장만 승인/거절) |
| **notifications** | SELECT | `auth.uid() = user_id` (본인 알림만) |
| | UPDATE | `auth.uid() = user_id` (읽음 처리) |

### 4.3 Database Function (알림 자동 생성)

지원/승인/거절 시 알림을 자동으로 생성하는 PostgreSQL 트리거를 사용한다.

```
applications INSERT → trigger → notifications에 'new_application' 알림 생성 (수신: 팀장)
applications UPDATE (accepted) → trigger → notifications에 'accepted' 알림 생성 (수신: 지원자)
applications UPDATE (rejected) → trigger → notifications에 'rejected' 알림 생성 (수신: 지원자)
```

---

## 5. 라우팅 & 페이지 설계

### 5.1 Route Group

| Route Group | 용도 | 레이아웃 특징 |
| --- | --- | --- |
| `(auth)` | 로그인, 회원가입 | 헤더 없음, 중앙 정렬 카드 레이아웃 |
| 나머지 | 일반 페이지 | 헤더 포함, 메인 콘텐츠 영역 |

### 5.2 페이지별 렌더링 전략

| 페이지 | 렌더링 | 이유 |
| --- | --- | --- |
| `/` 랜딩 | SSR | 최근 모집글 미리보기 필요, SEO |
| `/posts` 리스트 | SSR + Client 필터 | 초기 데이터 SSR, 필터/검색은 클라이언트 |
| `/posts/[id]` 상세 | SSR | SEO + 공유 링크 대응 |
| `/posts/new`, `/posts/[id]/edit` | Client | 폼 인터랙션 중심 |
| `/posts/[id]/applicants` | Client | 인증 필수, 실시간 상태 변경 |
| `/profile/edit` | Client | 폼 인터랙션 중심 |
| `/mypage` | Client | 인증 필수, 개인 데이터 |
| `/notifications` | Client | 인증 필수, 읽음 상태 변경 |
| `/login` | Client | OAuth 버튼 인터랙션 |

---

## 6. 인증 흐름 (Supabase Auth)

### 6.1 인증 방식

Google OAuth만 사용한다 (이메일/비밀번호 없음).

| 방식 | 설명 |
| --- | --- |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |

### 6.2 로그인 흐름

```
사용자: [Google로 로그인] 클릭
 → supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
 → Google 인증 → /auth/callback으로 리다이렉트
 → app/(auth)/callback/route.ts: code를 세션으로 교환
 → 이메일이 @snu.ac.kr인지 확인
   ├─ 아님: 로그아웃 + /login?error=invalid_email 로 리다이렉트
   └─ 맞음: 프로필 완성 여부 확인
      ├─ 최초 로그인 (프로필 미완성): /profile/edit으로 리다이렉트
      └─ 기존 사용자 (프로필 있음): /으로 리다이렉트
```

### 6.4 인증 상태 접근

| 위치 | 방식 |
| --- | --- |
| Server Component | `createClient()`로 서버 클라이언트 생성 → `supabase.auth.getUser()` |
| Client Component | `createClient()`로 브라우저 클라이언트 생성 → `supabase.auth.getUser()` 또는 `onAuthStateChange()` |
| Middleware | `createClient()`로 미들웨어 클라이언트 생성 → 세션 갱신 + 보호 경로 체크 |

### 6.5 Middleware (세션 갱신 + 경로 보호)

```
middleware.ts
 │
 ├── 1. Supabase 세션 갱신 (모든 요청마다)
 │      → supabase.auth.getUser()로 쿠키 기반 세션 리프레시
 │
 ├── 2. 보호 경로 체크
 │      보호 경로: /posts/new, /posts/*/edit, /posts/*/applicants,
 │                 /profile/edit, /mypage, /notifications
 │      → 미인증 시 /login?redirectTo={현재경로} 로 리다이렉트
 │
 └── 3. 인증 페이지 체크
        /login
        → 이미 로그인 상태면 /으로 리다이렉트
```

---

## 7. 데이터 페칭 패턴

### 7.1 API 라우트 없이 직접 Supabase 호출

Supabase RLS 덕분에 별도 API 라우트 없이 클라이언트에서 직접 DB를 조회/수정한다.

**Server Component (읽기)**
```
// posts/page.tsx (Server)
const supabase = await createClient()
const { data: posts } = await supabase
  .from('posts')
  .select('*, profiles(*)')
  .eq('status', 'recruiting')
  .order('created_at', { ascending: false })
```

**Client Component (쓰기)**
```
// 지원하기
const supabase = createClient()
const { error } = await supabase
  .from('applications')
  .insert({ post_id, applicant_id, message })
// → RLS가 인증 여부와 중복 지원을 자동으로 검증
// → DB Trigger가 팀장에게 알림 자동 생성
```

### 7.2 Server Action (대안)

폼 제출처럼 서버에서 처리가 필요한 경우 Server Action을 사용할 수 있다.

```
// actions/posts.ts
"use server"
export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Zod 검증 → supabase.from('posts').insert(...)
}
```

---

## 8. 컴포넌트 설계

### 8.1 Server vs Client 컴포넌트 분리

```
Server Component (기본)
├── 페이지 레이아웃
├── Supabase 서버 클라이언트로 데이터 페칭
└── 정적 UI 렌더링

Client Component ("use client")
├── 폼 (입력, 유효성 검증, 제출)
├── 필터/검색 (상태 변경이 있는 UI)
├── 모달 (열기/닫기)
├── 알림 벨 (뱃지 업데이트)
├── 토스트 메시지
└── 승인/거절 버튼 (낙관적 업데이트)
```

### 8.2 주요 컴포넌트 구조

**모집글 리스트 페이지 (`/posts`)**
```
PostsPage (Server) ─── Supabase로 초기 데이터 페칭
 ├── PostFilters (Client) ─── 검색창, 역할 필터, 모집중 토글
 └── PostCardGrid (Server)
      └── PostCard × N ─── 공모전명, 역할태그, 마감일, 상태뱃지
```

**모집글 상세 페이지 (`/posts/[id]`)**
```
PostDetailPage (Server) ─── Supabase로 모집글 + 팀장 프로필 조인 페칭
 ├── PostDetail (Server) ─── 공모전 정보, 팀 소개
 ├── ProfileSummary (Server) ─── 팀장 프로필
 ├── ApplyButton (Client) ─── 지원하기/지원완료/비활성화
 └── ApplyModal (Client) ─── 지원 메시지 입력, 프로필 미리보기
```

**지원자 관리 페이지 (`/posts/[id]/applicants`)**
```
ApplicantsPage (Client) ─── Supabase로 지원자 + 프로필 조인 페칭
 └── ApplicantList
      └── ApplicantCard × N ─── 프로필, 지원메시지, 승인/거절 버튼
```

---

## 9. 상태 관리

MVP에서는 별도 전역 상태 라이브러리 없이 관리한다.

| 상태 종류 | 관리 방식 | 예시 |
| --- | --- | --- |
| 서버 데이터 | Server Component에서 Supabase 직접 조회 | 모집글 목록, 상세, 지원자 목록 |
| 인증 상태 | Supabase `auth.getUser()` / `onAuthStateChange()` | 로그인 여부, 현재 사용자 정보 |
| 폼 상태 | React `useState` + Zod validation | 모집글 작성, 프로필 수정 |
| 필터/검색 | URL Search Params (`useSearchParams`) | 역할 필터, 검색어, 모집중 토글 |
| UI 상태 | React `useState` | 모달 열기/닫기, 로딩 |
| 알림 개수 | `use-notifications` 커스텀 훅 | 헤더 뱃지 |

### 필터 → URL 동기화

```
/posts?role=프론트엔드&status=recruiting&q=해커톤
```

- 필터 변경 시 `router.push`로 URL 업데이트
- 페이지 공유/새로고침 시에도 필터 상태 유지

---

## 10. 폼 & 유효성 검증

Zod 스키마를 클라이언트(폼)와 서버(Server Action) 양쪽에서 공유한다.

### 10.1 스키마 정의 (`lib/validations.ts`)

```ts
// 프로필
profileSchema = { name, department, grade, bio: max 200자, skills: 1개 이상, portfolioUrl?: URL }

// 모집글
postSchema = { contestName, recruitDeadline, recruitCount: 1 이상, roles: 1개 이상, description, contestUrl?, contestDeadline? }

// 지원
applicationSchema = { message: 필수 }
```

### 10.2 폼 처리 패턴

```
사용자 입력
 → useState로 폼 상태 관리
 → 제출 시 Zod로 클라이언트 유효성 검증
 → 실패: 필드별 에러 메시지 표시
 → 성공: Supabase 클라이언트로 직접 insert/update
         또는 Server Action 호출
 → 응답에 따라 리다이렉트 또는 에러 표시
```

---

## 11. 핵심 UI 패턴

### 11.1 사용할 shadcn/ui 컴포넌트

| 컴포넌트 | 사용처 |
| --- | --- |
| Button | 모든 액션 버튼 |
| Input | 텍스트 입력 필드 |
| Textarea | 자기소개, 팀 소개, 지원 메시지 |
| Select | 학년 선택 |
| Badge | 상태 뱃지 (모집중/완료, 대기/승인/거절), 역할 태그 |
| Card | 모집글 카드, 지원자 카드, 프로필 카드 |
| Dialog | 지원 모달 |
| Tabs | 마이페이지 (내 모집글 / 내 지원현황) |
| Toast | 성공/에러 피드백 |

### 11.2 공용 컴포넌트

- **태그 멀티셀렉트**: 기술스택, 모집역할에서 공용 (`skill-tag-select.tsx`)
- **상태 뱃지**: 모집 상태, 지원 상태에서 공용 (`status-badge.tsx`)
- **빈 상태**: 데이터 없을 때 안내 메시지 공용 (`empty-state.tsx`)
- **카드 레이아웃**: 모집글/지원자 카드가 동일한 그리드 패턴

---

## 12. 화면 ↔ 컴포넌트 매핑

| 화면 ID | 페이지 경로 | 주요 컴포넌트 |
| --- | --- | --- |
| G-01 | `layout.tsx` | `Header`, `NotificationBell` |
| L-01 | `/` | `PostCard` (미리보기용) |
| A-01 | `/login` | `Button` (Google 로그인) |
| P-01 | `/profile/edit` | `ProfileForm`, `SkillTagSelect` |
| R-01 | `/posts` | `PostFilters`, `PostCard` |
| R-02 | `/posts/[id]` | `PostDetail`, `ProfileSummary`, `ApplyModal` |
| R-03 | `/posts/new` | `PostForm`, `SkillTagSelect` |
| R-04 | `/posts/[id]/edit` | `PostForm`, `SkillTagSelect` |
| R-05 | `/posts/[id]/applicants` | `ApplicantList`, `ApplicantCard`, `StatusBadge` |
| M-01 | `/mypage` | `ProfileSummary`, `MyPostsTab`, `MyApplicationsTab`, `Tabs` |
| N-01 | `/notifications` | `Card` (알림 아이템) |
| G-02 | (모달) | `ApplyModal`, `Dialog` |
