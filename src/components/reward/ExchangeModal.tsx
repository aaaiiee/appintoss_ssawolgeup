import type { ExchangeTier } from '@/hooks/useExchange';
import { MAX_EXCHANGES_PER_DAY } from '@/lib/exchangeTiers';

interface Props {
  open: boolean;
  tier: ExchangeTier | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Exchange confirmation bottom sheet.
 * Complies with CLAUDE.md: shows product name, quantity, total amount, and refund policy.
 */
export function ExchangeModal({ open, tier, isLoading, onConfirm, onCancel }: Props) {
  if (!open || !tier) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-md bg-[#111] rounded-t-2xl p-5 text-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold mb-4">포인트 교환 확인</h2>

        <div className="bg-[#1a1a2e] rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">상품</span>
            <span className="font-bold">토스포인트</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">차감 코인</span>
            <span className="font-bold text-yellow-400">
              {tier.coins.toLocaleString()} 🪙
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">지급 포인트</span>
            <span className="font-bold text-[#3182F6]">
              {tier.points.toLocaleString()} P
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#222]">
            <span className="text-gray-400 text-sm">교환 비율</span>
            <span className="text-xs text-gray-300">100🪙 = 10P</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-xl p-3 mb-4 text-xs text-gray-500 leading-relaxed">
          <p className="font-bold text-gray-300 text-sm mb-1">
            <span className="text-lg mr-1">📌</span>교환 안내
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>교환 완료 후 즉시 토스포인트 잔고에 반영됩니다</li>
            <li>교환된 포인트는 환불·취소·재지급되지 않습니다 (이용약관 제9조)</li>
            <li>하루 최대 {MAX_EXCHANGES_PER_DAY}회 교환 가능 (자정 초기화)</li>
            <li>토스포인트는 토스 앱 내에서 사용 가능합니다</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-[#222] text-gray-300 font-bold disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-[#FF6B35] text-white font-bold disabled:opacity-50"
          >
            {isLoading ? '교환 중...' : '교환하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
