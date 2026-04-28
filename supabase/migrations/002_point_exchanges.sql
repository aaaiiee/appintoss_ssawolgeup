-- 똥코인 → 토스포인트 교환 시스템 마이그레이션
-- Hybrid approach: mock (DB only) → production (Toss promotion API) via EXCHANGE_MODE env

-- 1) users 테이블에 누적 포인트 잔고 컬럼 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS toss_points_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_exchange_date DATE,
  ADD COLUMN IF NOT EXISTS exchanges_today INTEGER NOT NULL DEFAULT 0;

-- 2) 교환 이력 테이블
CREATE TABLE IF NOT EXISTS point_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coins_spent INTEGER NOT NULL,
  points_granted INTEGER NOT NULL,
  tier_id TEXT NOT NULL,
  exchange_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  mode TEXT NOT NULL CHECK (mode IN ('mock', 'production')),
  promotion_request_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_point_exchanges_user ON point_exchanges(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_exchanges_key ON point_exchanges(exchange_key);
CREATE INDEX IF NOT EXISTS idx_point_exchanges_status ON point_exchanges(status);

ALTER TABLE point_exchanges ENABLE ROW LEVEL SECURITY;
-- No policies: service_role only (bypasses RLS)

-- 3) 원자적 잔고 변경 함수 (race condition 방지)
CREATE OR REPLACE FUNCTION apply_exchange(
  p_user_id UUID,
  p_coins INTEGER,
  p_points INTEGER
) RETURNS void AS $$
DECLARE
  v_current_coins INTEGER;
BEGIN
  SELECT poop_coins INTO v_current_coins
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_coins < p_coins THEN
    RAISE EXCEPTION 'INSUFFICIENT_COINS';
  END IF;

  UPDATE users
  SET poop_coins = poop_coins - p_coins,
      toss_points_balance = toss_points_balance + p_points,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
