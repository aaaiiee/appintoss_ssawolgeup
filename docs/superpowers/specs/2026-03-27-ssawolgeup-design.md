# 싸월급 — Design Specification

> "회사 화장실에서 월급을 번다" — 직장인 B급 유머 출석 미니앱

## 1. Overview

| 항목 | 내용 |
|------|------|
| **앱 이름** | 싸월급 |
| **한줄 설명** | 회사에서 똥싸면 돈 번다 — 직장인 화장실 출석 체크 + 시급 계산 미니앱 |
| **플랫폼** | 토스 앱인토스 (Toss WebView 미니앱) |
| **톤앤매너** | B급 유머, 직장인 밈, 이모지 적극 활용 |
| **슬로건** | "회사 화장실에서 월급을 번다" |
| **브랜드 컬러** | `#FF6B35` (메인 오렌지), `#3182F6` (토스 블루 CTA) |
| **목표 사용자** | 20~40대 직장인, 유머 앱에 관심 있는 토스 사용자 |
| **핵심 가치** | 재미(시급 계산) + 리텐션(똥코인/연속출석) + 수익화(보상형 광고) |

## 2. Architecture

### 2.1 System Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  📱 Client            │     │  ⚡ Vercel Serverless  │     │  🗄️ Supabase          │
│  (Toss WebView)      │────▶│  (API Routes)        │────▶│  (PostgreSQL)        │
│                      │     │                      │     │                      │
│  • Vite + React 19   │     │  • 토스 OAuth 토큰교환│     │  • users             │
│  • TypeScript        │     │  • mTLS 인증서 처리  │     │  • check_ins         │
│  • Tailwind CSS 4    │     │  • 프로모션 API 호출  │     │  • rewards           │
│  • shadcn-ui         │     │  • JWT 발급/검증      │     │  • Row Level Security│
│  • react-router-dom  │     │                      │     │  • Realtime 구독     │
│  • recharts          │     │                      │     │                      │
│  • framer-motion     │     │                      │     │                      │
│  • @apps-in-toss SDK │     │                      │     │                      │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### 2.2 Tech Stack

| 계층 | 기술 | 비고 |
|------|------|------|
| **Client** | Vite + React 19 + TypeScript | 기존 보일러플레이트 활용 |
| **UI** | Tailwind CSS 4 + shadcn-ui | CLAUDE.md: alert/confirm 대신 Dialog |
| **State** | React Query + zustand | 서버 상태 캐싱 + 로컬 UI 상태 |
| **Charts** | recharts | 통계 그래프 |
| **Animation** | framer-motion | 타이머 카운트업, 코인 획득 애니메이션 |
| **Routing** | react-router-dom | 7개 화면 라우팅 |
| **SDK** | @apps-in-toss/web-framework 2.0.1 | Dynamic import + isSupported 필수 |
| **Server** | Vercel Serverless Functions | API Routes, mTLS, OAuth |
| **DB** | Supabase PostgreSQL | RLS, Realtime |
| **Auth** | 토스 OAuth → 서버 JWT | OAuth 토큰 서버에서만 처리 |

## 3. Screen Flow

```
인트로 ──▶ 토스 로그인 ──▶ 홈 (허브)
                            │
                ┌───────────┼───────────┬───────────┐
                ▼           ▼           ▼           ▼
             📊 통계    🏆 랭킹     🎁 리워드    ⚙️ 설정

홈 ──▶ 타이머 (프로 모드, 홈에서 꾹 누르면 진입)

하단 탭바: 홈 | 통계 | 랭킹 | 리워드
설정: 네비게이션 바 액세서리 버튼(⚙️)으로 진입
```

### 3.1 Routes

| Route | 화면 | 설명 |
|-------|------|------|
| `/` | 인트로 | 랜딩 + "시작하기" CTA |
| `/home` | 홈 | 메인 대시보드 + 체크인 버튼 |
| `/timer` | 타이머 | 프로 모드 실시간 타이머 |
| `/stats` | 통계 | 캘린더 + 주간 그래프 |
| `/ranking` | 랭킹 | Top 3 포디움 + 리더보드 |
| `/reward` | 리워드 | 미션 보드 + 업적 |
| `/settings` | 설정 | 시급/닉네임/알림/계정 |

## 4. Screen Specifications

### 4.1 인트로 (Intro)

**선택: A) 심플 CTA**

| 요소 | 스펙 |
|------|------|
| 상단 | 💩💰 이모지 아이콘 |
| 앱명 | "싸월급" 대형 텍스트 |
| 슬로건 | "회사 화장실에서 월급을 번다" |
| 티저 | "지금까지 직장인들이 번 돈 ₩ XXX,XXX,XXX" (서버에서 집계) |
| CTA | "시작하기" 버튼 (토스 블루 #3182F6) |
| 하단 텍스트 | "토스 계정으로 3초만에 시작" |

**심사 대응:**
- 로그인 전 반드시 이 화면을 먼저 보여줌 (NEVER: 앱 시작 시 appLogin 호출)
- "시작하기" 클릭 후 appLogin() 호출
- 첫 화면 백버튼 = 앱 종료 (리프레시 아님)

### 4.2 홈 (Home Dashboard)

**선택: A) 카드 레이아웃**

| 요소 | 스펙 |
|------|------|
| 상단 | 연속 출석 뱃지 + "김직장인님, 오늘도 벌어볼까요?" |
| 수익 카드 | 그라데이션 배경, "오늘의 싸월급 ₩ X,XXX" + 횟수/시간/시급 |
| 체크인 버튼 | 토스 블루 카드형, 💩 이모지, "지금 싸러 가기" |
| 인터랙션 | 탭 = 원탭 체크인 / 꾹(long press) = 타이머 모드 진입 |
| 지표 3열 | 똥코인 잔액 / 연속 출석일 / 이번 달 총액 |
| 하단 탭바 | 홈(활성) · 통계 · 랭킹 · 리워드 |

### 4.3 타이머 (Timer - Pro Mode)

**선택: A) 실시간 금액 중심**

| 요소 | 스펙 |
|------|------|
| 상태 뱃지 | "🟢 근무 중 (돈 벌는 중)" 녹색 뱃지 |
| 타이머 | MM:SS 대형 디지털 표시, 매초 업데이트 |
| 실시간 금액 | "지금까지 번 돈 ₩ X,XXX" 그라데이션 카드, 실시간 카운트업 |
| 초당 금액 | "시급 XX,XXX원 기준 · 초당 X.X원" |
| 예상 코인 | "🪙 예상 획득: +XX 똥코인" |
| 종료 버튼 | 빨간색 "💰 수확 완료!" |
| 종료 후 | 결과 요약 바텀시트 → 홈으로 복귀 |

### 4.4 통계 (Stats)

**선택: A) 캘린더 + 그래프**

| 요소 | 스펙 |
|------|------|
| 월간 요약 3열 | 이번 달 총 수익 / 총 출석일 / 총 시간 |
| 캘린더 | 월간 달력, 출석일 오렌지 원형 마킹, 오늘 녹색 |
| 주간 그래프 | 바 차트 (recharts), 요일별 수익 |
| 날짜 탭 | 특정 날짜 탭 → 해당일 체크인 내역 상세 |

### 4.5 랭킹 (Ranking)

**선택: A) 클래식 리더보드**

| 요소 | 스펙 |
|------|------|
| 기간 탭 | 이번 주 / 이번 달 / 전체 |
| Top 3 포디움 | 👑 1위 (골드 테두리) / 🥈 2위 / 🥉 3위 — 닉네임 + 수익 + 횟수 |
| 내 순위 | 파란색 하이라이트 카드, "#XX 나 (닉네임)" |
| 리스트 | 4위 이하 스크롤 리스트 |
| 데이터 | 닉네임(익명), 총 수익, 체크인 횟수 |
| 정렬 기준 | 기간 내 총 수익 (earned_amount 합계) |

### 4.6 리워드 (Reward)

**선택: A) 미션 보드 스타일**

| 요소 | 스펙 |
|------|------|
| 보유 자산 | 똥코인 잔액 + 토스포인트 잔액 (2열) |
| 오늘의 미션 | 리스트형 미션 카드 |
| 미션 1 | 🎬 광고 보고 코인 받기 — +50🪙, 하루 3회 제한, 프로그레스 바 |
| 미션 2 | ✅ 오늘 출석 체크 — 완료/미완료 상태 |
| 미션 3 | 🔥 7일 연속 출석 — +200🪙, 현재 진행도 |
| 미션 4 | 📤 친구에게 공유하기 — +100🪙, getTossShareLink() 사용 |
| 업적 섹션 | 뱃지 그리드: 달성 = 컬러, 미달성 = 회색+잠금 |

**업적 목록:**

| 업적 | 조건 | 보상 |
|------|------|------|
| 💩 첫 출석 | 첫 체크인 | +100 🪙 |
| 🔥 3일 연속 | 연속 3일 | +200 🪙 |
| ⚡ 7일 연속 | 연속 7일 | +500 🪙 |
| 👑 30일 연속 | 연속 30일 | +2,000 🪙 |
| 💯 100회 달성 | 총 100회 체크인 | +2,000 🪙 |
| 🎬 광고왕 | 광고 50회 시청 | +1,000 🪙 |
| 📤 인싸 | 공유 10회 | +500 🪙 |
| 💰 백만장자 | 누적 수익 100만원 | +5,000 🪙 |

### 4.7 설정 (Settings)

| 섹션 | 항목 | 상세 |
|------|------|------|
| **프로필** | 아바타 + 닉네임 + 토스 연동 상태 | 탭하면 프로필 편집 |
| **수익 설정** | 시급 | 숫자 입력, 미입력 시 최저시급 9,860원 |
| | 원탭 기본 시간 | 기본 5분, 1~15분 조절 가능 |
| **알림** | 출근 리마인더 | 평일 오전 9시 알림, 토글 |
| | 연속 출석 위험 | 오후 5시 미출석 시 알림, 토글 |
| **계정** | 닉네임 변경 | 텍스트 입력 |
| | 데이터 초기화 | 확인 Dialog 후 초기화 |
| | 토스 연동 해제 | 확인 Dialog → 로그아웃 → 인트로 이동 |
| **앱 정보** | 버전 + 문의 | 하단 표시 |

## 5. Data Model

### 5.1 Database Schema (Supabase PostgreSQL)

```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toss_user_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL DEFAULT '익명직장인',
  hourly_wage INTEGER NOT NULL DEFAULT 9860,
  quick_duration_seconds INTEGER NOT NULL DEFAULT 300,
  poop_coins INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_check_in_date DATE,
  total_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 체크인 기록
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL,
  earned_amount INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'timer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 리워드 기록
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ad', 'streak', 'achievement', 'share')),
  coins_amount INTEGER NOT NULL DEFAULT 0,
  toss_points INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 업적 달성 기록
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

-- 인덱스
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, created_at);
CREATE INDEX idx_check_ins_ranking ON check_ins(created_at, earned_amount);
CREATE INDEX idx_rewards_user ON rewards(user_id, created_at);
```

### 5.2 Row Level Security

> **Note:** 토스 OAuth → Vercel 서버 JWT 방식이므로, Supabase Auth를 직접 사용하지 않는다.
> 모든 DB 접근은 Vercel API Routes에서 **Supabase service_role 키**로 수행하며,
> JWT에서 추출한 user_id를 WHERE 조건으로 필터링한다.
> RLS는 방어적 2중 잠금으로 활성화하되, service_role은 RLS를 bypass한다.

```sql
-- RLS 활성화 (방어적 — service_role은 bypass, anon 키 직접 접근 차단)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- anon 키로 직접 접근 시 모두 차단 (모든 접근은 서버 API 경유)
-- service_role 키는 RLS를 자동 bypass하므로 별도 정책 불필요
```

## 6. Business Logic

### 6.1 시급 계산 공식

```
earned_amount = floor((hourly_wage / 3600) × duration_seconds)
```

| 모드 | duration_seconds | 예시 (시급 25,000원) |
|------|-----------------|---------------------|
| 원탭 (quick) | 사용자 설정값 (기본 300초=5분) | ₩2,083 |
| 타이머 (timer) | 실제 측정 시간 | 8분 = ₩3,333 |

- 시급 미입력 시: 최저시급 9,860원 적용
- 원탭 기본 시간 조절: 설정에서 1~15분 변경 가능

### 6.2 똥코인 적립 규칙

| 조건 | 기본 코인 | 계산식 |
|------|----------|--------|
| 원탭 체크인 | +10 | 고정 |
| 타이머 체크인 | +10 + (분 × 2) | 8분 = 10 + 16 = 26코인 |
| 연속 출석 보너스 | 배수 적용 | 아래 참조 |

**연속 출석 배수:**

| 연속일 | 배수 |
|--------|------|
| 1~2일 | ×1.0 |
| 3~6일 | ×1.5 |
| 7~29일 | ×2.0 |
| 30일+ | ×3.0 |

**제한:** 하루 최대 3회 체크인

### 6.3 연속 출석 판정

- `last_check_in_date`가 어제(yesterday)면 streak 유지 → `streak_days + 1`
- `last_check_in_date`가 오늘이면 이미 출석 → streak 변동 없음
- `last_check_in_date`가 그 외(2일 이상 전)면 streak 초기화 → `streak_days = 1`
- 서버 시간 기준 (KST, Asia/Seoul)

### 6.4 리워드 시스템

| 리워드 | 보상 | 제한 |
|--------|------|------|
| 보상형 광고 시청 | +50 🪙 + 토스포인트 (프로모션 연동 시) | 하루 3회 |
| 친구 공유 | +100 🪙 | 하루 1회 |
| 업적 달성 | 업적별 상이 (100~5,000 🪙) | 1회성 |

### 6.5 광고 구현 (IntegratedAd v2)

```typescript
// 보상형 광고 플로우 (MUST: load → show 순서)
const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
if (loadFullScreenAd.isSupported() !== true) { /* mock */ return; }

// 1. 로드
const result = await loadFullScreenAd({ adGroupId: 'AD_GROUP_ID' });

// 2. 표시
const { showFullScreenAd } = await import('@apps-in-toss/web-framework');
const showResult = await showFullScreenAd({ adGroupId: 'AD_GROUP_ID' });

// 3. 보상 처리
if (showResult.userEarnedReward) {
  await grantReward({ type: 'ad', coins: 50 });
}
```

## 7. API Design

### 7.1 Vercel API Routes

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/login` | 토스 OAuth 토큰 교환 → JWT 발급 |
| POST | `/api/auth/unlink` | 연동 해제 콜백 처리 |
| GET | `/api/user/me` | 내 프로필 조회 |
| PATCH | `/api/user/me` | 프로필 수정 (시급, 닉네임 등) |
| POST | `/api/check-in` | 체크인 생성 (시급 계산 + 코인 적립) |
| GET | `/api/check-ins` | 내 체크인 히스토리 (기간 필터) |
| GET | `/api/stats/summary` | 월간/주간 통계 요약 |
| GET | `/api/ranking` | 랭킹 리더보드 (기간 필터) |
| POST | `/api/reward/ad` | 광고 시청 보상 처리 |
| POST | `/api/reward/share` | 공유 보상 처리 |
| GET | `/api/achievements` | 내 업적 목록 |
| POST | `/api/promotion/execute` | 토스포인트 프로모션 실행 |
| GET | `/api/stats/total-earned` | 전체 사용자 누적 금액 (인트로용) |

### 7.2 Auth Flow

```
Client                    Vercel API                Toss OAuth
  │                          │                          │
  │── appLogin() ───────────▶│                          │
  │                          │── 토큰 교환 (mTLS) ─────▶│
  │                          │◀── access_token ─────────│
  │                          │── 사용자 정보 조회 ──────▶│
  │                          │◀── user info ────────────│
  │                          │                          │
  │                          │── Supabase upsert user ──│
  │                          │── 앱 자체 JWT 생성 ──────│
  │◀── JWT (앱 자체 토큰) ───│                          │
  │                          │                          │
  │  ※ Toss OAuth 토큰은 서버에서만 사용               │
  │  ※ 클라이언트에는 앱 JWT만 전달                     │
```

## 8. Toss Review Compliance

### 8.1 NEVER Rules (위반 시 반려)

| 규칙 | 대응 |
|------|------|
| alert/confirm/prompt 사용 금지 | shadcn-ui AlertDialog 사용 |
| 자체 헤더/백버튼 금지 | granite.config.ts 네비게이션바만 사용 |
| 핀치줌 금지 | viewport user-scalable=no |
| 앱 시작 시 로그인 금지 | 인트로 화면 먼저 표시 |
| 외부 링크 금지 | 앱 내 완결 |
| 앱 설치 유도 금지 | 관련 문구/배너 없음 |
| OAuth 토큰 클라이언트 노출 금지 | 서버에서만 처리 |

### 8.2 ALWAYS Rules (필수 준수)

| 규칙 | 대응 |
|------|------|
| 네비게이션바 백/홈 버튼 | granite.config.ts 설정 |
| 브랜딩 통일 | "싸월급" 전체 일치 (config, title, og:title, 공유) |
| 한글 앱 이름 | "싸월급" (영문 X) |
| 600x600 정사각형 로고 | 💩💰 기반 로고 제작 |
| primaryColor 6자리 hex | `#FF6B35` |
| 연동 해제 콜백 | /api/auth/unlink → 로그아웃 → 인트로 |
| 기능 스킴 URL 유효 | 모든 route가 유효 페이지 반환 |
| SDK dynamic import | 모든 SDK API dynamic import + isSupported 체크 |

### 8.3 granite.config.ts

```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ssawolgeup',
  brand: {
    displayName: '싸월급',
    primaryColor: '#FF6B35',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    initialAccessoryButton: {
      id: 'settings',
      title: '설정',
      icon: { name: 'icon-setting-mono' },
    },
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  outdir: 'dist',
});
```

## 9. Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── TabBar.tsx              # 하단 탭바 (홈/통계/랭킹/리워드)
│   │   └── PageLayout.tsx          # 공통 페이지 레이아웃
│   ├── home/
│   │   ├── EarningsCard.tsx        # 오늘의 싸월급 카드
│   │   ├── CheckInButton.tsx       # 체크인 버튼 (탭/꾹)
│   │   └── QuickStats.tsx          # 코인/연속출석/월간 3열 지표
│   ├── timer/
│   │   ├── TimerDisplay.tsx        # MM:SS 타이머
│   │   ├── LiveEarnings.tsx        # 실시간 금액 카운트업
│   │   └── TimerResult.tsx         # 수확 완료 결과 바텀시트
│   ├── stats/
│   │   ├── MonthlySummary.tsx      # 월간 요약 3열
│   │   ├── AttendanceCalendar.tsx  # 출석 캘린더
│   │   └── WeeklyChart.tsx         # 주간 수익 바 차트
│   ├── ranking/
│   │   ├── TopThreePodium.tsx      # Top 3 포디움
│   │   ├── MyRankCard.tsx          # 내 순위 하이라이트
│   │   └── RankingList.tsx         # 4위 이하 리스트
│   ├── reward/
│   │   ├── AssetSummary.tsx        # 코인 + 포인트 잔액
│   │   ├── MissionBoard.tsx        # 오늘의 미션 리스트
│   │   ├── MissionCard.tsx         # 개별 미션 카드
│   │   └── AchievementGrid.tsx     # 업적 뱃지 그리드
│   └── settings/
│       ├── ProfileSection.tsx      # 프로필 카드
│       ├── WageSettings.tsx        # 시급/기본시간 설정
│       ├── NotificationSettings.tsx # 알림 토글
│       └── AccountSettings.tsx     # 닉네임/초기화/연동해제
├── hooks/
│   ├── useAuth.ts                  # 토스 로그인/로그아웃
│   ├── useCheckIn.ts              # 체크인 로직 (원탭/타이머)
│   ├── useTimer.ts                # 타이머 상태 관리
│   ├── useStats.ts                # 통계 데이터 fetch
│   ├── useRanking.ts              # 랭킹 데이터 fetch
│   ├── useReward.ts               # 리워드/광고 로직
│   ├── useAchievements.ts         # 업적 관리
│   └── useUser.ts                 # 사용자 프로필 관리
├── lib/
│   ├── api.ts                     # API 클라이언트 (JWT 포함)
│   ├── sdk.ts                     # 앱인토스 SDK 래퍼 (dynamic import)
│   ├── calculations.ts            # 시급 계산, 코인 계산 로직
│   └── constants.ts               # 상수 (최저시급, 코인 규칙 등)
├── pages/
│   ├── Intro.tsx
│   ├── Home.tsx
│   ├── Timer.tsx
│   ├── Stats.tsx
│   ├── Ranking.tsx
│   ├── Reward.tsx
│   └── Settings.tsx
└── App.tsx                        # 라우터 설정
```

## 10. Additional Features (Full Spec)

### 10.1 공유 바이럴

- `getTossShareLink()` → 토스 앱 내 공유 링크 생성
- 공유 메시지: "나 오늘 회사에서 ₩X,XXX 벌었다 💩💰 — 싸월급"
- 공유 시 +100 🪙 보상 (하루 1회)

### 10.2 푸시 알림

- 평일 오전 출근 리마인더: "출근했나요? 오늘도 싸월급 벌어볼까요? 💩"
- 연속 출석 위험: "🔥 3일 연속 출석 깨질 위기! 지금 체크인하세요"
- SDK `pushNotification` API 활용

### 10.3 토스포인트 프로모션

- 보상형 광고 시청 후 `executePromotion` API로 토스포인트 지급
- 프로모션 코드 사전 등록 필요 (앱인토스 콘솔)
- mTLS 인증서로 서버에서 호출

## 11. Error Handling

| 상황 | 처리 |
|------|------|
| 로그인 실패 | shadcn AlertDialog → "다시 시도" 버튼 |
| 네트워크 오류 | Toast → "네트워크 오류. 잠시 후 다시 시도해주세요" |
| 하루 체크인 3회 초과 | Toast → "오늘 체크인은 여기까지! 내일 또 만나요 💩" |
| 광고 로드 실패 | Toast → "광고를 불러올 수 없어요. 잠시 후 다시 시도해주세요" |
| 광고 시청 3회 초과 | 버튼 비활성화 + "오늘 광고 보상을 모두 받았어요" |
| 연동 해제 콜백 | 로그아웃 → 로컬 상태 클리어 → 인트로 이동 |
| 타이머 30분 초과 | 자동 종료 + AlertDialog "혹시 깜빡하셨나요?" |

## 12. Performance Considerations

- **React Query** 캐싱으로 불필요한 API 호출 방지
- **타이머** requestAnimationFrame 또는 setInterval(1000ms)로 초당 업데이트
- **금액 계산** 클라이언트에서 실시간 표시, 서버에서 최종 검증
- **랭킹** 서버 캐싱 (5분 TTL), Supabase Realtime은 본인 데이터만
- **이미지** 최소화 — 이모지 기반 UI로 에셋 부담 없음
- **번들** Vite tree-shaking + SDK dynamic import로 초기 로드 최적화
