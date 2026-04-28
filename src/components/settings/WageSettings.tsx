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
      <p className="text-gray-400 text-sm font-bold mb-2 px-1">
        <span className="text-xl mr-1">💰</span>수익 설정
      </p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 flex justify-between items-center border-b border-[#1a1a1a]">
          <span className="text-white text-sm">시급</span>
          {editingWage ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWageInput(String(Math.max(0, parseInt(wageInput, 10) - 1000)))}
                className="w-8 h-8 rounded-lg bg-[#333] text-white font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                step={1000}
                value={wageInput}
                onChange={(e) => setWageInput(e.target.value)}
                className="bg-[#222] text-white text-sm px-2 py-1 rounded w-24 text-right"
                autoFocus
              />
              <button
                onClick={() => setWageInput(String(Math.min(1000000, parseInt(wageInput, 10) + 1000)))}
                className="w-8 h-8 rounded-lg bg-[#333] text-white font-bold text-lg"
              >
                +
              </button>
              <button
                onClick={handleSaveWage}
                disabled={isUpdating}
                className="text-[#3182F6] text-sm font-bold ml-1"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setWageInput(String(user.hourly_wage)); setEditingWage(true); }}
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
