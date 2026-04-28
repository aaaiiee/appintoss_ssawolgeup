import { useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@/hooks/useUser';
import { useUser } from '@/hooks/useUser';

const EMOJI_OPTIONS = ['💩', '🧑‍💼', '👩‍💻', '🦸', '🐻', '🐶', '🐱', '🦊', '🐸', '🎃', '👻', '🤖'];

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;

interface Props {
  user: User;
  emoji?: string;
  onEmojiChange?: (emoji: string) => void;
}

export function ProfileSection({ user, emoji = '💩', onEmojiChange }: Props) {
  const { updateUser, isUpdating } = useUser();
  const [showPicker, setShowPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftNickname, setDraftNickname] = useState(user.nickname);

  const handleStartEdit = () => {
    setDraftNickname(user.nickname);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftNickname(user.nickname);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = draftNickname.trim();
    if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
      toast.error(`별명은 ${NICKNAME_MIN}~${NICKNAME_MAX}자여야 해요`);
      return;
    }
    if (trimmed === user.nickname) {
      setIsEditing(false);
      return;
    }
    try {
      await updateUser({ nickname: trimmed });
      toast.success('별명이 변경됐어요');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '변경에 실패했어요');
    }
  };

  return (
    <div className="bg-[#111] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center text-4xl active:scale-95 transition-transform shrink-0"
          aria-label="이모지 변경"
        >
          {emoji}
        </button>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={draftNickname}
                onChange={(e) => setDraftNickname(e.target.value)}
                maxLength={NICKNAME_MAX}
                autoFocus
                className="flex-1 bg-[#1a1a2e] text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#3182F6]"
                placeholder="별명 입력"
              />
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-[#3182F6] text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                {isUpdating ? '저장 중' : '저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="bg-[#222] text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-white font-bold truncate">{user.nickname}</p>
              <button
                onClick={handleStartEdit}
                className="text-[#3182F6] text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#1a1a2e]"
                aria-label="별명 변경"
              >
                수정
              </button>
            </div>
          )}
          <p className="text-gray-500 text-xs mt-0.5">
            토스 계정 연동됨 · 이모지 탭하여 변경
          </p>
        </div>
      </div>

      {showPicker && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onEmojiChange?.(e);
                setShowPicker(false);
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                ${e === emoji ? 'bg-[#3182F6]' : 'bg-[#1a1a1a] active:bg-[#222]'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
