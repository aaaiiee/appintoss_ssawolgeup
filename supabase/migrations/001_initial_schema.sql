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

-- RLS 활성화 (방어적 — service_role은 bypass, anon 키 직접 접근 차단)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies for anon role
-- All access goes through Vercel API using service_role key

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
