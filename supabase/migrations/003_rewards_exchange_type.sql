-- rewards.type CHECK 제약에 'exchange' 추가
-- 기존: 'ad' | 'streak' | 'achievement' | 'share'
-- 추가: 'exchange' (똥코인 → 토스포인트 교환 이력)

ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_type_check;

ALTER TABLE rewards
  ADD CONSTRAINT rewards_type_check
  CHECK (type IN ('ad', 'streak', 'achievement', 'share', 'exchange'));
