import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '';
// VITE_API_URL이 비어있으면 mock 모드로 폴백 (백엔드 미배포 환경 검수용)
// 정식 배포 시 VITE_API_URL 설정하면 자동으로 실 백엔드 사용
const USE_MOCK = import.meta.env.DEV || !BASE_URL;

// Dev mock data — stateful, persists changes within session
const mockUserState: Record<string, unknown> = {
  id: 'mock-user-001',
  toss_user_id: 'mock-toss-user-001',
  nickname: '김직장인',
  hourly_wage: 9860,
  quick_duration_seconds: 300,
  poop_coins: 0,
  toss_points_balance: 0,
  streak_days: 0,
  last_check_in_date: null,
  total_earned: 0,
  total_check_ins: 0,
  ad_views_today: 0,
  ad_views_reset_date: null,
  shares_today: 0,
  shares_reset_date: null,
  exchanges_today: 0,
  last_exchange_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_EXCHANGE_TIERS = [
  { id: 'tier_1k', coins: 1000, points: 100 },
  { id: 'tier_3k', coins: 3000, points: 300 },
  { id: 'tier_5k', coins: 5000, points: 500 },
  { id: 'tier_10k', coins: 10000, points: 1000 },
];
const MOCK_MAX_EXCHANGES_PER_DAY = 1;
const mockPendingExchanges: Record<string, { tierId: string; coins: number; points: number; status: string }> = {};

let mockCheckInsToday = 0;
const mockCheckInHistory: Array<{ id: string; earned_amount: number; duration_seconds: number; coins_earned: number; mode: string; created_at: string }> = [];

const mockResponses: Record<string, (body?: unknown, query?: URLSearchParams) => unknown> = {
  'GET /api/user/me': () => ({ ...mockUserState }),
  'GET /api/check-ins': () => mockCheckInHistory,
  'GET /api/stats/summary': () => {
    const dailyMap: Record<string, { earned: number; count: number }> = {};
    let totalEarned = 0;
    let totalSeconds = 0;
    for (const ci of mockCheckInHistory) {
      const day = ci.created_at.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { earned: 0, count: 0 };
      dailyMap[day].earned += ci.earned_amount;
      dailyMap[day].count += 1;
      totalEarned += ci.earned_amount;
      totalSeconds += ci.duration_seconds;
    }
    return {
      month: new Date().toISOString().slice(0, 7),
      totalEarned,
      totalDays: Object.keys(dailyMap).length,
      totalSeconds,
      daily: dailyMap,
    };
  },
  'GET /api/stats/total-earned': () => ({ totalEarned: 1523400 }),
  'GET /api/ranking': (_body, query) => {
    const period = (query?.get('period') ?? 'week') as 'week' | 'month' | 'all';
    const makeEntry = (id: string, name: string, earned: number, count: number, secs: number) => ({
      userId: id, nickname: name, totalEarned: earned, checkInCount: count, totalSeconds: secs,
    });
    // 다른 유저: period 별로 다른 누적값. week ⊂ month ⊂ all 관계 (작은→큰)
    const otherUsersByPeriod: Record<typeof period, ReturnType<typeof makeEntry>[]> = {
      week: [
        makeEntry('u1', '똥부자', 32000, 18, 6000),
        makeEntry('u2', '화장실왕', 28000, 15, 7200),
        makeEntry('u3', '금쪽이', 22000, 12, 5400),
        makeEntry('u4', '쾌변러', 18000, 10, 4500),
        makeEntry('u5', '신입사원', 12000, 7, 3000),
      ],
      month: [
        makeEntry('u1', '똥부자', 98000, 45, 18000),
        makeEntry('u2', '화장실왕', 76000, 38, 22800),
        makeEntry('u3', '금쪽이', 65000, 32, 15600),
        makeEntry('u4', '쾌변러', 54000, 28, 13200),
        makeEntry('u5', '신입사원', 38000, 21, 9000),
      ],
      all: [
        makeEntry('u1', '똥부자', 320000, 145, 65000),
        makeEntry('u2', '화장실왕', 245000, 128, 78000),
        makeEntry('u3', '금쪽이', 198000, 102, 52000),
        makeEntry('u4', '쾌변러', 165000, 88, 44000),
        makeEntry('u5', '신입사원', 112000, 65, 31000),
      ],
    };
    // 본인 baseline (mockUserState 시드와 무관한 시뮬레이션 누적). 세션 중 새 체크인은 전 period에 추가됨.
    const myBaseline: Record<typeof period, { count: number; seconds: number; earned: number }> = {
      week: { count: 4, seconds: 1200, earned: 3280 },
      month: { count: 16, seconds: 6000, earned: 16400 },
      all: { count: 42, seconds: 18900, earned: 51660 },
    };
    const sessionCount = mockCheckInHistory.length;
    const sessionSeconds = mockCheckInHistory.reduce((s, ci) => s + (ci.duration_seconds ?? 0), 0);
    const sessionEarned = mockCheckInHistory.reduce((s, ci) => s + (ci.earned_amount ?? 0), 0);
    const base = myBaseline[period];
    const myCount = base.count + sessionCount;
    const mySeconds = base.seconds + sessionSeconds;
    const myEarned = base.earned + sessionEarned;
    const rankings = [
      ...otherUsersByPeriod[period],
      makeEntry('mock-user-001', mockUserState.nickname as string, myEarned, myCount, mySeconds),
    ].sort((a, b) => b.totalSeconds - a.totalSeconds);
    const myIdx = rankings.findIndex((r) => r.userId === 'mock-user-001');
    return { rankings, myRank: myIdx + 1, myEntry: rankings[myIdx] };
  },
  'GET /api/achievements': () => {
    const ts = new Date().toISOString();
    const checks: Array<{ key: string; condition: boolean }> = [
      { key: 'first_check_in', condition: (mockUserState.total_check_ins as number) >= 1 },
      { key: 'streak_3', condition: (mockUserState.streak_days as number) >= 3 },
      { key: 'streak_7', condition: (mockUserState.streak_days as number) >= 7 },
      { key: 'streak_30', condition: (mockUserState.streak_days as number) >= 30 },
      { key: 'total_100', condition: (mockUserState.total_check_ins as number) >= 100 },
      { key: 'millionaire', condition: (mockUserState.total_earned as number) >= 1_000_000 },
    ];
    return checks
      .filter((c) => c.condition)
      .map((c) => ({ achievement_key: c.key, achieved_at: ts }));
  },
  'POST /api/check-in': (body) => {
    if (mockCheckInsToday >= 3) {
      throw new Error('오늘 체크인은 여기까지! 내일 또 만나요 💩');
    }
    mockCheckInsToday += 1;
    const req = body as { mode?: string; durationSeconds?: number } | undefined;
    const wage = (mockUserState.hourly_wage as number) || 9860;
    const duration = req?.mode === 'timer' ? (req.durationSeconds ?? 300) : (mockUserState.quick_duration_seconds as number);
    const earnedAmount = Math.floor((wage / 3600) * duration);
    const minutes = Math.floor(duration / 60);
    const baseCoins = req?.mode === 'timer' ? 10 + minutes * 2 : 10;
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const alreadyCheckedToday = mockUserState.last_check_in_date === todayStr;
    const streakDays = alreadyCheckedToday
      ? (mockUserState.streak_days as number)
      : (mockUserState.streak_days as number) + 1;
    const multiplier = streakDays >= 30 ? 3.0 : streakDays >= 7 ? 2.0 : streakDays >= 3 ? 1.5 : 1.0;
    const coinsEarned = Math.floor(baseCoins * multiplier);

    mockUserState.total_check_ins = (mockUserState.total_check_ins as number) + 1;
    mockUserState.total_earned = (mockUserState.total_earned as number) + earnedAmount;
    mockUserState.poop_coins = (mockUserState.poop_coins as number) + coinsEarned;
    mockUserState.streak_days = streakDays;
    mockUserState.last_check_in_date = todayStr;
    const checkInRecord = { id: `ci-${Date.now()}`, duration_seconds: duration, earned_amount: earnedAmount, coins_earned: coinsEarned, mode: req?.mode ?? 'quick', created_at: new Date().toISOString() };
    mockCheckInHistory.unshift(checkInRecord);
    return {
      checkIn: checkInRecord,
      stats: { earnedAmount, coinsEarned, streakDays, multiplier, totalEarned: mockUserState.total_earned, poop_coins: mockUserState.poop_coins },
    };
  },
  'POST /api/reward/ad': () => {
    // 프로덕션 /api/reward/ad와 동일한 일일 한도 정책 적용 (3회/일)
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    if (mockUserState.ad_views_reset_date !== todayStr) {
      mockUserState.ad_views_today = 0;
      mockUserState.ad_views_reset_date = todayStr;
    }
    if ((mockUserState.ad_views_today as number) >= 3) {
      throw new Error('오늘 광고 보상을 모두 받았어요');
    }
    mockUserState.poop_coins = (mockUserState.poop_coins as number) + 50;
    mockUserState.ad_views_today = (mockUserState.ad_views_today as number) + 1;
    return {
      coinsEarned: 50,
      adViewsToday: mockUserState.ad_views_today,
      adViewsRemaining: 3 - (mockUserState.ad_views_today as number),
    };
  },
  'POST /api/reward/share': () => {
    mockUserState.poop_coins = (mockUserState.poop_coins as number) + 100;
    mockUserState.shares_today = 1;
    return { coinsEarned: 100 };
  },
  'PATCH /api/user/me': (body) => {
    Object.assign(mockUserState, body as object);
    mockUserState.updated_at = new Date().toISOString();
    return { ...mockUserState };
  },
  'POST /api/promotion/getKey': (body) => {
    const req = body as { tierId?: string } | undefined;
    const tier = MOCK_EXCHANGE_TIERS.find((t) => t.id === req?.tierId);
    if (!tier) throw new Error('Invalid tierId');
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const exchangesToday =
      mockUserState.last_exchange_date === todayStr ? (mockUserState.exchanges_today as number) : 0;
    if (exchangesToday >= MOCK_MAX_EXCHANGES_PER_DAY) {
      throw new Error('하루 최대 1회까지 교환 가능합니다');
    }
    if ((mockUserState.poop_coins as number) < tier.coins) {
      throw new Error(`코인이 부족합니다 (보유 ${mockUserState.poop_coins}, 필요 ${tier.coins})`);
    }
    const exchangeKey = `exch_mock_${Date.now()}`;
    mockPendingExchanges[exchangeKey] = {
      tierId: tier.id,
      coins: tier.coins,
      points: tier.points,
      status: 'pending',
    };
    return { exchangeKey, tier, mode: 'mock', expiresInSeconds: 300 };
  },
  'POST /api/promotion/execute': (body) => {
    const req = body as { exchangeKey?: string } | undefined;
    const pending = req?.exchangeKey ? mockPendingExchanges[req.exchangeKey] : undefined;
    if (!pending) throw new Error('Exchange not found');
    if (pending.status !== 'pending') throw new Error(`Exchange already ${pending.status}`);
    if ((mockUserState.poop_coins as number) < pending.coins) {
      pending.status = 'failed';
      throw new Error('코인이 부족합니다');
    }
    mockUserState.poop_coins = (mockUserState.poop_coins as number) - pending.coins;
    mockUserState.toss_points_balance =
      (mockUserState.toss_points_balance as number) + pending.points;
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    mockUserState.exchanges_today = 1;
    mockUserState.last_exchange_date = todayStr;
    pending.status = 'completed';
    return {
      status: 'completed',
      coinsSpent: pending.coins,
      pointsGranted: pending.points,
      mode: 'mock',
    };
  },
  'GET /api/promotion/result': () => {
    const entries = Object.entries(mockPendingExchanges);
    const latest = entries[entries.length - 1];
    if (!latest) return { status: 'not_found' };
    const [, data] = latest;
    return {
      status: data.status,
      coinsSpent: data.coins,
      pointsGranted: data.points,
      mode: 'mock',
    };
  },
};

function getMockResponse<T>(method: string, endpoint: string, body?: unknown): T | null {
  const [path, qs = ''] = endpoint.split('?');
  const query = new URLSearchParams(qs);
  const handler = mockResponses[`${method} ${path}`];
  if (handler) return handler(body, query) as T;
  return null;
}

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const method = options?.method || 'GET';

  if (USE_MOCK) {
    const body = options?.body ? JSON.parse(options.body as string) : undefined;
    const mock = getMockResponse<T>(method, endpoint, body);
    if (mock !== null) {
      await new Promise((r) => setTimeout(r, 200));
      return mock;
    }
  }

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
