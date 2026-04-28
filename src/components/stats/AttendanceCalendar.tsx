import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ko } from 'date-fns/locale';

interface Props {
  attendanceDays: string[];
  month: Date;
  onMonthChange: (date: Date) => void;
  daily: Record<string, { earned: number; count: number }>;
}

function formatDateKR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${m}월 ${d}일 (${dayName})`;
}

export function AttendanceCalendar({ attendanceDays, month, onMonthChange, daily }: Props) {
  const attendanceDates = attendanceDays.map((d) => new Date(d + 'T00:00:00'));
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  const [selectedDay, setSelectedDay] = useState<string | null>(todayStr);

  const handleDayClick = (date: Date) => {
    // 모든 날짜 클릭 가능 (출석/미출석 무관)
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    setSelectedDay(dateStr);
  };

  const selectedData = selectedDay ? daily[selectedDay] : null;
  const isFutureDate = selectedDay ? selectedDay > todayStr : false;
  const isAttendanceDay = selectedDay ? attendanceDays.includes(selectedDay) : false;

  const clickedDate = selectedDay ? new Date(selectedDay + 'T00:00:00') : undefined;

  return (
    <div className="bg-[#111] rounded-xl p-3">
      <Calendar
        mode="multiple"
        selected={attendanceDates}
        month={month}
        onMonthChange={onMonthChange}
        onDayClick={handleDayClick}
        locale={ko}
        className="w-full"
        // 클릭한 날짜만 커스텀 modifier (오늘은 v9 기본 today className 사용)
        modifiers={clickedDate ? { clicked: clickedDate } : undefined}
        modifiersClassNames={{
          clicked: '!ring-2 !ring-blue-400 !ring-offset-1 !ring-offset-[#111]',
        }}
        classNames={{
          months: 'flex flex-col w-full',
          month: 'space-y-2 w-full',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex justify-around w-full',
          weekday: 'text-gray-500 w-9 font-normal text-[11px] text-center',
          week: 'flex justify-around w-full mt-2',
          day: 'h-9 w-9 text-center text-sm p-0 relative',
          day_button:
            'h-9 w-9 p-0 font-normal text-white rounded-full hover:bg-[#1f1f1f]',
          // v9 정식 키: selected (출석한 날) — 주황색 채움
          selected:
            '!bg-[#FF6B35] !text-white !font-bold hover:!bg-[#FF6B35] focus:!bg-[#FF6B35] !rounded-full',
          // v9 정식 키: today — 녹색 테두리 (출석한 오늘이면 주황 bg + 녹색 border 동시 표시)
          today:
            '!border-2 !border-green-500 !rounded-full !font-bold',
          outside: 'text-gray-700 opacity-40',
          disabled: 'text-gray-700 opacity-30',
        }}
      />

      {/* 범례 */}
      <div className="flex justify-center gap-4 mt-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#FF6B35]" />
          출석
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-green-500" />
          오늘
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-400" />
          선택
        </span>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedDay && (
        <div
          className={`mt-3 rounded-xl p-4 border ${
            isAttendanceDay ? 'bg-[#2a1510] border-[#FF6B35]/40' : 'bg-[#1a1a1a] border-[#222]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white text-base font-bold">{formatDateKR(selectedDay)}</p>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {selectedDay === todayStr
                  ? '오늘'
                  : isFutureDate
                    ? '아직 오지 않은 날'
                    : isAttendanceDay
                      ? '✅ 출석 완료'
                      : '❌ 미출석'}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 text-xs hover:text-white px-2 py-1 -m-1"
            >
              닫기
            </button>
          </div>

          {selectedData && selectedData.earned > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <p className="text-gray-500 text-[10px]">💰 수익</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: '#FF6B35' }}>
                  ₩{selectedData.earned.toLocaleString('ko-KR')}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <p className="text-gray-500 text-[10px]">🚽 체크인</p>
                <p className="text-xl font-bold text-yellow-400 mt-0.5">
                  {selectedData.count}회
                </p>
              </div>
            </div>
          ) : isFutureDate ? (
            <p className="text-gray-500 text-sm text-center py-3">
              ⏳ 아직 다가오지 않은 날이에요
            </p>
          ) : (
            <p className="text-gray-500 text-sm text-center py-3">
              💩 이 날은 출석 기록이 없어요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
