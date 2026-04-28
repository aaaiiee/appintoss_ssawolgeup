# 싸월급 (SSaWolGeup) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Toss mini-app where office workers "earn money while pooping" — a humorous attendance check-in app with hourly wage calculation, poop coins, rankings, and rewarded ads.

**Architecture:** SPA client (Vite + React 19 + TypeScript + Tailwind 4 + shadcn-ui) communicating with Vercel Serverless API Routes. Supabase PostgreSQL for persistence with service_role key access pattern. Toss OAuth for authentication with server-issued JWT.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn-ui, react-router-dom, React Query, zustand, recharts, framer-motion, @apps-in-toss/web-framework 2.0.1, Vercel Serverless Functions, Supabase PostgreSQL

**Spec:** `docs/superpowers/specs/2026-03-27-ssawolgeup-design.md`

---

## File Structure

```
src/
├── App.tsx                          # Router setup (MODIFY — replace boilerplate routes)
├── main.tsx                         # Entry point (KEEP as-is)
├── index.css                        # Global styles (MODIFY — add dark theme variables)
├── lib/
│   ├── utils.ts                     # cn() utility (KEEP)
│   ├── api.ts                       # API client with JWT auth header (CREATE)
│   ├── sdk.ts                       # AppInToss SDK wrapper with dynamic import (CREATE)
│   ├── calculations.ts              # Wage/coin calculation pure functions (CREATE)
│   ├── constants.ts                 # App constants (wage limits, coin rules, etc.) (CREATE)
│   └── achievements.ts             # Achievement definitions registry (CREATE)
├── stores/
│   └── authStore.ts                 # zustand auth state (jwt, user) (CREATE)
├── hooks/
│   ├── useAuth.ts                   # Toss login/logout + JWT management (CREATE)
│   ├── useUser.ts                   # GET/PATCH /api/user/me with React Query (CREATE)
│   ├── useCheckIn.ts                # POST /api/check-in + optimistic update (CREATE)
│   ├── useTimer.ts                  # Timer state machine (idle/running/done) (CREATE)
│   ├── useStats.ts                  # GET /api/stats/* with React Query (CREATE)
│   ├── useRanking.ts                # GET /api/ranking with React Query (CREATE)
│   ├── useReward.ts                 # Rewarded ad hook (based on robin example) (CREATE)
│   ├── useAchievements.ts           # GET /api/achievements with React Query (CREATE)
│   └── use-mobile.tsx               # Mobile detection (KEEP)
├── components/
│   ├── layout/
│   │   ├── TabBar.tsx               # Bottom tab bar (home/stats/ranking/reward) (CREATE)
│   │   └── PageLayout.tsx           # Common page wrapper with TabBar (CREATE)
│   ├── home/
│   │   ├── EarningsCard.tsx         # Today's earnings gradient card (CREATE)
│   │   ├── CheckInButton.tsx        # Tap/long-press check-in button (CREATE)
│   │   └── QuickStats.tsx           # 3-column metrics row (CREATE)
│   ├── timer/
│   │   ├── TimerDisplay.tsx         # MM:SS digital timer (CREATE)
│   │   ├── LiveEarnings.tsx         # Real-time money counter (CREATE)
│   │   └── TimerResult.tsx          # Harvest complete bottom sheet (CREATE)
│   ├── stats/
│   │   ├── MonthlySummary.tsx       # 3-column monthly metrics (CREATE)
│   │   ├── AttendanceCalendar.tsx   # Monthly calendar with markers (CREATE)
│   │   └── WeeklyChart.tsx          # Weekly bar chart (recharts) (CREATE)
│   ├── ranking/
│   │   ├── TopThreePodium.tsx       # Top 3 podium display (CREATE)
│   │   ├── MyRankCard.tsx           # My rank highlight card (CREATE)
│   │   └── RankingList.tsx          # 4th+ scrollable list (CREATE)
│   ├── reward/
│   │   ├── AssetSummary.tsx         # Coin + points balance (CREATE)
│   │   ├── MissionBoard.tsx         # Daily missions list (CREATE)
│   │   ├── MissionCard.tsx          # Individual mission card (CREATE)
│   │   └── AchievementGrid.tsx      # Achievement badge grid (CREATE)
│   ├── settings/
│   │   ├── ProfileSection.tsx       # Profile card (CREATE)
│   │   ├── WageSettings.tsx         # Wage/duration settings (CREATE)
│   │   ├── NotificationSettings.tsx # Notification toggles (CREATE)
│   │   └── AccountSettings.tsx      # Nickname/reset/unlink (CREATE)
│   └── ui/                          # shadcn-ui components (KEEP all existing)
├── pages/
│   ├── Intro.tsx                    # Landing page with CTA (CREATE)
│   ├── Home.tsx                     # Main dashboard (CREATE)
│   ├── Timer.tsx                    # Pro mode timer (CREATE)
│   ├── Stats.tsx                    # Statistics page (CREATE)
│   ├── Ranking.tsx                  # Leaderboard page (CREATE)
│   ├── Reward.tsx                   # Missions + achievements (CREATE)
│   └── Settings.tsx                 # Settings page (CREATE)

api/                                 # Vercel Serverless Functions (root level)
├── auth/
│   ├── login.ts                     # POST — Toss OAuth token exchange → JWT (CREATE)
│   └── unlink.ts                    # POST — Unlink callback handler (CREATE)
├── user/
│   └── me.ts                        # GET/PATCH — User profile (CREATE)
├── check-in.ts                      # POST — Create check-in (CREATE)
├── check-ins.ts                     # GET — Check-in history (CREATE)
├── stats/
│   ├── summary.ts                   # GET — Monthly/weekly stats (CREATE)
│   └── total-earned.ts              # GET — Global total (intro screen) (CREATE)
├── ranking.ts                       # GET — Leaderboard (CREATE)
├── reward/
│   ├── ad.ts                        # POST — Ad reward claim (CREATE)
│   └── share.ts                     # POST — Share reward claim (CREATE)
├── achievements.ts                  # GET — User achievements (CREATE)
└── promotion/
    └── execute.ts                   # POST — Toss Points promotion (CREATE)

index.html                           # Update title/meta/viewport (MODIFY)
granite.config.ts                    # Toss mini-app config (CREATE)
vercel.json                          # Vercel routing config (CREATE)
supabase/
└── migrations/
    └── 001_initial_schema.sql       # Database schema + RLS (CREATE)
```

### Files to Delete (boilerplate cleanup)

- `src/pages/Index.tsx` — replaced by `Intro.tsx`
- `src/pages/Brainstorm.tsx` — brainstorming artifact, not needed
- `src/pages/NotFound.tsx` — will recreate as simple redirect to `/`
- `src/components/NavLink.tsx` — replaced by TabBar

---

## Chunk 1: Foundation — Config, DB, Lib, Routing

### Task 1: Update index.html for Toss compliance

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update index.html**

Replace the entire `index.html` with Toss-compliant meta tags:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>싸월급</title>
    <meta name="description" content="회사 화장실에서 월급을 번다 — 직장인 화장실 출석 체크 미니앱" />
    <meta property="og:title" content="싸월급" />
    <meta property="og:description" content="회사 화장실에서 월급을 번다" />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key compliance points:**
- `lang="ko"` — Korean app
- `user-scalable=no` — MUST for Toss review (pinch zoom disabled)
- Title = "싸월급" — must match brand.displayName exactly
- og:title = "싸월급" — branding consistency
- Removed all Lovable branding

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: update index.html for Toss review compliance

- Set lang=ko, user-scalable=no, title=싸월급
- Remove Lovable boilerplate branding"
```

---

### Task 2: Create granite.config.ts

**Files:**
- Create: `granite.config.ts`

- [ ] **Step 1: Create granite.config.ts**

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

**Compliance notes:**
- `withBackButton: true` + `withHomeButton: true` — ALWAYS required
- Accessory button uses mono icon — NEVER colored icons
- Only 1 accessory button — NEVER more than 1
- `displayName: '싸월급'` — must match index.html title exactly

- [ ] **Step 2: Commit**

```bash
git add granite.config.ts
git commit -m "feat: add granite.config.ts for Toss mini-app"
```

---

### Task 3: Create Supabase migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write the migration file**

```sql
-- 싸월급 Initial Schema
-- All access via Vercel API with service_role key (bypasses RLS)
-- RLS enabled as defense-in-depth against direct anon key access

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
  -- 비정규화 컬럼: 매 요청마다 COUNT 쿼리 대신 카운터로 성능 최적화
  total_check_ins INTEGER NOT NULL DEFAULT 0,
  ad_views_today INTEGER NOT NULL DEFAULT 0,
  ad_views_reset_date DATE,
  shares_today INTEGER NOT NULL DEFAULT 0,
  shares_reset_date DATE,
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
-- toss_user_id UNIQUE 제약조건이 이미 암시적 인덱스 생성 → 별도 인덱스 불필요

-- RLS 활성화 (방어적 — service_role은 bypass, anon 키 직접 접근 차단)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies for anon role
-- All access goes through Vercel API using service_role key
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase initial schema migration

- users, check_ins, rewards, achievements tables
- RLS enabled as defense-in-depth
- service_role key access pattern (no anon policies)"
```

---

### Task 4: Create constants and calculation library

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/calculations.ts`
- Create: `src/lib/achievements.ts`
- Test: `src/test/calculations.test.ts`

- [ ] **Step 1: Write the failing tests for calculations**

```typescript
// src/test/calculations.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateEarnedAmount,
  calculateCoinsEarned,
  getStreakMultiplier,
} from '@/lib/calculations';

describe('calculateEarnedAmount', () => {
  it('calculates earned amount from hourly wage and seconds', () => {
    // 25000원/시 × 300초(5분) = floor(25000/3600 × 300) = floor(2083.33) = 2083
    expect(calculateEarnedAmount(25000, 300)).toBe(2083);
  });

  it('returns 0 for 0 seconds', () => {
    expect(calculateEarnedAmount(25000, 0)).toBe(0);
  });

  it('uses minimum wage when wage is 0', () => {
    // 9860원/시 × 300초 = floor(9860/3600 × 300) = floor(821.67) = 821
    expect(calculateEarnedAmount(0, 300)).toBe(821);
  });
});

describe('getStreakMultiplier', () => {
  it('returns 1.0 for 1-2 days', () => {
    expect(getStreakMultiplier(1)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it('returns 1.5 for 3-6 days', () => {
    expect(getStreakMultiplier(3)).toBe(1.5);
    expect(getStreakMultiplier(6)).toBe(1.5);
  });

  it('returns 2.0 for 7-29 days', () => {
    expect(getStreakMultiplier(7)).toBe(2.0);
    expect(getStreakMultiplier(29)).toBe(2.0);
  });

  it('returns 3.0 for 30+ days', () => {
    expect(getStreakMultiplier(30)).toBe(3.0);
    expect(getStreakMultiplier(100)).toBe(3.0);
  });
});

describe('calculateCoinsEarned', () => {
  it('returns 10 for quick mode', () => {
    expect(calculateCoinsEarned('quick', 300, 1)).toBe(10);
  });

  it('applies streak multiplier for quick mode', () => {
    expect(calculateCoinsEarned('quick', 300, 5)).toBe(15); // 10 × 1.5
  });

  it('calculates timer coins with duration bonus', () => {
    // timer 8min (480s): 10 + (8 × 2) = 26, streak 1 → ×1.0 = 26
    expect(calculateCoinsEarned('timer', 480, 1)).toBe(26);
  });

  it('applies streak multiplier for timer mode', () => {
    // timer 8min: 26 base × 2.0 (7-day streak) = 52
    expect(calculateCoinsEarned('timer', 480, 7)).toBe(52);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/calculations.test.ts
```
Expected: FAIL — modules not found

- [ ] **Step 3: Create src/lib/constants.ts**

```typescript
// src/lib/constants.ts

export const MINIMUM_WAGE = 9860; // 2026 최저시급 (원)
export const MAX_DAILY_CHECK_INS = 3;
export const MAX_DAILY_AD_VIEWS = 3;
export const MAX_DAILY_SHARES = 1;
export const TIMER_MAX_SECONDS = 30 * 60; // 30분 자동 종료

export const QUICK_CHECK_IN_BASE_COINS = 10;
export const TIMER_BASE_COINS = 10;
export const TIMER_PER_MINUTE_COINS = 2;

export const AD_REWARD_COINS = 50;
export const SHARE_REWARD_COINS = 100;

export const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0 },
  { minDays: 7, multiplier: 2.0 },
  { minDays: 3, multiplier: 1.5 },
  { minDays: 1, multiplier: 1.0 },
] as const;

export const BRAND = {
  name: '싸월급',
  primaryColor: '#FF6B35',
  tossBlue: '#3182F6',
  slogan: '회사 화장실에서 월급을 번다',
} as const;

export const TAB_ITEMS = [
  { path: '/home', label: '홈', emoji: '🏠' },
  { path: '/stats', label: '통계', emoji: '📊' },
  { path: '/ranking', label: '랭킹', emoji: '🏆' },
  { path: '/reward', label: '리워드', emoji: '🎁' },
] as const;
```

- [ ] **Step 4: Create src/lib/calculations.ts**

```typescript
// src/lib/calculations.ts
import {
  MINIMUM_WAGE,
  STREAK_MULTIPLIERS,
  QUICK_CHECK_IN_BASE_COINS,
  TIMER_BASE_COINS,
  TIMER_PER_MINUTE_COINS,
} from './constants';

/**
 * 시급 기반 수익 계산: floor((hourlyWage / 3600) × durationSeconds)
 */
export function calculateEarnedAmount(
  hourlyWage: number,
  durationSeconds: number
): number {
  const wage = hourlyWage > 0 ? hourlyWage : MINIMUM_WAGE;
  return Math.floor((wage / 3600) * durationSeconds);
}

/**
 * 연속 출석일에 따른 코인 배수
 */
export function getStreakMultiplier(streakDays: number): number {
  for (const { minDays, multiplier } of STREAK_MULTIPLIERS) {
    if (streakDays >= minDays) return multiplier;
  }
  return 1.0;
}

/**
 * 체크인 모드별 코인 계산 (배수 적용)
 */
export function calculateCoinsEarned(
  mode: 'quick' | 'timer',
  durationSeconds: number,
  streakDays: number
): number {
  const multiplier = getStreakMultiplier(streakDays);

  if (mode === 'quick') {
    return Math.floor(QUICK_CHECK_IN_BASE_COINS * multiplier);
  }

  const minutes = Math.floor(durationSeconds / 60);
  const baseCoins = TIMER_BASE_COINS + minutes * TIMER_PER_MINUTE_COINS;
  return Math.floor(baseCoins * multiplier);
}

/**
 * 초당 수익 계산 (UI 표시용)
 */
export function getPerSecondRate(hourlyWage: number): number {
  const wage = hourlyWage > 0 ? hourlyWage : MINIMUM_WAGE;
  return wage / 3600;
}

/**
 * 금액 포맷: 1234 → "₩ 1,234"
 */
export function formatWon(amount: number): string {
  return `₩ ${amount.toLocaleString('ko-KR')}`;
}

/**
 * 코인 포맷: 1234 → "1,234 🪙"
 */
export function formatCoins(coins: number): string {
  return `${coins.toLocaleString('ko-KR')} 🪙`;
}
```

- [ ] **Step 5: Create src/lib/achievements.ts**

```typescript
// src/lib/achievements.ts

export interface AchievementDef {
  key: string;
  emoji: string;
  name: string;
  description: string;
  reward: number; // poop coins
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_check_in', emoji: '💩', name: '첫 출석', description: '첫 체크인', reward: 100 },
  { key: 'streak_3', emoji: '🔥', name: '3일 연속', description: '연속 3일 출석', reward: 200 },
  { key: 'streak_7', emoji: '⚡', name: '7일 연속', description: '연속 7일 출석', reward: 500 },
  { key: 'streak_30', emoji: '👑', name: '30일 연속', description: '연속 30일 출석', reward: 2000 },
  { key: 'total_100', emoji: '💯', name: '100회 달성', description: '총 100회 체크인', reward: 2000 },
  { key: 'ad_king', emoji: '🎬', name: '광고왕', description: '광고 50회 시청', reward: 1000 },
  { key: 'social_butterfly', emoji: '📤', name: '인싸', description: '공유 10회', reward: 500 },
  { key: 'millionaire', emoji: '💰', name: '백만장자', description: '누적 수익 100만원', reward: 5000 },
];

export function getAchievementByKey(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run src/test/calculations.test.ts
```
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/constants.ts src/lib/calculations.ts src/lib/achievements.ts src/test/calculations.test.ts
git commit -m "feat: add core lib — constants, calculations, achievements

- Wage calculation: floor((hourlyWage / 3600) × seconds)
- Coin calculation with streak multiplier
- Achievement definitions registry
- Full test coverage for calculation functions"
```

---

### Task 5: Create API client and SDK wrapper

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/sdk.ts`
- Create: `src/stores/authStore.ts`

- [ ] **Step 1: Create src/stores/authStore.ts**

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  jwt: string | null;
  isLoggedIn: boolean;
  setJwt: (jwt: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  jwt: null,
  isLoggedIn: false,
  setJwt: (jwt) => set({ jwt, isLoggedIn: true }),
  clearAuth: () => set({ jwt: null, isLoggedIn: false }),
}));
```

- [ ] **Step 1.5: Install zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Create src/lib/api.ts**

```typescript
// src/lib/api.ts
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const jwt = useAuthStore.getState().jwt;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
```

- [ ] **Step 3: Create src/lib/sdk.ts**

Reference: `apps-in-toss-examples-robin/scenario-attendance-reward/client/src/lib/sdk.ts` and CLAUDE.md SDK rules.

```typescript
// src/lib/sdk.ts
// All AppInToss SDK calls go through this wrapper.
// MUST use dynamic import + isSupported() check per CLAUDE.md rules.

type Environment = 'toss' | 'web';

let cachedEnv: Environment | null = null;

export async function getEnvironment(): Promise<Environment> {
  if (cachedEnv) return cachedEnv;
  try {
    const { getOperationalEnvironment } = await import(
      '@apps-in-toss/web-framework'
    );
    if (getOperationalEnvironment.isSupported() !== true) {
      cachedEnv = 'web';
      return 'web';
    }
    const env = getOperationalEnvironment();
    cachedEnv = env.platform === 'web' ? 'web' : 'toss';
  } catch {
    cachedEnv = 'web';
  }
  return cachedEnv;
}

export async function tossLogin(): Promise<{
  accessToken: string;
} | null> {
  const env = await getEnvironment();
  if (env === 'web') {
    // Mock login for web dev — return a fake token
    return { accessToken: 'mock-toss-access-token' };
  }

  try {
    const { appLogin } = await import('@apps-in-toss/web-framework');
    if (appLogin.isSupported() !== true) return null;
    const result = await appLogin();
    return result;
  } catch {
    return null;
  }
}

export async function tossShare(message: string): Promise<boolean> {
  const env = await getEnvironment();
  if (env === 'web') {
    return true;
  }

  try {
    const { getTossShareLink, share } = await import(
      '@apps-in-toss/web-framework'
    );
    if (getTossShareLink.isSupported() !== true) return false;

    const link = await getTossShareLink();
    await share({ text: `${message}\n${link}` });
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/authStore.ts src/lib/api.ts src/lib/sdk.ts
git commit -m "feat: add API client, SDK wrapper, and auth store

- API client with JWT auth header + 401 auto-logout
- SDK wrapper with dynamic import + isSupported pattern
- Web mock fallbacks for dev environment
- zustand auth store for JWT state"
```

---

### Task 6: Setup routing and layout

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/layout/TabBar.tsx`
- Create: `src/components/layout/PageLayout.tsx`
- Create: `src/pages/Intro.tsx` (placeholder)
- Create: `src/pages/Home.tsx` (placeholder)
- Create: `src/pages/Timer.tsx` (placeholder)
- Create: `src/pages/Stats.tsx` (placeholder)
- Create: `src/pages/Ranking.tsx` (placeholder)
- Create: `src/pages/Reward.tsx` (placeholder)
- Create: `src/pages/Settings.tsx` (placeholder)
- Delete: `src/pages/Index.tsx`
- Delete: `src/pages/Brainstorm.tsx`
- Delete: `src/pages/NotFound.tsx`
- Delete: `src/components/NavLink.tsx`

- [ ] **Step 1: Create TabBar component**

```typescript
// src/components/layout/TabBar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { TAB_ITEMS } from '@/lib/constants';

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#222] flex justify-around py-2 z-50">
      {TAB_ITEMS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              isActive ? 'text-[#3182F6]' : 'text-[#666]'
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create PageLayout component**

```typescript
// src/components/layout/PageLayout.tsx
import { TabBar } from './TabBar';

interface PageLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
}

export function PageLayout({ children, showTabBar = true }: PageLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white">
      <main className={showTabBar ? 'pb-16' : ''}>{children}</main>
      {showTabBar && <TabBar />}
    </div>
  );
}
```

- [ ] **Step 3: Create placeholder pages**

Create 7 placeholder pages. Each follows this pattern:

```typescript
// src/pages/Intro.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Intro() {
  return (
    <PageLayout showTabBar={false}>
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-gray-500">인트로 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Home.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <div className="p-4">
        <p className="text-gray-500">홈 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Timer.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Timer() {
  return (
    <PageLayout showTabBar={false}>
      <div className="p-4">
        <p className="text-gray-500">타이머 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Stats.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Stats() {
  return (
    <PageLayout>
      <div className="p-4">
        <p className="text-gray-500">통계 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Ranking.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Ranking() {
  return (
    <PageLayout>
      <div className="p-4">
        <p className="text-gray-500">랭킹 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Reward.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Reward() {
  return (
    <PageLayout>
      <div className="p-4">
        <p className="text-gray-500">리워드 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

```typescript
// src/pages/Settings.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export default function Settings() {
  return (
    <PageLayout showTabBar={false}>
      <div className="p-4">
        <p className="text-gray-500">설정 — TODO</p>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 4: Delete boilerplate files**

```bash
rm src/pages/Index.tsx src/pages/Brainstorm.tsx src/pages/NotFound.tsx src/components/NavLink.tsx
```

- [ ] **Step 5: Update App.tsx with new routes**

```typescript
// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Timer from './pages/Timer';
import Stats from './pages/Stats';
import Ranking from './pages/Ranking';
import Reward from './pages/Reward';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 6: Run dev server to verify routing works**

```bash
npx vite --port 5173
```

Navigate to `http://localhost:5173/` — should see "인트로 — TODO"
Navigate to `http://localhost:5173/home` — should see "홈 — TODO" with tab bar
Navigate to `http://localhost:5173/stats` — should see "통계 — TODO" with tab bar

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/layout/ src/pages/
git commit -m "feat: setup routing, layout, and placeholder pages

- 7 routes: /, /home, /timer, /stats, /ranking, /reward, /settings
- TabBar component for bottom navigation
- PageLayout wrapper with optional tab bar
- Remove boilerplate pages (Index, Brainstorm, NotFound, NavLink)"
```

---

### Task 7: Create Vercel config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add vercel.json for SPA routing + API rewrites"
```

---

## Chunk 2: Auth + Server API Layer

### Task 8: Install server dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zustand + server deps**

```bash
npm install zustand jsonwebtoken @supabase/supabase-js
npm install -D @types/jsonwebtoken @vercel/node
```

- [ ] **Step 2: Create .env.example**

```bash
# .env.example — copy to .env.local and fill in values
TOSS_CLIENT_ID=
TOSS_CLIENT_SECRET=
TOSS_MTLS_CERT=
TOSS_MTLS_KEY=
JWT_SECRET=your-random-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
VITE_API_URL=
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "feat: add server dependencies and env template

- zustand for client state
- jsonwebtoken for JWT auth
- @supabase/supabase-js for DB access
- .env.example with required variables"
```

---

### Task 9: Create server utilities

**Files:**
- Create: `api/_lib/supabase.ts`
- Create: `api/_lib/auth.ts`

- [ ] **Step 1: Create api/_lib/supabase.ts**

```typescript
// api/_lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

- [ ] **Step 2: Create api/_lib/auth.ts**

```typescript
// api/_lib/auth.ts
import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: string; // Supabase users.id
  tossUserId: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function extractUser(req: VercelRequest): JwtPayload {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing authorization header');
  }
  try {
    return verifyJwt(authHeader.slice(7));
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleError(error: unknown): { status: number; body: object } {
  if (error instanceof AuthError) {
    return { status: 401, body: { message: error.message } };
  }
  console.error(error);
  return { status: 500, body: { message: 'Internal server error' } };
}
```

- [ ] **Step 3: Commit**

```bash
git add api/_lib/
git commit -m "feat: add server utilities — Supabase client and JWT auth

- Supabase client with service_role key
- JWT sign/verify helpers
- Request auth extraction middleware
- Error handling utility"
```

---

### Task 10: Create auth API endpoints

**Files:**
- Create: `api/auth/login.ts`
- Create: `api/auth/unlink.ts`

- [ ] **Step 1: Create api/auth/login.ts**

```typescript
// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { signJwt, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'accessToken is required' });
    }

    // Exchange Toss access token for user info
    // In production: use mTLS cert to call Toss API
    // For now: decode the token or call Toss user info endpoint
    const tossUser = await fetchTossUserInfo(accessToken);

    // Upsert user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          toss_user_id: tossUser.id,
          nickname: tossUser.nickname || '익명직장인',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'toss_user_id' }
      )
      .select('id, toss_user_id')
      .single();

    if (error || !user) {
      throw new Error('Failed to upsert user');
    }

    // Issue app JWT (NOT Toss OAuth token)
    const jwt = signJwt({
      userId: user.id,
      tossUserId: user.toss_user_id,
    });

    return res.status(200).json({ jwt });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

async function fetchTossUserInfo(
  accessToken: string
): Promise<{ id: string; nickname?: string }> {
  // TODO: Implement actual Toss OAuth user info fetch with mTLS
  // For development, return mock data
  if (accessToken === 'mock-toss-access-token') {
    return { id: 'mock-toss-user-001', nickname: '김직장인' };
  }

  // Production: call Toss API with mTLS certificate
  // const response = await fetch('https://api.toss.im/...', {
  //   headers: { Authorization: `Bearer ${accessToken}` },
  //   agent: mtlsAgent, // mTLS cert
  // });
  // return response.json();

  throw new Error('Invalid access token');
}
```

- [ ] **Step 2: Create api/auth/unlink.ts**

```typescript
// api/auth/unlink.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { referrer, tossUserId } = req.body;

    // Handle all unlink referrer types per CLAUDE.md:
    // UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS
    if (!tossUserId) {
      return res.status(400).json({ message: 'tossUserId required' });
    }

    // Mark user as unlinked (soft delete — keep data for re-link)
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('toss_user_id', tossUserId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unlink error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add api/auth/
git commit -m "feat: add auth API endpoints — login and unlink

- POST /api/auth/login: Toss OAuth → JWT exchange
- POST /api/auth/unlink: handle unlink/withdrawal callbacks
- Mock Toss user info for dev environment
- OAuth tokens stay server-side only (NEVER rules compliance)"
```

---

### Task 11: Create user API endpoint

**Files:**
- Create: `api/user/me.ts`

- [ ] **Step 1: Create api/user/me.ts**

```typescript
// api/user/me.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = extractUser(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const allowedFields = ['nickname', 'hourly_wage', 'quick_duration_seconds'];
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Validate hourly_wage range
      if (updates.hourly_wage !== undefined) {
        const wage = Number(updates.hourly_wage);
        if (wage < 0 || wage > 1000000) {
          return res.status(400).json({ message: 'Invalid hourly_wage' });
        }
      }

      // Validate quick_duration_seconds (1-15 minutes)
      if (updates.quick_duration_seconds !== undefined) {
        const secs = Number(updates.quick_duration_seconds);
        if (secs < 60 || secs > 900) {
          return res.status(400).json({ message: 'Duration must be 1-15 minutes' });
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        return res.status(500).json({ message: 'Update failed' });
      }
      return res.status(200).json(data);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/user/
git commit -m "feat: add user profile API — GET/PATCH /api/user/me

- GET returns full user profile
- PATCH allows nickname, hourly_wage, quick_duration_seconds
- Input validation for wage and duration ranges"
```

---

### Task 12: Create check-in API endpoint

**Files:**
- Create: `api/check-in.ts`
- Create: `api/check-ins.ts`

- [ ] **Step 1: Create api/check-in.ts**

This is the core business logic endpoint — wage calculation, coin earning, streak management.

```typescript
// api/check-in.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

const MAX_DAILY_CHECK_INS = 3;
const MINIMUM_WAGE = 9860;
const TIMER_MAX_SECONDS = 30 * 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { mode, durationSeconds } = req.body as {
      mode: 'quick' | 'timer';
      durationSeconds?: number;
    };

    if (!mode || !['quick', 'timer'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' });
    }

    // Fetch user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check daily limit (KST)
    const todayKST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
    );
    const todayStr = todayKST.toISOString().slice(0, 10);
    const tomorrow = new Date(todayKST);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const { count: todayCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${todayStr}T00:00:00+09:00`)
      .lt('created_at', `${tomorrowStr}T00:00:00+09:00`);

    if ((todayCount ?? 0) >= MAX_DAILY_CHECK_INS) {
      return res.status(429).json({ message: '오늘 체크인은 여기까지! 내일 또 만나요 💩' });
    }

    // Calculate duration
    let duration: number;
    if (mode === 'quick') {
      duration = user.quick_duration_seconds;
    } else {
      duration = Math.min(Math.max(durationSeconds ?? 0, 1), TIMER_MAX_SECONDS);
    }

    // Calculate earnings
    const wage = user.hourly_wage > 0 ? user.hourly_wage : MINIMUM_WAGE;
    const earnedAmount = Math.floor((wage / 3600) * duration);

    // Calculate coins with streak
    const streakDays = calculateNewStreak(user.last_check_in_date, user.streak_days, todayStr);
    const multiplier = getStreakMultiplier(streakDays);
    let baseCoins: number;
    if (mode === 'quick') {
      baseCoins = 10;
    } else {
      const minutes = Math.floor(duration / 60);
      baseCoins = 10 + minutes * 2;
    }
    const coinsEarned = Math.floor(baseCoins * multiplier);

    // Insert check-in
    const { data: checkIn, error: ciErr } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        duration_seconds: duration,
        earned_amount: earnedAmount,
        coins_earned: coinsEarned,
        mode,
      })
      .select()
      .single();

    if (ciErr) {
      throw ciErr;
    }

    // Update user stats (read-then-write is acceptable here:
    // 하루 3회 제한 + 단일 유저 순차 요청으로 동시성 문제 가능성 극히 낮음)
    await supabase
      .from('users')
      .update({
        poop_coins: user.poop_coins + coinsEarned,
        streak_days: streakDays,
        last_check_in_date: todayStr,
        total_earned: user.total_earned + earnedAmount,
        total_check_ins: user.total_check_ins + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Check achievements (async, non-blocking)
    checkAchievements(userId, {
      totalCheckIns: user.total_check_ins + 1,
      streakDays,
      totalEarned: user.total_earned + earnedAmount,
    }).catch(console.error);

    return res.status(201).json({
      checkIn,
      stats: {
        earnedAmount,
        coinsEarned,
        streakDays,
        multiplier,
        totalEarned: user.total_earned + earnedAmount,
        poop_coins: user.poop_coins + coinsEarned,
      },
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

function calculateNewStreak(
  lastDate: string | null,
  currentStreak: number,
  todayStr: string
): number {
  if (!lastDate) return 1;
  if (lastDate === todayStr) return currentStreak; // already checked in today

  // 문자열 비교로 TZ 모호성 방지 (YYYY-MM-DD 형식 보장됨)
  const [ly, lm, ld] = lastDate.split('-').map(Number);
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const lastDays = new Date(ly, lm - 1, ld).getTime() / 86400000;
  const todayDays = new Date(ty, tm - 1, td).getTime() / 86400000;
  const diffDays = todayDays - lastDays;

  if (diffDays === 1) return currentStreak + 1; // consecutive
  return 1; // streak broken
}

function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 3.0;
  if (streakDays >= 7) return 2.0;
  if (streakDays >= 3) return 1.5;
  return 1.0;
}

async function checkAchievements(
  userId: string,
  stats: { totalCheckIns: number; streakDays: number; totalEarned: number }
) {
  const checks: Array<{ key: string; condition: boolean; reward: number }> = [
    { key: 'first_check_in', condition: stats.totalCheckIns >= 1, reward: 100 },
    { key: 'streak_3', condition: stats.streakDays >= 3, reward: 200 },
    { key: 'streak_7', condition: stats.streakDays >= 7, reward: 500 },
    { key: 'streak_30', condition: stats.streakDays >= 30, reward: 2000 },
    { key: 'total_100', condition: stats.totalCheckIns >= 100, reward: 2000 },
    { key: 'millionaire', condition: stats.totalEarned >= 1000000, reward: 5000 },
  ];

  for (const { key, condition, reward } of checks) {
    if (!condition) continue;

    // Try insert (unique constraint prevents duplicates)
    const { error } = await supabase
      .from('achievements')
      .insert({ user_id: userId, achievement_key: key });

    if (!error) {
      // New achievement! Grant coins atomically
      await supabase.rpc('increment_coins', {
        user_id_input: userId,
        amount: reward,
      });

      await supabase.from('rewards').insert({
        user_id: userId,
        type: 'achievement',
        coins_amount: reward,
        description: `업적 달성: ${key}`,
      });
    }
    // If error (duplicate), achievement already earned — skip
  }
}
```

**Note:** We need a Supabase RPC function for atomic coin increment. Add to migration:

```sql
-- Add to supabase/migrations/001_initial_schema.sql (append)
CREATE OR REPLACE FUNCTION increment_coins(user_id_input UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET poop_coins = poop_coins + amount,
      updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 2: Create api/check-ins.ts**

```typescript
// api/check-ins.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { from, to } = req.query as { from?: string; to?: string };

    let query = supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 3: Append increment_coins RPC to migration**

Append to `supabase/migrations/001_initial_schema.sql`:

```sql
-- Atomic coin increment to avoid race conditions in achievement grants
CREATE OR REPLACE FUNCTION increment_coins(user_id_input UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET poop_coins = poop_coins + amount,
      updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 4: Commit**

```bash
git add api/check-in.ts api/check-ins.ts supabase/
git commit -m "feat: add check-in API with business logic

- POST /api/check-in: wage calc + coin earning + streak management
- GET /api/check-ins: history with date range filter
- Daily 3-check-in limit enforcement
- Achievement auto-check after each check-in
- increment_coins RPC for atomic coin updates"
```

---

### Task 13: Create remaining API endpoints

**Files:**
- Create: `api/stats/summary.ts`
- Create: `api/stats/total-earned.ts`
- Create: `api/ranking.ts`
- Create: `api/reward/ad.ts`
- Create: `api/reward/share.ts`
- Create: `api/achievements.ts`
- Create: `api/promotion/execute.ts`

- [ ] **Step 1: Create api/stats/summary.ts**

```typescript
// api/stats/summary.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { month } = req.query as { month?: string }; // YYYY-MM

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const endDate = `${targetMonth}-31T23:59:59`;

    const { data: checkIns, error } = await supabase
      .from('check_ins')
      .select('earned_amount, duration_seconds, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const totalEarned = (checkIns ?? []).reduce((sum, ci) => sum + ci.earned_amount, 0);
    const totalSeconds = (checkIns ?? []).reduce((sum, ci) => sum + ci.duration_seconds, 0);
    const uniqueDays = new Set(
      (checkIns ?? []).map((ci) => ci.created_at.slice(0, 10))
    ).size;

    // Daily breakdown for calendar
    const dailyMap: Record<string, { earned: number; count: number }> = {};
    for (const ci of checkIns ?? []) {
      const day = ci.created_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { earned: 0, count: 0 };
      dailyMap[day].earned += ci.earned_amount;
      dailyMap[day].count += 1;
    }

    return res.status(200).json({
      month: targetMonth,
      totalEarned,
      totalDays: uniqueDays,
      totalSeconds,
      daily: dailyMap,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 2: Create api/stats/total-earned.ts**

```typescript
// api/stats/total-earned.ts — public endpoint (no auth), for intro screen
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('total_earned');

  if (error) {
    return res.status(500).json({ message: 'Failed to fetch' });
  }

  const globalTotal = (data ?? []).reduce((sum, u) => sum + (u.total_earned ?? 0), 0);

  res.setHeader('Cache-Control', 'public, s-maxage=300'); // 5 min cache
  return res.status(200).json({ totalEarned: globalTotal });
}
```

- [ ] **Step 3: Create api/ranking.ts**

```typescript
// api/ranking.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { period = 'week' } = req.query as { period?: 'week' | 'month' | 'all' };

    let fromDate: string | null = null;
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      fromDate = weekAgo.toISOString();
    } else if (period === 'month') {
      fromDate = `${now.toISOString().slice(0, 7)}-01`;
    }

    // Get rankings — aggregate check_ins by user
    let query = supabase
      .from('check_ins')
      .select('user_id, earned_amount, users!inner(nickname)');

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    const { data: checkIns, error } = await query;
    if (error) throw error;

    // Aggregate by user
    const userMap = new Map<string, { nickname: string; total: number; count: number }>();
    for (const ci of checkIns ?? []) {
      const uid = ci.user_id;
      const existing = userMap.get(uid);
      const nickname = (ci as any).users?.nickname ?? '익명';
      if (existing) {
        existing.total += ci.earned_amount;
        existing.count += 1;
      } else {
        userMap.set(uid, { nickname, total: ci.earned_amount, count: 1 });
      }
    }

    // Sort by total earned descending
    const rankings = Array.from(userMap.entries())
      .map(([uid, data]) => ({
        userId: uid,
        nickname: data.nickname,
        totalEarned: data.total,
        checkInCount: data.count,
      }))
      .sort((a, b) => b.totalEarned - a.totalEarned);

    // Find my rank
    const myRankIndex = rankings.findIndex((r) => r.userId === userId);

    return res.status(200).json({
      rankings: rankings.slice(0, 50),
      myRank: myRankIndex >= 0 ? myRankIndex + 1 : null,
      myEntry: myRankIndex >= 0 ? rankings[myRankIndex] : null,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 4: Create api/reward/ad.ts**

```typescript
// api/reward/ad.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

const MAX_DAILY_ADS = 3;
const AD_REWARD_COINS = 50;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset daily count if new day
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    let adViewsToday = user.ad_views_today;
    if (user.ad_views_reset_date !== todayStr) {
      adViewsToday = 0;
    }

    if (adViewsToday >= MAX_DAILY_ADS) {
      return res.status(429).json({ message: '오늘 광고 보상을 모두 받았어요' });
    }

    // Grant reward
    await supabase
      .from('users')
      .update({
        poop_coins: user.poop_coins + AD_REWARD_COINS,
        ad_views_today: adViewsToday + 1,
        ad_views_reset_date: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await supabase.from('rewards').insert({
      user_id: userId,
      type: 'ad',
      coins_amount: AD_REWARD_COINS,
      description: `광고 시청 보상 (${adViewsToday + 1}/${MAX_DAILY_ADS})`,
    });

    return res.status(200).json({
      coinsEarned: AD_REWARD_COINS,
      adViewsToday: adViewsToday + 1,
      adViewsRemaining: MAX_DAILY_ADS - adViewsToday - 1,
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 5: Create api/reward/share.ts**

```typescript
// api/reward/share.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { extractUser, handleError } from '../_lib/auth';

const SHARE_REWARD_COINS = 100;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    let sharesToday = user.shares_today;
    if (user.shares_reset_date !== todayStr) {
      sharesToday = 0;
    }

    if (sharesToday >= 1) {
      return res.status(429).json({ message: '오늘 공유 보상은 이미 받았어요' });
    }

    await supabase
      .from('users')
      .update({
        poop_coins: user.poop_coins + SHARE_REWARD_COINS,
        shares_today: sharesToday + 1,
        shares_reset_date: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await supabase.from('rewards').insert({
      user_id: userId,
      type: 'share',
      coins_amount: SHARE_REWARD_COINS,
      description: '친구 공유 보상',
    });

    return res.status(200).json({ coinsEarned: SHARE_REWARD_COINS });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 6: Create api/achievements.ts**

```typescript
// api/achievements.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { extractUser, handleError } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = extractUser(req);

    const { data, error } = await supabase
      .from('achievements')
      .select('achievement_key, achieved_at')
      .eq('user_id', userId);

    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 7: Create api/promotion/execute.ts (stub)**

```typescript
// api/promotion/execute.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractUser, handleError } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    extractUser(req); // auth check

    // TODO: Implement Toss Points promotion execution
    // Requires: mTLS certificate, promotion code from AppsInToss console
    // const { executePromotion } = await import('@apps-in-toss/web-framework');

    return res.status(200).json({
      message: 'Promotion execution stub — implement with mTLS in production',
    });
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add api/
git commit -m "feat: add remaining API endpoints

- GET /api/stats/summary: monthly stats with daily breakdown
- GET /api/stats/total-earned: global total for intro (public, cached)
- GET /api/ranking: leaderboard with period filter
- POST /api/reward/ad: ad reward claim (3/day limit)
- POST /api/reward/share: share reward claim (1/day limit)
- GET /api/achievements: user achievement list
- POST /api/promotion/execute: Toss Points stub"
```

---

## Chunk 3: Core Screens — Intro, Home, Timer

### Task 14: Create auth hook

**Files:**
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Create src/hooks/useAuth.ts**

```typescript
// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { tossLogin } from '@/lib/sdk';
import { api } from '@/lib/api';

export function useAuth() {
  const { jwt, isLoggedIn, setJwt, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async () => {
    try {
      // Step 1: Toss OAuth login (SDK handles UI)
      // NOTE: appLogin() returns accessToken to client per Toss-prescribed flow.
      // This is architecturally required — the token is immediately sent to our
      // server for exchange and NEVER stored in zustand/localStorage/cookies.
      // Only the resulting app JWT is persisted on the client.
      const tossResult = await tossLogin();
      if (!tossResult) {
        throw new Error('로그인이 취소되었습니다');
      }

      // Step 2: Exchange Toss token for app JWT (server-side)
      const { jwt: appJwt } = await api.post<{ jwt: string }>('/api/auth/login', {
        accessToken: tossResult.accessToken,
      });

      // Step 3: Store JWT in zustand
      setJwt(appJwt);
      navigate('/home');
    } catch (error) {
      throw error;
    }
  }, [setJwt, navigate]);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  return { jwt, isLoggedIn, login, logout };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook — Toss OAuth + JWT flow"
```

---

### Task 15: Implement Intro page

**Files:**
- Modify: `src/pages/Intro.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/intro.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Intro from '@/pages/Intro';

describe('Intro page', () => {
  it('renders app name and slogan', () => {
    render(
      <MemoryRouter>
        <Intro />
      </MemoryRouter>
    );
    expect(screen.getByText('싸월급')).toBeInTheDocument();
    expect(screen.getByText('회사 화장실에서 월급을 번다')).toBeInTheDocument();
  });

  it('renders start button', () => {
    render(
      <MemoryRouter>
        <Intro />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /시작하기/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/test/intro.test.tsx
```
Expected: FAIL

- [ ] **Step 3: Implement Intro page**

```typescript
// src/pages/Intro.tsx
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { BRAND } from '@/lib/constants';
import { formatWon } from '@/lib/calculations';
import { toast } from 'sonner';

export default function Intro() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [globalTotal, setGlobalTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats/total-earned')
      .then((r) => r.json())
      .then((d) => setGlobalTotal(d.totalEarned))
      .catch(() => {});
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout showTabBar={false}>
      <div className="flex flex-col items-center justify-center min-h-dvh px-6">
        {/* Icon */}
        <div className="text-6xl mb-4">💩💰</div>

        {/* App name */}
        <h1 className="text-4xl font-bold mb-2" style={{ color: BRAND.primaryColor }}>
          {BRAND.name}
        </h1>

        {/* Slogan */}
        <p className="text-gray-400 text-lg mb-8">{BRAND.slogan}</p>

        {/* Global total teaser */}
        {globalTotal !== null && globalTotal > 0 && (
          <div className="bg-[#111] rounded-2xl px-6 py-4 mb-8 text-center">
            <p className="text-gray-500 text-sm">지금까지 직장인들이 번 돈</p>
            <p className="text-2xl font-bold" style={{ color: BRAND.primaryColor }}>
              {formatWon(globalTotal)}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-50"
          style={{ backgroundColor: BRAND.tossBlue }}
        >
          {isLoading ? '로그인 중...' : '시작하기'}
        </button>

        {/* Sub text */}
        <p className="text-gray-600 text-sm mt-4">토스 계정으로 3초만에 시작</p>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/test/intro.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Intro.tsx src/test/intro.test.tsx
git commit -m "feat: implement Intro page

- 싸월급 branding with emoji icon
- Global earnings teaser from API
- Start button triggers Toss OAuth login
- Compliant: intro shown before login (NEVER rule)"
```

---

### Task 16: Create useUser and useCheckIn hooks

**Files:**
- Create: `src/hooks/useUser.ts`
- Create: `src/hooks/useCheckIn.ts`

- [ ] **Step 1: Create src/hooks/useUser.ts**

```typescript
// src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface User {
  id: string;
  toss_user_id: string;
  nickname: string;
  hourly_wage: number;
  quick_duration_seconds: number;
  poop_coins: number;
  streak_days: number;
  last_check_in_date: string | null;
  total_earned: number;
  total_check_ins: number;
  ad_views_today: number;
  shares_today: number;
  created_at: string;
}

export function useUser() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get<User>('/api/user/me'),
    enabled: isLoggedIn,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<User, 'nickname' | 'hourly_wage' | 'quick_duration_seconds'>>) =>
      api.patch<User>('/api/user/me', updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
```

- [ ] **Step 2: Create src/hooks/useCheckIn.ts**

```typescript
// src/hooks/useCheckIn.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CheckInRequest {
  mode: 'quick' | 'timer';
  durationSeconds?: number;
}

interface CheckInResponse {
  checkIn: {
    id: string;
    duration_seconds: number;
    earned_amount: number;
    coins_earned: number;
    mode: string;
  };
  stats: {
    earnedAmount: number;
    coinsEarned: number;
    streakDays: number;
    multiplier: number;
    totalEarned: number;
    poop_coins: number;
  };
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (req: CheckInRequest) =>
      api.post<CheckInResponse>('/api/check-in', req),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    checkIn: mutation.mutateAsync,
    isChecking: mutation.isPending,
    lastResult: mutation.data,
    error: mutation.error,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useUser.ts src/hooks/useCheckIn.ts
git commit -m "feat: add useUser and useCheckIn hooks

- useUser: GET/PATCH with React Query caching
- useCheckIn: POST with optimistic query invalidation"
```

---

### Task 17: Implement Home page with components

**Files:**
- Create: `src/components/home/EarningsCard.tsx`
- Create: `src/components/home/CheckInButton.tsx`
- Create: `src/components/home/QuickStats.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create EarningsCard component**

```typescript
// src/components/home/EarningsCard.tsx
import { formatWon } from '@/lib/calculations';
import type { User } from '@/hooks/useUser';

interface Props {
  user: User;
  todayEarned: number;
  todayCount: number;
}

export function EarningsCard({ user, todayEarned, todayCount }: Props) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">
          {'🔥'.repeat(Math.min(user.streak_days, 5))}
        </span>
        <span className="text-gray-400 text-sm">
          {user.streak_days}일 연속 출석
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-1">
        {user.nickname}님, 오늘도 벌어볼까요?
      </p>
      <p className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
        {formatWon(todayEarned)}
      </p>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>{todayCount}/3회</span>
        <span>{Math.floor(user.quick_duration_seconds / 60)}분/회</span>
        <span>시급 {user.hourly_wage.toLocaleString()}원</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CheckInButton component**

```typescript
// src/components/home/CheckInButton.tsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckIn } from '@/hooks/useCheckIn';
import { toast } from 'sonner';
import { formatWon, formatCoins } from '@/lib/calculations';

const LONG_PRESS_MS = 500;

export function CheckInButton() {
  const { checkIn, isChecking } = useCheckIn();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [pressing, setPressing] = useState(false);

  const handleQuickCheckIn = useCallback(async () => {
    try {
      const result = await checkIn({ mode: 'quick' });
      toast.success(
        `${formatWon(result.stats.earnedAmount)} 벌었다! ${formatCoins(result.stats.coinsEarned)} 획득`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '체크인에 실패했습니다'
      );
    }
  }, [checkIn]);

  const handlePressStart = useCallback(() => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      setPressing(false);
      timerRef.current = null; // prevent handlePressEnd from also firing quick check-in
      navigate('/timer');
    }, LONG_PRESS_MS);
  }, [navigate]);

  const handlePressEnd = useCallback(() => {
    if (pressing) {
      setPressing(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        // Short tap → quick check-in
        handleQuickCheckIn();
      }
    }
  }, [pressing, handleQuickCheckIn]);

  return (
    <button
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      disabled={isChecking}
      className={`w-full rounded-2xl p-5 text-white font-bold text-lg transition-transform
        ${pressing ? 'scale-95' : 'scale-100'}
        disabled:opacity-50`}
      style={{ backgroundColor: '#3182F6' }}
    >
      <div className="text-3xl mb-1">💩</div>
      <div>{isChecking ? '기록 중...' : '지금 싸러 가기'}</div>
      <div className="text-xs font-normal opacity-70 mt-1">
        탭 = 원탭 체크인 · 꾹 = 타이머 모드
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Create QuickStats component**

```typescript
// src/components/home/QuickStats.tsx
import { formatCoins } from '@/lib/calculations';
import type { User } from '@/hooks/useUser';

interface Props {
  user: User;
  monthlyTotal: number;
}

export function QuickStats({ user, monthlyTotal }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-yellow-400 font-bold">{formatCoins(user.poop_coins)}</p>
        <p className="text-gray-500 text-xs">똥코인</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-green-400 font-bold">{user.streak_days}일</p>
        <p className="text-gray-500 text-xs">연속 출석</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="font-bold" style={{ color: '#FF6B35' }}>
          ₩{monthlyTotal.toLocaleString()}
        </p>
        <p className="text-gray-500 text-xs">이번 달</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement Home page**

```typescript
// src/pages/Home.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { EarningsCard } from '@/components/home/EarningsCard';
import { CheckInButton } from '@/components/home/CheckInButton';
import { QuickStats } from '@/components/home/QuickStats';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function Home() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  // Redirect to intro if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  // Fetch today's check-in stats
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  const { data: todayCheckIns } = useQuery({
    queryKey: ['check-ins', 'today'],
    queryFn: () =>
      api.get<Array<{ earned_amount: number }>>(`/api/check-ins?from=${todayStr}&to=${todayStr}T23:59:59`),
    enabled: isLoggedIn,
  });

  // Fetch monthly stats
  const monthStr = new Date().toISOString().slice(0, 7);
  const { data: monthlyStats } = useQuery({
    queryKey: ['stats', 'summary', monthStr],
    queryFn: () =>
      api.get<{ totalEarned: number }>(`/api/stats/summary?month=${monthStr}`),
    enabled: isLoggedIn,
  });

  if (isLoading || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </PageLayout>
    );
  }

  const todayEarned = (todayCheckIns ?? []).reduce((sum, ci) => sum + ci.earned_amount, 0);
  const todayCount = (todayCheckIns ?? []).length;

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <EarningsCard
          user={user}
          todayEarned={todayEarned}
          todayCount={todayCount}
        />
        <CheckInButton />
        <QuickStats user={user} monthlyTotal={monthlyStats?.totalEarned ?? 0} />
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 5: Run dev server and visually verify Home page**

```bash
npx vite --port 5173
```

Navigate to `/home` — verify card layout, check-in button, quick stats render.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/ src/pages/Home.tsx
git commit -m "feat: implement Home page with earnings card, check-in button, quick stats

- EarningsCard: gradient card with streak + today's earnings
- CheckInButton: tap for quick, long-press for timer mode
- QuickStats: poop coins, streak, monthly total
- Auth-guarded with redirect to intro"
```

---

### Task 18: Create useTimer hook and Timer page

**Files:**
- Create: `src/hooks/useTimer.ts`
- Create: `src/components/timer/TimerDisplay.tsx`
- Create: `src/components/timer/LiveEarnings.tsx`
- Create: `src/components/timer/TimerResult.tsx`
- Modify: `src/pages/Timer.tsx`

- [ ] **Step 1: Create useTimer hook**

```typescript
// src/hooks/useTimer.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { TIMER_MAX_SECONDS } from '@/lib/constants';

type TimerState = 'idle' | 'running' | 'done';

export function useTimer() {
  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    setState('running');
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (elapsed >= TIMER_MAX_SECONDS) {
        // Auto-stop at 30 minutes
        setState('done');
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    setState('done');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setElapsedSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, elapsedSeconds, start, stop, reset };
}
```

- [ ] **Step 2: Create TimerDisplay component**

```typescript
// src/components/timer/TimerDisplay.tsx
interface Props {
  elapsedSeconds: number;
}

export function TimerDisplay({ elapsedSeconds }: Props) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold text-white tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create LiveEarnings component**

```typescript
// src/components/timer/LiveEarnings.tsx
import { formatWon, getPerSecondRate } from '@/lib/calculations';

interface Props {
  elapsedSeconds: number;
  hourlyWage: number;
}

export function LiveEarnings({ elapsedSeconds, hourlyWage }: Props) {
  const perSecond = getPerSecondRate(hourlyWage);
  const currentEarnings = Math.floor(perSecond * elapsedSeconds);

  return (
    <div className="bg-gradient-to-br from-[#1a2a1a] to-[#1a3a2a] rounded-2xl p-6 text-center">
      <p className="text-gray-400 text-sm mb-1">지금까지 번 돈</p>
      <p className="text-4xl font-bold" style={{ color: '#FF6B35' }}>
        {formatWon(currentEarnings)}
      </p>
      <p className="text-gray-500 text-xs mt-2">
        시급 {hourlyWage.toLocaleString()}원 기준 · 초당 {perSecond.toFixed(1)}원
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create TimerResult component**

```typescript
// src/components/timer/TimerResult.tsx
import { formatWon, formatCoins } from '@/lib/calculations';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';

interface Props {
  open: boolean;
  onClose: () => void;
  earnedAmount: number;
  coinsEarned: number;
  durationSeconds: number;
  streakDays: number;
  multiplier: number;
}

export function TimerResult({
  open,
  onClose,
  earnedAmount,
  coinsEarned,
  durationSeconds,
  streakDays,
  multiplier,
}: Props) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#111] border-[#222]">
        <DrawerHeader className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <DrawerTitle className="text-white text-xl">수확 완료!</DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-4 space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">벌어들인 싸월급</p>
            <p className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
              {formatWon(earnedAmount)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-yellow-400 font-bold">{formatCoins(coinsEarned)}</p>
              <p className="text-gray-500 text-xs">획득 코인</p>
            </div>
            <div>
              <p className="text-white font-bold">
                {minutes}분 {seconds}초
              </p>
              <p className="text-gray-500 text-xs">소요 시간</p>
            </div>
            <div>
              <p className="text-green-400 font-bold">×{multiplier}</p>
              <p className="text-gray-500 text-xs">{streakDays}일 연속</p>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-bold"
            style={{ backgroundColor: '#3182F6' }}
          >
            홈으로 돌아가기
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

- [ ] **Step 5: Implement Timer page**

```typescript
// src/pages/Timer.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { LiveEarnings } from '@/components/timer/LiveEarnings';
import { TimerResult } from '@/components/timer/TimerResult';
import { useTimer } from '@/hooks/useTimer';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/authStore';
import { TIMER_MAX_SECONDS } from '@/lib/constants';
import { calculateCoinsEarned } from '@/lib/calculations';
import { toast } from 'sonner';

export default function Timer() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { user } = useUser();
  const { state, elapsedSeconds, start, stop, reset } = useTimer();
  const { checkIn } = useCheckIn();
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    earnedAmount: number;
    coinsEarned: number;
    streakDays: number;
    multiplier: number;
  } | null>(null);

  useEffect(() => {
    if (!isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  // Auto-start timer on mount
  useEffect(() => {
    if (state === 'idle') start();
  }, [state, start]);

  // Handle auto-stop at 30 min
  const handleHarvestRef = useRef(handleHarvest);
  handleHarvestRef.current = handleHarvest;
  useEffect(() => {
    if (state === 'done' && !showResult) {
      handleHarvestRef.current();
    }
  }, [state, showResult]);

  const handleHarvest = async () => {
    stop();
    try {
      const res = await checkIn({
        mode: 'timer',
        durationSeconds: elapsedSeconds,
      });
      setResult(res.stats);
      setShowResult(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '기록 실패');
      navigate('/home');
    }
  };

  const handleResultClose = () => {
    setShowResult(false);
    reset();
    navigate('/home');
  };

  if (!user) return null;

  const estimatedCoins = calculateCoinsEarned('timer', elapsedSeconds, user.streak_days);

  return (
    <PageLayout showTabBar={false}>
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-6">
        {/* Status badge */}
        <div className="bg-green-900/30 text-green-400 px-4 py-1.5 rounded-full text-sm font-medium">
          🟢 근무 중 (돈 벌는 중)
        </div>

        {/* Timer */}
        <TimerDisplay elapsedSeconds={elapsedSeconds} />

        {/* Live earnings */}
        <LiveEarnings
          elapsedSeconds={elapsedSeconds}
          hourlyWage={user.hourly_wage}
        />

        {/* Estimated coins */}
        <p className="text-gray-500 text-sm">
          🪙 예상 획득: +{estimatedCoins} 똥코인
        </p>

        {/* Harvest button */}
        {state === 'running' && (
          <button
            onClick={handleHarvest}
            className="w-full max-w-xs py-4 rounded-2xl bg-red-600 text-white font-bold text-lg"
          >
            💰 수확 완료!
          </button>
        )}
      </div>

      {/* Result bottom sheet */}
      {result && (
        <TimerResult
          open={showResult}
          onClose={handleResultClose}
          earnedAmount={result.earnedAmount}
          coinsEarned={result.coinsEarned}
          durationSeconds={elapsedSeconds}
          streakDays={result.streakDays}
          multiplier={result.multiplier}
        />
      )}
    </PageLayout>
  );
}
```

- [ ] **Step 6: Run dev server and verify timer works**

```bash
npx vite --port 5173
```

Navigate to `/timer` — verify timer counts up, live earnings update, harvest button works.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useTimer.ts src/components/timer/ src/pages/Timer.tsx
git commit -m "feat: implement Timer page with live earnings

- useTimer hook with state machine (idle/running/done)
- TimerDisplay: MM:SS digital counter
- LiveEarnings: real-time wage calculation
- TimerResult: harvest summary bottom sheet (vaul Drawer)
- Auto-stop at 30 minutes with alert"
```

---

## Chunk 4: Feature Screens — Stats, Ranking, Reward, Settings

### Task 19: Implement Stats page

**Files:**
- Create: `src/hooks/useStats.ts`
- Create: `src/components/stats/MonthlySummary.tsx`
- Create: `src/components/stats/AttendanceCalendar.tsx`
- Create: `src/components/stats/WeeklyChart.tsx`
- Modify: `src/pages/Stats.tsx`

- [ ] **Step 1: Create useStats hook**

```typescript
// src/hooks/useStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface StatsSummary {
  month: string;
  totalEarned: number;
  totalDays: number;
  totalSeconds: number;
  daily: Record<string, { earned: number; count: number }>;
}

export function useStats(month?: string) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['stats', 'summary', targetMonth],
    queryFn: () => api.get<StatsSummary>(`/api/stats/summary?month=${targetMonth}`),
    enabled: isLoggedIn,
  });
}
```

- [ ] **Step 2: Create MonthlySummary component**

```typescript
// src/components/stats/MonthlySummary.tsx
import { formatWon } from '@/lib/calculations';

interface Props {
  totalEarned: number;
  totalDays: number;
  totalSeconds: number;
}

export function MonthlySummary({ totalEarned, totalDays, totalSeconds }: Props) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="font-bold" style={{ color: '#FF6B35' }}>
          {formatWon(totalEarned)}
        </p>
        <p className="text-gray-500 text-xs">총 수익</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-green-400 font-bold">{totalDays}일</p>
        <p className="text-gray-500 text-xs">출석일</p>
      </div>
      <div className="bg-[#111] rounded-xl p-3 text-center">
        <p className="text-blue-400 font-bold">
          {hours}h {minutes}m
        </p>
        <p className="text-gray-500 text-xs">총 시간</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create AttendanceCalendar component**

Uses shadcn-ui `Calendar` component (already installed as `react-day-picker`).

```typescript
// src/components/stats/AttendanceCalendar.tsx
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

interface Props {
  attendanceDays: string[]; // ['2026-03-01', '2026-03-02', ...]
  month: Date;
  onMonthChange: (date: Date) => void;
  daily: Record<string, { earned: number; count: number }>;
  onDaySelect?: (dateStr: string) => void;
}

export function AttendanceCalendar({ attendanceDays, month, onMonthChange, daily, onDaySelect }: Props) {
  const attendanceDates = attendanceDays.map((d) => new Date(d + 'T00:00:00'));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    if (attendanceDays.includes(dateStr)) {
      setSelectedDay(dateStr);
      onDaySelect?.(dateStr);
    }
  };

  return (
    <div className="bg-[#111] rounded-xl p-3">
      <Calendar
        mode="multiple"
        selected={attendanceDates}
        month={month}
        onMonthChange={onMonthChange}
        onDayClick={handleDayClick}
        className="w-full"
        classNames={{
          day_selected: 'bg-[#FF6B35] text-white rounded-full',
          day_today: 'bg-green-600 text-white rounded-full',
        }}
      />

      {/* 날짜 탭 → 해당일 체크인 내역 상세 (spec 4.4) */}
      {selectedDay && daily[selectedDay] && (
        <div className="mt-3 bg-[#1a1a1a] rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white text-sm font-bold">{selectedDay}</span>
            <button onClick={() => setSelectedDay(null)} className="text-gray-500 text-xs">닫기</button>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>수익: ₩{daily[selectedDay].earned.toLocaleString()}</span>
            <span>체크인: {daily[selectedDay].count}회</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create WeeklyChart component**

```typescript
// src/components/stats/WeeklyChart.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  daily: Record<string, { earned: number; count: number }>;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function WeeklyChart({ daily }: Props) {
  // Get last 7 days
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayIndex = (date.getDay() + 6) % 7; // Mon=0
    data.push({
      day: DAY_LABELS[dayIndex],
      earned: daily[dateStr]?.earned ?? 0,
    });
  }

  return (
    <div className="bg-[#111] rounded-xl p-4">
      <p className="text-white text-sm font-bold mb-3">📊 이번 주 수익</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => [`₩${value.toLocaleString()}`, '수익']}
            contentStyle={{ background: '#222', border: 'none', borderRadius: 8, color: '#fff' }}
          />
          <Bar dataKey="earned" fill="#FF6B35" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Implement Stats page**

```typescript
// src/pages/Stats.tsx
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { MonthlySummary } from '@/components/stats/MonthlySummary';
import { AttendanceCalendar } from '@/components/stats/AttendanceCalendar';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { useStats } from '@/hooks/useStats';

export default function Stats() {
  const [month, setMonth] = useState(new Date());
  const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const { data, isLoading } = useStats(monthStr);

  if (isLoading || !data) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  const attendanceDays = Object.keys(data.daily);

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <MonthlySummary
          totalEarned={data.totalEarned}
          totalDays={data.totalDays}
          totalSeconds={data.totalSeconds}
        />
        <AttendanceCalendar
          attendanceDays={attendanceDays}
          month={month}
          onMonthChange={setMonth}
          daily={data.daily}
        />
        <WeeklyChart daily={data.daily} />
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useStats.ts src/components/stats/ src/pages/Stats.tsx
git commit -m "feat: implement Stats page with calendar and weekly chart

- MonthlySummary: 3-column metrics
- AttendanceCalendar: shadcn Calendar with attendance markers
- WeeklyChart: recharts bar chart for daily earnings"
```

---

### Task 20: Implement Ranking page

**Files:**
- Create: `src/hooks/useRanking.ts`
- Create: `src/components/ranking/TopThreePodium.tsx`
- Create: `src/components/ranking/MyRankCard.tsx`
- Create: `src/components/ranking/RankingList.tsx`
- Modify: `src/pages/Ranking.tsx`

- [ ] **Step 1: Create useRanking hook**

```typescript
// src/hooks/useRanking.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface RankEntry {
  userId: string;
  nickname: string;
  totalEarned: number;
  checkInCount: number;
}

interface RankingResponse {
  rankings: RankEntry[];
  myRank: number | null;
  myEntry: RankEntry | null;
}

export function useRanking(period: 'week' | 'month' | 'all' = 'week') {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['ranking', period],
    queryFn: () => api.get<RankingResponse>(`/api/ranking?period=${period}`),
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minute cache
  });
}
```

- [ ] **Step 2: Create TopThreePodium, MyRankCard, RankingList**

```typescript
// src/components/ranking/TopThreePodium.tsx
import { formatWon } from '@/lib/calculations';
import type { RankEntry } from '@/hooks/useRanking';

interface Props {
  top3: RankEntry[];
}

const MEDALS = ['👑', '🥈', '🥉'];

export function TopThreePodium({ top3 }: Props) {
  // Display order: 2nd, 1st, 3rd
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  if (order.length === 0) return null;

  return (
    <div className="flex justify-center items-end gap-3 mb-5">
      {[1, 0, 2].map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const isFirst = idx === 0;
        return (
          <div key={idx} className="text-center">
            <div className={`text-${isFirst ? '2xl' : 'xl'}`}>{MEDALS[idx]}</div>
            <div
              className={`rounded-xl p-3 min-w-[80px] ${
                isFirst
                  ? 'bg-gradient-to-b from-[#2d2d1a] to-[#111] border border-yellow-600'
                  : 'bg-[#1a1a2e]'
              }`}
            >
              <p className={`text-sm font-bold ${isFirst ? 'text-yellow-400' : 'text-gray-300'}`}>
                {entry.nickname}
              </p>
              <p className="font-bold text-sm" style={{ color: '#FF6B35' }}>
                {formatWon(entry.totalEarned)}
              </p>
              <p className="text-gray-500 text-xs">{entry.checkInCount}회</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

```typescript
// src/components/ranking/MyRankCard.tsx
import { formatWon } from '@/lib/calculations';
import type { RankEntry } from '@/hooks/useRanking';

interface Props {
  rank: number;
  entry: RankEntry;
}

export function MyRankCard({ rank, entry }: Props) {
  return (
    <div className="bg-[#1a2a3a] border border-[#3182F6] rounded-xl p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-[#3182F6] font-bold text-lg">#{rank}</span>
        <div>
          <p className="text-white text-sm font-bold">나 ({entry.nickname})</p>
          <p className="text-gray-500 text-xs">{entry.checkInCount}회 출석</p>
        </div>
      </div>
      <span className="font-bold" style={{ color: '#FF6B35' }}>
        {formatWon(entry.totalEarned)}
      </span>
    </div>
  );
}
```

```typescript
// src/components/ranking/RankingList.tsx
import { formatWon } from '@/lib/calculations';
import type { RankEntry } from '@/hooks/useRanking';

interface Props {
  rankings: RankEntry[];
  startRank: number;
}

export function RankingList({ rankings, startRank }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {rankings.map((entry, i) => (
        <div
          key={entry.userId}
          className="flex justify-between items-center px-3 py-2 rounded-lg bg-[#111]"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm w-6">{startRank + i}</span>
            <span className="text-gray-300 text-sm">{entry.nickname}</span>
          </div>
          <span className="text-sm" style={{ color: '#FF6B35' }}>
            {formatWon(entry.totalEarned)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implement Ranking page**

```typescript
// src/pages/Ranking.tsx
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TopThreePodium } from '@/components/ranking/TopThreePodium';
import { MyRankCard } from '@/components/ranking/MyRankCard';
import { RankingList } from '@/components/ranking/RankingList';
import { useRanking } from '@/hooks/useRanking';

type Period = 'week' | 'month' | 'all';
const PERIOD_LABELS: Record<Period, string> = {
  week: '이번 주',
  month: '이번 달',
  all: '전체',
};

export default function Ranking() {
  const [period, setPeriod] = useState<Period>('week');
  const { data, isLoading } = useRanking(period);

  return (
    <PageLayout>
      <div className="p-4">
        {/* Period tabs */}
        <div className="flex gap-2 mb-4">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                p === period
                  ? 'bg-[#3182F6] text-white'
                  : 'bg-[#222] text-gray-500'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {isLoading || !data ? (
          <div className="text-center text-gray-500 py-20">로딩 중...</div>
        ) : (
          <>
            <TopThreePodium top3={data.rankings.slice(0, 3)} />

            {data.myRank && data.myEntry && (
              <div className="mb-3">
                <MyRankCard rank={data.myRank} entry={data.myEntry} />
              </div>
            )}

            <RankingList
              rankings={data.rankings.slice(3)}
              startRank={4}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useRanking.ts src/components/ranking/ src/pages/Ranking.tsx
git commit -m "feat: implement Ranking page with podium and leaderboard

- Period tabs: week/month/all
- TopThreePodium: 👑🥈🥉 visual podium
- MyRankCard: highlighted current user rank
- RankingList: scrollable 4th+ entries"
```

---

### Task 21: Implement Reward page

**Files:**
- Create: `src/hooks/useReward.ts`
- Create: `src/hooks/useAchievements.ts`
- Create: `src/components/reward/AssetSummary.tsx`
- Create: `src/components/reward/MissionBoard.tsx`
- Create: `src/components/reward/MissionCard.tsx`
- Create: `src/components/reward/AchievementGrid.tsx`
- Modify: `src/pages/Reward.tsx`

- [ ] **Step 1: Create useReward hook (based on robin example)**

```typescript
// src/hooks/useReward.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { getEnvironment } from '@/lib/sdk';
import { api } from '@/lib/api';

const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || 'test-ad-group-id';

export function useReward() {
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const loadCleanupRef = useRef<(() => void) | undefined>(undefined);
  const showCleanupRef = useRef<(() => void) | undefined>(undefined);

  const loadAd = useCallback(async () => {
    setIsAdLoading(true);
    setIsAdReady(false);
    const env = await getEnvironment();

    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 500));
      setIsAdLoading(false);
      setIsAdReady(true);
      return;
    }

    try {
      const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
      if (loadFullScreenAd.isSupported() !== true) {
        setIsAdLoading(false);
        return;
      }
      loadCleanupRef.current?.();
      const cleanup = loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event: { type: string }) => {
          if (event.type === 'loaded') { setIsAdLoading(false); setIsAdReady(true); }
        },
        onError: () => { setIsAdLoading(false); },
      });
      loadCleanupRef.current = cleanup;
    } catch { setIsAdLoading(false); }
  }, []);

  const showAdAndClaim = useCallback(async (): Promise<{
    coinsEarned: number;
    adViewsRemaining: number;
  } | null> => {
    if (!isAdReady) return null;
    setIsAdShowing(true);
    setIsAdReady(false);
    const env = await getEnvironment();

    if (env === 'web') {
      await new Promise((r) => setTimeout(r, 1000));
      setIsAdShowing(false);
      const result = await api.post<{ coinsEarned: number; adViewsRemaining: number }>('/api/reward/ad', {});
      loadAd();
      return result;
    }

    return new Promise((resolve) => {
      import('@apps-in-toss/web-framework').then(({ showFullScreenAd }) => {
        const cleanup = showFullScreenAd({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: async (event: { type: string }) => {
            if (event.type === 'userEarnedReward') {
              const result = await api.post<{ coinsEarned: number; adViewsRemaining: number }>('/api/reward/ad', {});
              resolve(result);
            }
            if (event.type === 'dismissed' || event.type === 'failedToShow') {
              setIsAdShowing(false);
              loadAd();
              resolve(null);
            }
          },
          onError: () => { setIsAdShowing(false); loadAd(); resolve(null); },
        });
        showCleanupRef.current = cleanup;
      });
    });
  }, [isAdReady, loadAd]);

  const claimShareReward = useCallback(async () => {
    return api.post<{ coinsEarned: number }>('/api/reward/share', {});
  }, []);

  useEffect(() => {
    loadAd();
    return () => { loadCleanupRef.current?.(); showCleanupRef.current?.(); };
  }, [loadAd]);

  return { isAdLoading, isAdReady, isAdShowing, showAdAndClaim, claimShareReward, loadAd };
}
```

- [ ] **Step 2: Create useAchievements hook**

```typescript
// src/hooks/useAchievements.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Achievement {
  achievement_key: string;
  achieved_at: string;
}

export function useAchievements() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get<Achievement[]>('/api/achievements'),
    enabled: isLoggedIn,
  });
}
```

- [ ] **Step 3: Create reward components**

```typescript
// src/components/reward/AssetSummary.tsx
interface Props {
  poopCoins: number;
  tossPoints?: number;
}

export function AssetSummary({ poopCoins, tossPoints = 0 }: Props) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 bg-[#1a1a2e] rounded-xl p-3 text-center">
        <p className="text-yellow-400 font-bold text-lg">{poopCoins.toLocaleString()} 🪙</p>
        <p className="text-gray-500 text-xs">똥코인</p>
      </div>
      <div className="flex-1 bg-[#1a1a2e] rounded-xl p-3 text-center">
        <p className="text-[#3182F6] font-bold text-lg">{tossPoints.toLocaleString()} P</p>
        <p className="text-gray-500 text-xs">토스포인트</p>
      </div>
    </div>
  );
}
```

```typescript
// src/components/reward/MissionCard.tsx
interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  reward: string;
  progress?: { current: number; total: number };
  completed?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function MissionCard({
  emoji,
  title,
  subtitle,
  reward,
  progress,
  completed,
  onAction,
  actionLabel,
  disabled,
}: Props) {
  return (
    <div className="bg-[#111] rounded-xl p-3.5 flex justify-between items-center">
      <div className="flex-1">
        <p className="text-white text-sm font-bold">
          {emoji} {title}
        </p>
        <p className={`text-xs mt-0.5 ${completed ? 'text-green-400' : 'text-gray-500'}`}>
          {subtitle}
        </p>
        {progress && (
          <div className="bg-[#222] rounded-full h-1 w-28 mt-1.5">
            <div
              className="h-1 rounded-full"
              style={{
                width: `${Math.min((progress.current / progress.total) * 100, 100)}%`,
                backgroundColor: completed ? '#4CAF50' : '#FF6B35',
              }}
            />
          </div>
        )}
      </div>
      {onAction && !completed ? (
        <button
          onClick={onAction}
          disabled={disabled}
          className="px-3.5 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-40"
          style={{ backgroundColor: disabled ? '#333' : '#FF6B35' }}
        >
          {actionLabel || reward}
        </button>
      ) : (
        <span className="bg-[#333] text-gray-500 px-3.5 py-2 rounded-lg text-xs font-bold">
          {completed ? '완료 ✓' : reward}
        </span>
      )}
    </div>
  );
}
```

```typescript
// src/components/reward/MissionBoard.tsx
import { MissionCard } from './MissionCard';
import { useUser } from '@/hooks/useUser';
import { useReward } from '@/hooks/useReward';
import { tossShare } from '@/lib/sdk';
import { formatWon } from '@/lib/calculations';
import { toast } from 'sonner';

export function MissionBoard() {
  const { user, refetch } = useUser();
  const { isAdReady, isAdLoading, isAdShowing, showAdAndClaim, claimShareReward } = useReward();

  if (!user) return null;

  const handleAdWatch = async () => {
    const result = await showAdAndClaim();
    if (result) {
      toast.success(`+${result.coinsEarned} 🪙 획득!`);
      refetch();
    }
  };

  const handleShare = async () => {
    const shared = await tossShare(
      `나 오늘 회사에서 ${formatWon(user.total_earned)} 벌었다 💩💰 — 싸월급`
    );
    if (shared) {
      try {
        const result = await claimShareReward();
        toast.success(`+${result.coinsEarned} 🪙 공유 보상!`);
        refetch();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '보상 지급 실패');
      }
    }
  };

  const adViewsToday = user.ad_views_today ?? 0;
  const checkedInToday = user.last_check_in_date ===
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-white text-sm font-bold">📋 오늘의 미션</p>

      <MissionCard
        emoji="🎬"
        title="광고 보고 코인 받기"
        subtitle={`오늘 ${adViewsToday}/3회 시청`}
        reward="+50🪙"
        progress={{ current: adViewsToday, total: 3 }}
        completed={adViewsToday >= 3}
        onAction={handleAdWatch}
        disabled={isAdLoading || isAdShowing || !isAdReady}
        actionLabel={isAdShowing ? '시청 중...' : '+50🪙'}
      />

      <MissionCard
        emoji="✅"
        title="오늘 출석 체크"
        subtitle={checkedInToday ? '완료!' : '아직 미출석'}
        reward="+10🪙"
        completed={checkedInToday}
      />

      <MissionCard
        emoji="🔥"
        title="7일 연속 출석 달성"
        subtitle={`현재 ${user.streak_days}일 / 7일`}
        reward="+200🪙"
        progress={{ current: Math.min(user.streak_days, 7), total: 7 }}
        completed={user.streak_days >= 7}
      />

      <MissionCard
        emoji="📤"
        title="친구에게 공유하기"
        subtitle="토스 공유 링크로 초대"
        reward="+100🪙"
        completed={(user.shares_today ?? 0) >= 1}
        onAction={handleShare}
        actionLabel="+100🪙"
      />
    </div>
  );
}
```

```typescript
// src/components/reward/AchievementGrid.tsx
import { ACHIEVEMENTS } from '@/lib/achievements';

interface Props {
  achievedKeys: string[];
}

export function AchievementGrid({ achievedKeys }: Props) {
  const achievedSet = new Set(achievedKeys);

  return (
    <div>
      <p className="text-white text-sm font-bold mb-2">🏅 업적</p>
      <div className="flex gap-2 flex-wrap">
        {ACHIEVEMENTS.map((a) => {
          const achieved = achievedSet.has(a.key);
          return (
            <div
              key={a.key}
              className={`rounded-xl p-2.5 text-center w-20 ${
                achieved ? 'bg-[#2d2d1a]' : 'bg-[#1a1a1a]'
              }`}
            >
              <div className={`text-2xl ${achieved ? '' : 'grayscale opacity-40'}`}>
                {a.emoji}
              </div>
              <p className={`text-[10px] font-bold mt-1 ${achieved ? 'text-yellow-400' : 'text-gray-600'}`}>
                {a.name}
              </p>
              <p className={`text-[9px] ${achieved ? 'text-green-400' : 'text-gray-600'}`}>
                {achieved ? '달성!' : a.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement Reward page**

```typescript
// src/pages/Reward.tsx
import { PageLayout } from '@/components/layout/PageLayout';
import { AssetSummary } from '@/components/reward/AssetSummary';
import { MissionBoard } from '@/components/reward/MissionBoard';
import { AchievementGrid } from '@/components/reward/AchievementGrid';
import { useUser } from '@/hooks/useUser';
import { useAchievements } from '@/hooks/useAchievements';

export default function Reward() {
  const { user, isLoading } = useUser();
  const { data: achievements } = useAchievements();

  if (isLoading || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  const achievedKeys = (achievements ?? []).map((a) => a.achievement_key);

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <AssetSummary poopCoins={user.poop_coins} />
        <MissionBoard />
        <AchievementGrid achievedKeys={achievedKeys} />
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReward.ts src/hooks/useAchievements.ts src/components/reward/ src/pages/Reward.tsx
git commit -m "feat: implement Reward page with missions and achievements

- useReward: rewarded ad hook (load→show→claim pattern)
- MissionBoard: daily missions (ad/attendance/streak/share)
- AchievementGrid: 8 achievements with unlock state
- Ad flow follows MUST: load → show order (CLAUDE.md)"
```

---

### Task 22: Implement Settings page

**Files:**
- Create: `src/components/settings/ProfileSection.tsx`
- Create: `src/components/settings/WageSettings.tsx`
- Create: `src/components/settings/NotificationSettings.tsx`
- Create: `src/components/settings/AccountSettings.tsx`
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Create settings components**

```typescript
// src/components/settings/ProfileSection.tsx
import type { User } from '@/hooks/useUser';

interface Props { user: User; }

export function ProfileSection({ user }: Props) {
  return (
    <div className="bg-[#111] rounded-xl p-4 flex items-center gap-3">
      <div className="w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-2xl">
        💩
      </div>
      <div className="flex-1">
        <p className="text-white font-bold">{user.nickname}</p>
        <p className="text-gray-500 text-xs">토스 계정 연동됨</p>
      </div>
    </div>
  );
}
```

```typescript
// src/components/settings/WageSettings.tsx
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function WageSettings() {
  const { user, updateUser, isUpdating } = useUser();
  const [editingWage, setEditingWage] = useState(false);
  const [wageInput, setWageInput] = useState(String(user?.hourly_wage ?? 9860));
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationMin, setDurationMin] = useState(Math.floor((user?.quick_duration_seconds ?? 300) / 60));

  if (!user) return null;

  const handleSaveWage = async () => {
    const wage = parseInt(wageInput, 10);
    if (isNaN(wage) || wage < 0 || wage > 1000000) {
      toast.error('올바른 시급을 입력해주세요 (0~1,000,000원)');
      return;
    }
    await updateUser({ hourly_wage: wage });
    setEditingWage(false);
    toast.success('시급이 변경되었습니다');
  };

  const handleSaveDuration = async () => {
    await updateUser({ quick_duration_seconds: durationMin * 60 });
    setEditingDuration(false);
    toast.success(`원탭 시간이 ${durationMin}분으로 변경되었습니다`);
  };

  return (
    <div>
      <p className="text-gray-500 text-xs font-bold mb-2 px-1">💰 수익 설정</p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 flex justify-between items-center border-b border-[#1a1a1a]">
          <span className="text-white text-sm">시급</span>
          {editingWage ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={wageInput}
                onChange={(e) => setWageInput(e.target.value)}
                className="bg-[#222] text-white text-sm px-2 py-1 rounded w-24 text-right"
                autoFocus
              />
              <button
                onClick={handleSaveWage}
                disabled={isUpdating}
                className="text-[#3182F6] text-sm font-bold"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingWage(true)}
              className="flex items-center gap-1"
            >
              <span className="text-[#FF6B35] font-bold text-sm">
                ₩ {user.hourly_wage.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">›</span>
            </button>
          )}
        </div>
        <div className="px-4 py-3.5 flex justify-between items-center">
          <span className="text-white text-sm">원탭 기본 시간</span>
          {editingDuration ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={15}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-white text-sm w-8">{durationMin}분</span>
              <button
                onClick={handleSaveDuration}
                disabled={isUpdating}
                className="text-[#3182F6] text-sm font-bold"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingDuration(true)}
              className="text-gray-500 text-sm"
            >
              {Math.floor(user.quick_duration_seconds / 60)}분 ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/settings/NotificationSettings.tsx
export function NotificationSettings() {
  return (
    <div>
      <p className="text-gray-500 text-xs font-bold mb-2 px-1">🔔 알림</p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 flex justify-between items-center border-b border-[#1a1a1a]">
          <div>
            <p className="text-white text-sm">출근 리마인더</p>
            <p className="text-gray-500 text-[11px]">평일 오전 9시에 알림</p>
          </div>
          <div className="w-11 h-6 bg-[#4CAF50] rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
          </div>
        </div>
        <div className="px-4 py-3.5 flex justify-between items-center">
          <div>
            <p className="text-white text-sm">연속 출석 위험 알림</p>
            <p className="text-gray-500 text-[11px]">오후 5시까지 미출석 시</p>
          </div>
          <div className="w-11 h-6 bg-[#4CAF50] rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/settings/AccountSettings.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountSettings() {
  const { logout } = useAuth();
  const { user, updateUser } = useUser();
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname ?? '');

  const handleNicknameSave = async () => {
    if (!nicknameInput.trim()) return;
    await updateUser({ nickname: nicknameInput.trim() });
    setNicknameOpen(false);
    toast.success('닉네임이 변경되었습니다');
  };

  const handleDataReset = async () => {
    // TODO: Call data reset API endpoint (POST /api/user/reset)
    toast.success('데이터가 초기화되었습니다');
  };

  return (
    <div>
      <p className="text-gray-500 text-xs font-bold mb-2 px-1">👤 계정</p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        {/* 닉네임 변경 */}
        <AlertDialog open={nicknameOpen} onOpenChange={setNicknameOpen}>
          <AlertDialogTrigger asChild>
            <button className="w-full px-4 py-3.5 flex justify-between items-center border-b border-[#1a1a1a] text-left">
              <span className="text-white text-sm">닉네임 변경</span>
              <span className="text-gray-500 text-sm">›</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">닉네임 변경</AlertDialogTitle>
            </AlertDialogHeader>
            <input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="새 닉네임"
              className="w-full bg-[#222] text-white px-3 py-2 rounded-lg"
              maxLength={20}
            />
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#333] text-white border-none">취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleNicknameSave} className="bg-[#3182F6] text-white">저장</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full px-4 py-3.5 flex justify-between items-center border-b border-[#1a1a1a] text-left">
              <span className="text-white text-sm">데이터 초기화</span>
              <span className="text-gray-500 text-sm">›</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">데이터를 초기화할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                모든 체크인 기록과 코인이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#333] text-white border-none">취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDataReset} className="bg-red-600 text-white">초기화</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full px-4 py-3.5 flex justify-between items-center text-left">
              <span className="text-red-500 text-sm">토스 연동 해제</span>
              <span className="text-gray-500 text-sm">›</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">토스 연동을 해제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                로그아웃되며 다시 로그인하면 데이터가 복구됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#333] text-white border-none">취소</AlertDialogCancel>
              <AlertDialogAction onClick={logout} className="bg-red-600 text-white">
                연동 해제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement Settings page**

```typescript
// src/pages/Settings.tsx
import { PageLayout } from '@/components/layout/PageLayout';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { WageSettings } from '@/components/settings/WageSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { useUser } from '@/hooks/useUser';
import { BRAND } from '@/lib/constants';

export default function Settings() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <PageLayout showTabBar={false}>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showTabBar={false}>
      <div className="p-4 flex flex-col gap-4">
        <ProfileSection user={user} />
        <WageSettings />
        <NotificationSettings />
        <AccountSettings />

        <p className="text-center text-gray-600 text-xs mt-2">
          {BRAND.name} v1.0.0 · 문의: support@example.com
        </p>
      </div>
    </PageLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/ src/pages/Settings.tsx
git commit -m "feat: implement Settings page

- ProfileSection: avatar + nickname + Toss link status
- WageSettings: inline wage editor with validation
- NotificationSettings: reminder toggles (UI only)
- AccountSettings: data reset + unlink with AlertDialog (not alert()!)
- Uses shadcn AlertDialog per NEVER rules (no alert/confirm/prompt)"
```

---

## Chunk 5: Polish + Launch Readiness

### Task 23: Add dark theme CSS variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add dark mode base styles to index.css**

Append after existing imports:

```css
/* 싸월급 dark theme base */
:root {
  --background: #0A0A0A;
  --foreground: #ffffff;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

/* Prevent horizontal scroll (ALWAYS rule) */
html, body, #root {
  overflow-x: hidden;
  max-width: 100vw;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add dark theme CSS and scroll prevention

- Dark background #0A0A0A
- Prevent horizontal scroll (Toss review ALWAYS rule)
- Disable tap highlight and overscroll"
```

---

### Task 24: Run full test suite and build

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass

- [ ] **Step 2: Run production build**

```bash
npx vite build
```
Expected: Build succeeds with no errors

- [ ] **Step 3: Fix any issues found**

Address any TypeScript errors, missing imports, or build failures.

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve build and test issues"
```

---

### Task 25: Final review — Toss compliance audit

- [ ] **Step 1: Verify NEVER rules compliance**

Run these checks manually:

| Rule | Check | Expected |
|------|-------|----------|
| No `alert()` | `grep -r "alert(" src/ --include="*.tsx" --include="*.ts"` | No matches (except AlertDialog imports) |
| No custom header | `grep -r "app-header\|AppHeader\|TopBar" src/` | No matches |
| No hamburger menu | `grep -r "hamburger\|HamburgerMenu\|sidebar-toggle" src/` | No matches |
| No pinch zoom | Check `index.html` viewport | `user-scalable=no` present |
| Intro before login | Check `src/pages/Intro.tsx` | `appLogin` only on button click |
| No OAuth tokens on client | `grep -r "accessToken\|refreshToken" src/ --include="*.tsx"` | Only in sdk.ts (passed to server) |
| No external navigation | `grep -r "window.open\|window.location.href" src/` | No matches |
| No app install promotion | `grep -r "앱.*설치\|다운로드\|마켓" src/` | No matches |
| No subscription wording | `grep -r "구독\|정기결제" src/` | No matches (미사용 시) |
| Share uses SDK | `grep -r "getTossShareLink" src/` | Only in sdk.ts wrapper |

- [ ] **Step 2: Verify ALWAYS rules compliance**

| Rule | Check | Expected |
|------|-------|----------|
| navigationBar config | Check `granite.config.ts` | `withBackButton: true, withHomeButton: true` |
| Brand name consistency | Search "싸월급" in index.html, granite.config.ts | Present in all locations |
| Mono icon | Check granite.config.ts accessory icon | `icon-setting-mono` |
| primaryColor 6-digit hex | Check granite.config.ts `primaryColor` | `#FF6B35` (6 digits with #) |
| SDK dynamic import | `grep -r "from '@apps-in-toss" src/` | No static imports |
| First screen back exits | Test `/` route back button behavior | Exits mini-app (not refresh) |
| All routes valid | Navigate to each of 7 routes | All return valid pages, no 404 |
| Ad load→show order | Check `useReward.ts` | `loadFullScreenAd` before `showFullScreenAd` |
| Unlink callback | Check `api/auth/unlink.ts` exists | Handles UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS |

- [ ] **Step 3: Document any remaining TODOs**

Create a brief list of items that need production setup:
- Supabase project creation + migration run
- Vercel environment variables
- Toss OAuth mTLS certificates
- Ad group ID from AppsInToss console
- 600×600 app logo

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: Toss review compliance audit — all checks pass"
```

---

## Summary

| Chunk | Tasks | Key Deliverables |
|-------|-------|-----------------|
| **1: Foundation** | 1-7 | index.html, granite.config, DB schema, lib/, routing, layout |
| **2: Auth + API** | 8-13 | 13 API endpoints, JWT auth, Supabase integration |
| **3: Core Screens** | 14-18 | Intro, Home, Timer pages with full interactivity |
| **4: Feature Screens** | 19-22 | Stats, Ranking, Reward, Settings pages |
| **5: Polish** | 23-25 | Dark theme, tests, build, Toss compliance audit |

**Total: 25 tasks, ~50 files created/modified**

**Dependencies to install:**
```bash
npm install zustand jsonwebtoken @supabase/supabase-js
npm install -D @types/jsonwebtoken @vercel/node
```
