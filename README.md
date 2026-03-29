# SNU TeamUp

서울대학교 공모전 팀빌딩 플랫폼

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **BaaS:** Supabase (PostgreSQL, Auth, RLS)
- **Auth:** Google OAuth (@snu.ac.kr only)
- **Package Manager:** pnpm

## Repository Structure

```
SNU-teambuilding/
├── CLAUDE.md                               # Claude Code 프로젝트 컨텍스트
├── README.md
│
├── docs/                                   # 기획 문서
│   ├── prd.md                              # Product Requirements Document
│   ├── user_stories.md                     # 유저 스토리
│   ├── screen_list_and_user_flows.md       # 화면 목록 + 유저 플로우
│   ├── frontend_architecture.md            # 프론트엔드 아키텍처
│   └── backend_architecture.md             # 백엔드 아키텍처 (Supabase)
│
└── next-app/                               # Next.js 애플리케이션
    │
    │── app/                                # App Router
    │   ├── globals.css                     # 글로벌 스타일 (Tailwind + CSS 변수)
    │   ├── layout.tsx                      # 루트 레이아웃 (폰트, ThemeProvider)
    │   ├── page.tsx                        # 랜딩 페이지
    │   ├── favicon.ico                     # 파비콘
    │   │
    │   ├── (auth)/                         # [예정] 인증 (헤더 없는 레이아웃)
    │   │   ├── layout.tsx                  # 중앙 정렬 카드 레이아웃
    │   │   ├── login/
    │   │   │   └── page.tsx               # 로그인 (Google OAuth)
    │   │   └── callback/
    │   │       └── route.ts               # OAuth 콜백 처리
    │   │
    │   ├── posts/                          # [예정] 모집글
    │   │   ├── page.tsx                    # 모집글 리스트 (검색, 필터)
    │   │   ├── new/
    │   │   │   └── page.tsx               # 모집글 작성
    │   │   └── [id]/
    │   │       ├── page.tsx               # 모집글 상세
    │   │       ├── edit/
    │   │       │   └── page.tsx           # 모집글 수정
    │   │       └── applicants/
    │   │           └── page.tsx           # 지원자 관리 (팀장 전용)
    │   │
    │   ├── profile/                        # [예정] 프로필
    │   │   └── edit/
    │   │       └── page.tsx               # 프로필 작성/수정
    │   │
    │   ├── mypage/                         # [예정] 마이페이지
    │   │   └── page.tsx                   # 내 모집글 + 내 지원현황
    │   │
    │   └── notifications/                  # [예정] 알림
    │       └── page.tsx                   # 알림 목록
    │
    ├── components/
    │   ├── theme-provider.tsx              # 다크모드 ThemeProvider
    │   │
    │   ├── ui/                            # shadcn/ui (자동 생성)
    │   │   └── button.tsx                 # ✅ 설치됨
    │   │   # [예정] input, textarea, badge, card, dialog, select, tabs, toast
    │   │
    │   ├── layout/                        # [예정] 레이아웃 컴포넌트
    │   │   ├── header.tsx                 # 헤더 (네비게이션, 알림, 로그인)
    │   │   └── notification-bell.tsx      # 알림 벨 + 읽지않은 개수 뱃지
    │   │
    │   ├── posts/                         # [예정] 모집글 관련 컴포넌트
    │   │   ├── post-card.tsx              # 모집글 카드
    │   │   ├── post-form.tsx              # 모집글 작성/수정 공용 폼
    │   │   ├── post-detail.tsx            # 모집글 상세 본문
    │   │   ├── post-filters.tsx           # 검색 + 역할 필터 + 모집중 토글
    │   │   └── apply-modal.tsx            # 지원 모달
    │   │
    │   ├── applicants/                    # [예정] 지원자 관련 컴포넌트
    │   │   ├── applicant-card.tsx         # 지원자 카드
    │   │   └── applicant-list.tsx         # 지원자 카드 리스트
    │   │
    │   ├── profile/                       # [예정] 프로필 관련 컴포넌트
    │   │   ├── profile-form.tsx           # 프로필 작성/수정 폼
    │   │   └── profile-summary.tsx        # 프로필 요약 카드
    │   │
    │   ├── mypage/                        # [예정] 마이페이지 컴포넌트
    │   │   ├── my-posts-tab.tsx           # 내 모집글 탭
    │   │   └── my-applications-tab.tsx    # 내 지원현황 탭
    │   │
    │   └── shared/                        # [예정] 공용 컴포넌트
    │       ├── skill-tag-select.tsx       # 기술스택/역할 태그 멀티셀렉트
    │       ├── status-badge.tsx           # 상태 뱃지 (모집중/완료, 대기/승인/거절)
    │       └── empty-state.tsx            # 빈 상태 안내 메시지
    │
    ├── hooks/                             # [예정] 커스텀 React 훅
    │   ├── use-auth.ts                    # 로그인 사용자 정보
    │   ├── use-notifications.ts           # 알림 목록 + 읽지않은 개수
    │   └── use-posts.ts                   # 모집글 필터/검색 상태
    │
    ├── lib/                               # 유틸리티 및 설정
    │   ├── utils.ts                       # ✅ cn() 헬퍼
    │   ├── supabase/                      # [예정] Supabase 클라이언트
    │   │   ├── client.ts                  # 브라우저용 클라이언트
    │   │   ├── server.ts                  # Server Component용 클라이언트
    │   │   └── middleware.ts              # Middleware용 클라이언트
    │   ├── validations.ts                 # [예정] Zod 스키마
    │   └── constants.ts                   # [예정] 상수 (역할 태그, 학년 옵션)
    │
    ├── types/                             # [예정] TypeScript 타입
    │   ├── index.ts                       # 공용 타입 정의
    │   └── supabase.ts                    # Supabase DB 타입 (자동 생성)
    │
    ├── supabase/                          # [예정] Supabase 마이그레이션
    │   └── migrations/
    │       ├── 001_create_tables.sql      # 테이블 생성
    │       ├── 002_create_indexes.sql     # 인덱스 생성
    │       ├── 003_enable_rls.sql         # RLS 정책 설정
    │       └── 004_create_triggers.sql    # 트리거 + 함수 생성
    │
    ├── public/                            # 정적 파일
    │
    ├── middleware.ts                       # [예정] Supabase 세션 갱신 + 경로 보호
    ├── next.config.mjs                    # Next.js 설정
    ├── tsconfig.json                      # TypeScript 설정
    ├── postcss.config.mjs                 # PostCSS 설정
    ├── eslint.config.mjs                  # ESLint 설정
    ├── components.json                    # shadcn/ui 설정
    ├── .prettierrc                        # Prettier 설정
    ├── .prettierignore                    # Prettier 제외 패턴
    ├── .gitignore
    ├── package.json
    ├── pnpm-lock.yaml
    └── .env.local                         # [예정] 환경 변수 (git 제외)
        ├── NEXT_PUBLIC_SUPABASE_URL
        └── NEXT_PUBLIC_SUPABASE_ANON_KEY
```

> ✅ = 현재 존재, [예정] = 구현 예정

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 (Turbopack) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 실행 |
| `pnpm format` | Prettier 포맷팅 |
| `pnpm typecheck` | TypeScript 타입 체크 |

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
```

`components/ui/` 디렉토리에 컴포넌트가 생성됩니다.
