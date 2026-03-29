# Implementation Plan (MVP)

각 Phase는 순서대로 구현하며, ��전 Phase가 완료되어야 다음으로 넘어간다.

---

## Phase 0: 프로젝트 기반 세팅

> 목표: 개발�� 필요한 인프라와 패키지를 모두 설치한다.

### 0-1. Supabase 프로젝트 생성
- [ ] Supabase 대시보드에서 새 프로젝트 생성
- [ ] Project URL, anon key 확보
- [ ] `next-app/.env.local` 생성
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```

### 0-2. 패키지 설치
- [ ] `@supabase/supabase-js`, `@supabase/ssr` 설치
- [ ] `zod` 설치 (폼 유효성 검증)
- [ ] shadcn/ui 컴포넌트 추가: `input`, `textarea`, `badge`, `card`, `dialog`, `select`, `tabs`, `toast`, `label`, `dropdown-menu`, `separator`

### 0-3. Supabase 클라이언트 구성
- [ ] `lib/supabase/client.ts` — 브라우저용 클라이언트
- [ ] `lib/supabase/server.ts` — Server Component용 클라이언트
- [ ] `lib/supabase/middleware.ts` — Middleware용 클라이언트

### 0-4. 공통 파일 생성
- [ ] `types/index.ts` — 공용 타입 정의
- [ ] `types/supabase.ts` — `supabase gen types`로 DB 타입 생성
- [ ] `lib/constants.ts` — 역할 태그, 학년 옵션 등 상수
- [ ] `lib/validations.ts` — Zod 스키마 (빈 파일, Phase별로 추가)

**완료 기���:** `pnpm dev` 정상 실행, Supabase 연결 확인

---

## Phase 1: DB 스키마 + RLS + Triggers

> 목표: Supabase에 모든 테이블, 인덱스, RLS 정책, 트리거를 세팅한다.

### 1-1. 테이블 생성
- [ ] `profiles` 테이블 (auth.users 1:1)
- [ ] `posts` 테이블
- [ ] `applications` 테이블 (UNIQUE 제약 포함)
- [ ] `notifications` 테이블

### 1-2. 인덱스 생성
- [ ] `posts` — status + created_at, contest_name GIN
- [ ] `applications` — post_id, applicant_id
- [ ] `notifications` — user_id + is_read + created_at

### 1-3. RLS 활성화 + 정책 생성
- [ ] `profiles` — 누구나 SELECT, 본인만 UPDATE
- [ ] `posts` — 누구나 SELECT, 인증 사��자 INSERT, 작성자만 UPDATE
- [ ] `applications` — 지원자/팀장 SELECT, 인증 사용자 INSERT, 팀장만 UPDATE
- [ ] `notifications` — 본인만 SELECT/UPDATE

### 1-4. Functions + Triggers
- [ ] `handle_new_user` — 회원가입 시 profiles 자동 생성
- [ ] `handle_updated_at` — profiles 수정 시 updated_at 갱신
- [ ] `handle_new_application` — 지�� 시 팀장에게 알림 생성
- [ ] `handle_application_status_change` — 승인/거절 시 지원자에게 알림 생성

### 1-5. 타입 생성
- [ ] `supabase gen types typescript` 실행 → `types/supabase.ts` 업데이트

**완료 기준:** Supabase 대시보드에서 테이블/RLS/트리거 모두 확인 가능

---

## Phase 2: 인증 (Google OAuth)

> 목표: Google 로그인 + @snu.ac.kr 제한 + 세션 관리를 완성한다.
>
> 관련 스토리: US-1.1, US-1.2

### 2-1. Supabase Auth 설정
- [ ] Supabase 대시보드에서 Google OAuth 활성화
- [ ] Google Cloud Console에서 OAuth Client ID/Secret 생성
- [ ] Redirect URL ���록: `{SUPABASE_URL}/auth/v1/callback`

### 2-2. Middleware
- [ ] `middleware.ts` 생성
  - Supabase 세션 갱신 (모든 요청)
  - 보호 경로 리다이렉트 (/posts/new, /profile/edit, /mypage, /notifications 등)
  - 로그인 페이지 → 이미 인증 시 / 로 리다이렉트

### 2-3. 로그인 페이지
- [ ] `app/(auth)/layout.tsx` — 헤더 없는 중앙 정렬 레이아웃
- [ ] `app/(auth)/login/page.tsx` — Google 로그인 버튼
  - `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - 에러 파라미터 처�� (`?error=invalid_email`)

### 2-4. OAuth 콜백
- [ ] `app/(auth)/callback/route.ts`
  - code → session ���환
  - @snu.ac.kr 검증 → 실패 시 로그아웃 + /login 리다이렉트
  - 프로필 완성 여부 확인 → 미완성 시 /profile/edit, 완성 시 /

### 2-5. 헤더 인증 UI
- [ ] `components/layout/header.tsx`
  - 비로그인: 로그인 버튼
  - 로그인: 사용자 이름 + 로그아웃 버튼
  - 네비게이션: 모집글, 마이페이지
- [ ] 루트 레이아웃(`app/layout.tsx`)에 Header ���가

**완료 기준:** Google 로그인/로그아웃 동작, @snu.ac.kr 외 계정 차단, 보호 경로 리다이렉트

---

## Phase 3: 프로필

> 목표: 프로필 작성/수정 기능을 완성한다.
>
> 관련 스토리: US-2.1, US-2.2

### 3-1. 공용 컴포넌트
- [ ] `components/shared/skill-tag-select.tsx` — 기술스��/역할 태그 멀티셀렉트

### 3-2. Zod 스키마
- [ ] `lib/validations.ts`에 `profileSchema` 추가
  - name, department, grade, bio(max 200), skills(1개 이상), portfolioUrl?(URL)

### 3-3. 프로필 폼
- [ ] `components/profile/profile-form.tsx` — 프로필 작성/수정 공용 폼
  - 이름, 학과, 학년(Select), 자기소개(Textarea), 기술스택(SkillTagSelect), 포트폴리오URL
  - Zod 유효성 검증 + 에러 메시지
  - Supabase `profiles` UPDATE

### 3-4. 프로필 페이지
- [ ] `app/profile/edit/page.tsx`
  - 서버에서 기존 프로필 데이터 페칭
  - ProfileForm에 초기값 ���달
  - 저장 성공 시 토스트 + / 또는 /mypage로 ���동

**완료 기준:** 최초 로그인 → 프로필 작성 → 저장 → 재로그인 시 기존 데이터 표시

---

## Phase 4: 모집글 CRUD

> 목표: 모집글 작성/조회/수정/상태변경을 완성한다.
>
> 관련 스토리: US-3.1, US-3.2, US-3.3, US-4.1, US-4.2, US-4.3, US-4.4

### 4-1. Zod 스키마
- [ ] `lib/validations.ts`에 `postSchema` 추가

### 4-2. 공용 컴포넌트
- [ ] `components/shared/status-badge.tsx` — 모집중/��료 뱃지
- [ ] `components/shared/empty-state.tsx` — 빈 상태 안내

### 4-3. 모집글 작성
- [ ] `components/posts/post-form.tsx` — 작���/수정 공용 폼
- [ ] `app/posts/new/page.tsx` — 작성 페이지
  - 폼 제출 → `supabase.from('posts').insert()`
  - 성공 시 /posts/[id]로 이동

### 4-4. 모집글 리스트
- [ ] `components/posts/post-card.tsx` — 모집글 카드 컴포넌트
- [ ] `components/posts/post-filters.tsx` — 검색 + 역할 필터 + ������중 토글
- [ ] `app/posts/page.tsx` — 리스트 페이지 (SSR)
  - URL Search Params로 필���/검색 상태 관리
  - Supabase 쿼리 (필터, 검색, 정렬)

### 4-5. 모집글 상세
- [ ] `components/posts/post-detail.tsx` — 상세 본���
- [ ] `components/profile/profile-summary.tsx` — 팀장 프로필 요약
- [ ] `app/posts/[id]/page.tsx` — 상세 페이지 (SSR)
  - 모집글 + 팀장 프로필 조인 페칭
  - 팀장 본인에게만: 수정 버튼, �����자 관리 링크, 모집상태 변경 버튼

### 4-6. 모집글 수정
- [ ] `app/posts/[id]/edit/page.tsx` — 수정 페이지
  - 기존 데이터 프리필
  - `supabase.from('posts').update()`

### 4-7. 모집 상태 변경
- [ ] 상세 페이지에서 모집중 ↔ 모집완료 토글 버튼
  - `supabase.from('posts').update({ status })`

**완료 기준:** 모집글 작성 → 리스트에서 확인 → 상세 조회 → 수정 → 상태 변경 모두 동작

---

## Phase 5: 지원 기능

> 목표: 지원하기 + 지원자 관리(승인/거절)를 완성한다.
>
> 관련 스토리: US-4.5, US-5.1, US-5.2, US-5.3

### 5-1. Zod 스키마
- [ ] `lib/validations.ts`에 `applicationSchema` 추가

### 5-2. 지원하기
- [ ] `components/posts/apply-modal.tsx` — 지원 모�� (Dialog)
  - 내 프로필 요약 미리보기
  - 지원 메시지 Textarea
  - 제출: `supabase.from('applications').insert()`
- [ ] 상세 페이지에 지원 버튼 연결
  - 비로그인 → /login 리다이렉트
  - 이미 지원 → "지원완료" 비활성화
  - 모집완료 → 버튼 비활성화
  - 본인 글 → 버튼 숨김

### 5-3. 지원자 관리
- [ ] `components/applicants/applicant-card.tsx` — 지원자 카드
  - 프로필 정보 + 지원 메시지 + 상태 뱃지
  - 승인/거절 버튼 (PENDING 상태일 때만)
  - 승인 시 연락처(이메일) 표시
- [ ] `components/applicants/applicant-list.tsx` — 카드 리스트
- [ ] `app/posts/[id]/applicants/page.tsx` — 지원자 ��리 페이지
  - 팀장 본인만 ��근 가능 (아니면 /posts로 리다이렉트)
  - `supabase.from('applications').select('*, profiles!applicant_id(*)')`
  - 승인: `.update({ status: 'accepted' })`
  - 거절: `.update({ status: 'rejected' })`

**완료 기준:** 지원 → 팀장이 ��원자 확인 → 승인/거절 → 상태 반영, 중복 지원 차단

---

## Phase 6: 알림

> 목표: 사이트 내 알림 시스템을 완성한다.
>
> 관련 스토리: US-6.1, US-6.2

### 6-1. 알림 벨
- [ ] `components/layout/notification-bell.tsx`
  - 읽지 않은 알림 개수 뱃지
  - 클릭 시 /notifications로 이동
- [ ] Header에 알림 벨 추가

### 6-2. 알림 목록 페이지
- [ ] `app/notifications/page.tsx`
  - 알림 리스트 (최신순)
  - 읽음/안읽음 시각적 구분
  - 알림 클릭 → 해당 모집글로 이동 + 읽음 처리
    - `supabase.from('notifications').update({ is_read: true })`

**완료 기준:** 지원/승인/거절 시 알림 자동 생성(트리거), 알림 벨 뱃지 표시, ���릭 시 읽음 처리

---

## Phase 7: 마이페이지

> 목표: 마이페이지 (내 모집글 + ��� 지원현���)를 완성한다.
>
> 관련 스토리: US-7.1, US-7.2

### 7-1. 마이페이지 컴포넌트
- [ ] `components/mypage/my-posts-tab.tsx` — 내 모집글 목록
  - 모집글 카드 + 상태 + 지원자 수
  - 클릭 시 상세 페이지로 이동
- [ ] `components/mypage/my-applications-tab.tsx` — 내 지원현황 목록
  - 공모전명 + 지원 상태 뱃지 (대기중/승인/거절)
  - 클릭 시 모집글 상세로 이동

### 7-2. 마이페이지
- [ ] `app/mypage/page.tsx`
  - 프로필 요약 + 수정 링크
  - Tabs: 내 모집글 / 내 지원현황

**완료 기준:** 내 모집글 목록 + 지원자 수 표시, 내 지원 현황 + 상태 표시

---

## Phase 8: 랜딩 페이지

> 목표: 서비스 소개 + 최근 모집��� 미리보기 랜딩 페이지를 완성한다.
>
> 관련 스토리: US-8.1

### 8-1. 랜딩 페이지
- [ ] `app/page.tsx` 리뉴얼
  - 히어로 섹션: 서비스 소개 + CTA (로그인/모집글 보기)
  - 최근 모집글 미리보기 (최신 4~6개)
  - 비로그인: 로그인 CTA 표시
  - 로그인: "모집글 보러가기" 버튼

**완료 기준:** 랜딩 페이지에서 ��비스 이해 가능, 최근 모집글 표시, CTA 동작

---

## Phase 요약

| Phase | 내용 | 관련 스토리 |
| --- | --- | --- |
| 0 | 프로젝트 기반 세팅 | — |
| 1 | DB 스키마 + RLS + Triggers | — |
| 2 | 인증 (Google OAuth) | US-1.1, US-1.2 |
| 3 | 프로필 | US-2.1, US-2.2 |
| 4 | 모집글 CRUD | US-3.1~3.3, US-4.1~4.4 |
| 5 | 지원 기능 | US-4.5, US-5.1~5.3 |
| 6 | 알림 | US-6.1, US-6.2 |
| 7 | 마이페이지 | US-7.1, US-7.2 |
| 8 | 랜딩 페이지 | US-8.1 |
