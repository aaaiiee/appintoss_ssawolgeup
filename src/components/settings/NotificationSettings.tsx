import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const STORAGE_KEYS = {
  workReminder: 'ssawolgeup:notif:work-reminder',
  streakWarning: 'ssawolgeup:notif:streak-warning',
} as const;

function readBool(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  const stored = window.localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === 'true';
}

interface ToggleRowProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  divider?: boolean;
}

function ToggleRow({ title, description, enabled, onChange, divider }: ToggleRowProps) {
  return (
    <div
      className={`px-4 py-3.5 flex justify-between items-center ${
        divider ? 'border-b border-[#1a1a1a]' : ''
      }`}
    >
      <div>
        <p className="text-white text-sm">{title}</p>
        <p className="text-gray-500 text-[11px]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title} ${enabled ? '끄기' : '켜기'}`}
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
          enabled ? 'bg-[#4CAF50]' : 'bg-[#333]'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
            enabled ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationSettings() {
  const [workReminder, setWorkReminder] = useState(() =>
    readBool(STORAGE_KEYS.workReminder, true),
  );
  const [streakWarning, setStreakWarning] = useState(() =>
    readBool(STORAGE_KEYS.streakWarning, true),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.workReminder, String(workReminder));
  }, [workReminder]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.streakWarning, String(streakWarning));
  }, [streakWarning]);

  const handleWorkReminder = (next: boolean) => {
    setWorkReminder(next);
    toast.success(`출근 리마인더 알림이 ${next ? '켜졌어요' : '꺼졌어요'}`);
  };

  const handleStreakWarning = (next: boolean) => {
    setStreakWarning(next);
    toast.success(`연속 출석 위험 알림이 ${next ? '켜졌어요' : '꺼졌어요'}`);
  };

  return (
    <div>
      <p className="text-gray-400 text-sm font-bold mb-2 px-1">
        <span className="text-xl mr-1">🔔</span>알림
      </p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        <ToggleRow
          title="출근 리마인더"
          description="평일 오전 9시에 알림"
          enabled={workReminder}
          onChange={handleWorkReminder}
          divider
        />
        <ToggleRow
          title="연속 출석 위험 알림"
          description="오후 5시까지 미출석 시"
          enabled={streakWarning}
          onChange={handleStreakWarning}
        />
      </div>
    </div>
  );
}
