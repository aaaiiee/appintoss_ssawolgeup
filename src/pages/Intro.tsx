import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { BRAND } from '@/lib/constants';
import { formatWon } from '@/lib/calculations';
import { toast } from 'sonner';

const TERMS_AGREED_KEY = 'ssawolgeup:terms_agreed_at';

export default function Intro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [globalTotal, setGlobalTotal] = useState<number | null>(null);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TERMS_AGREED_KEY);
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/stats/total-earned', { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setGlobalTotal(d.totalEarned))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleStart = async () => {
    if (!termsAgreed) {
      toast.error('이용약관에 동의해 주세요');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(TERMS_AGREED_KEY, new Date().toISOString());
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
        <div className="text-6xl mb-4">💩💰</div>

        <h1 className="text-3xl font-bold mb-2">{BRAND.name}</h1>
        <p className="text-gray-400 text-center mb-8">{BRAND.slogan}</p>

        {globalTotal !== null && globalTotal > 0 && (
          <div className="bg-[#1A1A1A] rounded-2xl px-6 py-4 mb-8 text-center">
            <p className="text-xs text-gray-500 mb-1">지금까지 직장인들이 번 돈</p>
            <p className="text-2xl font-bold text-[#FF6B35]">
              {formatWon(globalTotal)}
            </p>
          </div>
        )}

        <label className="flex items-start gap-2 mb-4 max-w-xs w-full text-left cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#FF6B35]"
            aria-label="이용약관 동의"
          />
          <span className="text-xs text-gray-400 leading-relaxed">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/terms');
              }}
              className="text-[#FF6B35] underline"
            >
              이용약관
            </button>{' '}
            및 개인정보 수집·이용에 동의합니다. (필수)
          </span>
        </label>

        <button
          onClick={handleStart}
          disabled={isLoading || !termsAgreed}
          className="w-full max-w-xs py-4 rounded-xl font-bold text-lg bg-[#FF6B35] text-white disabled:opacity-50 transition-opacity"
        >
          {isLoading ? '로그인 중...' : '시작하기'}
        </button>

        <p className="text-xs text-gray-600 mt-4 text-center">
          토스 계정으로 간편 로그인
        </p>
      </div>
    </PageLayout>
  );
}
