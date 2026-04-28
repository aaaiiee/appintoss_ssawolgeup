interface Props {
  daily: Record<string, { earned: number; count: number }>;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const BAR_HEIGHT_PX = 140;
const MIN_FILL_RATIO = 0.08; // 0원 아닌 날은 최소 8%는 채워서 표시

/** 짧은 원 포맷: 0 → "—", 999 → "999", 1234 → "1.2k", 12340 → "12k" */
function formatShortWon(amount: number): string {
  if (amount <= 0) return '—';
  if (amount < 1000) return amount.toLocaleString('ko-KR');
  if (amount < 10000) return `${(amount / 1000).toFixed(1)}k`;
  return `${Math.floor(amount / 1000)}k`;
}

export function WeeklyChart({ daily }: Props) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  // 이번 주의 월요일을 찾는다 (Sun=0,Mon=1,...,Sat=6 → Mon-base 0,1,..,6)
  const todayMonBase = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayMonBase);

  const data = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    data.push({
      day: DAY_LABELS[i],
      dateNum: date.getDate(),
      earned: daily[dateStr]?.earned ?? 0,
      isToday: dateStr === todayStr,
      isWeekend: i >= 5,
      isFuture: dateStr > todayStr,
    });
  }

  const weekTotal = data.reduce((s, d) => s + d.earned, 0);
  const maxEarned = Math.max(...data.map((d) => d.earned), 0);
  const bestDay = maxEarned > 0 ? data.find((d) => d.earned === maxEarned) : null;

  return (
    <div className="bg-[#111] rounded-xl p-4">
      {/* 헤더: 제목 + 7일 합계 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white text-base font-bold">
            <span className="text-xl mr-1">📊</span>이번 주 수익
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">최근 7일</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500">7일 합계</p>
          <p className="text-xl font-bold" style={{ color: '#FF6B35' }}>
            ₩{weekTotal.toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 커스텀 막대 차트 — 골격 막대 + 채움 막대 2-layer */}
      <div className="flex items-end gap-1.5" style={{ height: BAR_HEIGHT_PX + 56 }}>
        {data.map((d, idx) => {
          const ratio = maxEarned > 0 ? d.earned / maxEarned : 0;
          const fillHeight = d.earned > 0
            ? Math.max(ratio, MIN_FILL_RATIO) * BAR_HEIGHT_PX
            : 0;
          const labelText = d.isFuture ? '·' : formatShortWon(d.earned);
          const labelColor = d.isFuture
            ? '#333'
            : d.earned === 0
              ? '#444'
              : d.isToday
                ? '#FF6B35'
                : '#fff';

          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              {/* 상단 수익 수치 */}
              <p
                className="text-[11px] font-bold mb-1"
                style={{ color: labelColor }}
              >
                {labelText}
              </p>

              {/* 차트 영역: 골격 + 채움 */}
              <div
                className="w-full relative rounded-md overflow-hidden"
                style={{ height: BAR_HEIGHT_PX, backgroundColor: '#1f1f1f' }}
              >
                {/* 격자 가이드 라인 (25%, 50%, 75%) */}
                {[0.25, 0.5, 0.75].map((r) => (
                  <div
                    key={r}
                    className="absolute left-0 right-0 border-t border-dashed border-[#2a2a2a]"
                    style={{ bottom: `${r * 100}%` }}
                  />
                ))}

                {/* 채움 막대 */}
                {d.earned > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-md"
                    style={{
                      height: fillHeight,
                      background: d.isToday
                        ? 'linear-gradient(to top, #FF6B35, #FFA070)'
                        : 'linear-gradient(to top, #8b3a15, #d65d2e)',
                      boxShadow: d.isToday ? '0 0 8px rgba(255,107,53,0.5)' : undefined,
                    }}
                  />
                )}
              </div>

              {/* 하단 요일 + 날짜 */}
              <div className="mt-2 text-center">
                <p
                  className={`text-[12px] ${
                    d.isFuture
                      ? 'text-gray-700'
                      : d.isToday
                        ? 'font-bold'
                        : d.isWeekend
                          ? 'text-gray-500'
                          : 'text-gray-400'
                  }`}
                  style={{ color: d.isToday ? '#FF6B35' : undefined }}
                >
                  {d.day}
                  {d.isToday && <span className="text-[9px] ml-0.5">●</span>}
                </p>
                <p className={`text-[10px] ${d.isFuture ? 'text-gray-700' : 'text-gray-600'}`}>
                  {d.dateNum}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      {bestDay ? (
        <p className="text-xs text-gray-500 mt-3 text-center">
          🏆 이번 주 최고: <span className="text-white font-bold">{bestDay.day}요일</span> ·{' '}
          <span style={{ color: '#FF6B35' }} className="font-bold">
            ₩{bestDay.earned.toLocaleString('ko-KR')}
          </span>
        </p>
      ) : (
        <p className="text-xs text-gray-600 mt-3 text-center">
          이번 주 첫 수익을 만들어 보세요 💩
        </p>
      )}
    </div>
  );
}
