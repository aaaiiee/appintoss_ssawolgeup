import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { LiveEarnings } from '@/components/timer/LiveEarnings';
import { TimerResult } from '@/components/timer/TimerResult';
import { useTimer } from '@/hooks/useTimer';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useUser } from '@/hooks/useUser';
import { useReward } from '@/hooks/useReward';
import { useAuthStore } from '@/stores/authStore';
import { calculateCoinsEarned } from '@/lib/calculations';
import { MAX_DAILY_AD_VIEWS } from '@/lib/constants';
import { toast } from 'sonner';

export default function Timer() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { user } = useUser();
  const { state, elapsedSeconds, start, stop, reset } = useTimer();
  const { checkIn } = useCheckIn();
  const { isAdReady, isAdShowing, showAdAndClaim } = useReward();
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bonusCoins, setBonusCoins] = useState(0);
  const [result, setResult] = useState<{
    earnedAmount: number;
    coinsEarned: number;
    streakDays: number;
    multiplier: number;
  } | null>(null);
  const isHarvestingRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (state === 'idle') start();
  }, [state, start]);

  const handleHarvest = async () => {
    if (isHarvestingRef.current) return;
    isHarvestingRef.current = true;
    setIsProcessing(true);
    stop();
    try {
      // Step 1: 기록 저장 + 기본 보상 적립
      const res = await checkIn({
        mode: 'timer',
        durationSeconds: elapsedSeconds,
      });

      // Step 2: 전면형 리워드 광고 표시 (광고 준비된 경우만, 실패 시에도 결과는 표시)
      let bonus = 0;
      if (isAdReady) {
        try {
          const adReward = await showAdAndClaim();
          bonus = adReward?.coinsEarned ?? 0;
        } catch (error) {
          console.warn('[Harvest] ad show failed:', error);
        }
      }

      // Step 3: 결과 화면 표시 (보너스 포함)
      setBonusCoins(bonus);
      setResult(res.stats);
      setShowResult(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '기록 실패');
      navigate('/home');
    } finally {
      setIsProcessing(false);
      isHarvestingRef.current = false;
    }
  };

  // Auto-harvest when timer hits 30min limit
  const handleHarvestRef = useRef(handleHarvest);
  handleHarvestRef.current = handleHarvest;
  useEffect(() => {
    if (state === 'done' && !showResult && !isHarvestingRef.current) {
      handleHarvestRef.current();
    }
  }, [state, showResult]);

  const handleResultClose = () => {
    setShowResult(false);
    reset();
    navigate('/home');
  };

  const handleWatchAdAgain = async () => {
    if (!isAdReady || isAdShowing) return;
    try {
      const reward = await showAdAndClaim();
      if (reward?.coinsEarned) {
        setBonusCoins((prev) => prev + reward.coinsEarned);
        toast.success(`+${reward.coinsEarned} 🪙 보너스!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '광고 시청 실패');
    }
  };

  const adViewsToday = user?.ad_views_today ?? 0;
  const adViewsRemaining = Math.max(0, MAX_DAILY_AD_VIEWS - adViewsToday);
  const canWatchAd = isAdReady && !isAdShowing && adViewsRemaining > 0;

  if (!user) return null;

  const estimatedCoins = calculateCoinsEarned('timer', elapsedSeconds, user.streak_days);

  return (
    <PageLayout showTabBar={false}>
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 gap-6">
        <div className="bg-green-900/30 text-green-400 px-4 py-1.5 rounded-full text-sm font-medium">
          🟢 근무 중 (돈 벌는 중)
        </div>
        <TimerDisplay elapsedSeconds={elapsedSeconds} />
        <LiveEarnings elapsedSeconds={elapsedSeconds} hourlyWage={user.hourly_wage} />
        <p className="text-gray-500 text-sm">
          🪙 예상 획득: +{estimatedCoins} 똥코인
        </p>
        {state === 'running' && (
          <>
            <button
              onClick={handleHarvest}
              disabled={isProcessing}
              className="w-full max-w-xs py-4 rounded-2xl bg-red-600 text-white font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? '처리 중...' : '💰 수확 완료!'}
            </button>
            {isAdReady && !isProcessing && (
              <p className="text-gray-500 text-xs">
                🎬 광고 보고 보너스 코인 받을 수 있어요
              </p>
            )}
          </>
        )}
      </div>
      {result && (
        <TimerResult
          open={showResult}
          onClose={handleResultClose}
          earnedAmount={result.earnedAmount}
          coinsEarned={result.coinsEarned}
          bonusCoins={bonusCoins}
          durationSeconds={elapsedSeconds}
          streakDays={result.streakDays}
          multiplier={result.multiplier}
          onWatchAdAgain={handleWatchAdAgain}
          canWatchAd={canWatchAd}
          isWatchingAd={isAdShowing}
          adViewsRemaining={adViewsRemaining}
        />
      )}
    </PageLayout>
  );
}
