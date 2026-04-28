import { create } from 'zustand';

export interface ShopItem {
  id: string;
  category: 'title' | 'skin' | 'boost';
  name: string;
  emoji: string;
  description: string;
  price: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  // 칭호
  { id: 'title_poop_rich', category: 'title', name: '똥부자', emoji: '💰', description: '닉네임 옆에 표시', price: 100 },
  { id: 'title_toilet_master', category: 'title', name: '화장실마스터', emoji: '🚽', description: '닉네임 옆에 표시', price: 200 },
  { id: 'title_salary_thief', category: 'title', name: '월급루팡', emoji: '🦹', description: '닉네임 옆에 표시', price: 300 },
  { id: 'title_legend', category: 'title', name: '전설의 똥싸개', emoji: '👑', description: '닉네임 옆에 표시', price: 500 },
  // 똥스킨
  { id: 'skin_diamond', category: 'skin', name: '다이아몬드 똥', emoji: '💎', description: '체크인 버튼 이모지 변경', price: 300 },
  { id: 'skin_rainbow', category: 'skin', name: '무지개 똥', emoji: '🌈', description: '체크인 버튼 이모지 변경', price: 300 },
  { id: 'skin_fire', category: 'skin', name: '불꽃 똥', emoji: '🔥', description: '체크인 버튼 이모지 변경', price: 300 },
  { id: 'skin_gold', category: 'skin', name: '황금 똥', emoji: '✨', description: '체크인 버튼 이모지 변경', price: 500 },
  // 부스트
  { id: 'boost_streak_insurance', category: 'boost', name: '연속 출석 보험', emoji: '🛡️', description: '하루 빠져도 연속 출석 유지 (1회)', price: 1000 },
  { id: 'boost_double_coin', category: 'boost', name: '더블 코인', emoji: '⚡', description: '다음 체크인 코인 2배', price: 500 },
  { id: 'boost_ranking_highlight', category: 'boost', name: '랭킹 하이라이트', emoji: '✨', description: '내 닉네임 반짝이 효과 (24시간)', price: 300 },
];

interface ShopState {
  purchasedIds: string[];
  activeTitle: string | null;
  activeSkin: string;
  activeBoosts: string[];
  purchase: (itemId: string) => void;
  setActiveTitle: (itemId: string | null) => void;
  setActiveSkin: (itemId: string) => void;
  hasPurchased: (itemId: string) => boolean;
}

export const useShopStore = create<ShopState>((set, get) => ({
  purchasedIds: [],
  activeTitle: null,
  activeSkin: 'default',
  activeBoosts: [],
  purchase: (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    set((s) => ({
      purchasedIds: [...s.purchasedIds, itemId],
      ...(item.category === 'boost' ? { activeBoosts: [...s.activeBoosts, itemId] } : {}),
    }));
  },
  setActiveTitle: (itemId) => set({ activeTitle: itemId }),
  setActiveSkin: (itemId) => set({ activeSkin: itemId }),
  hasPurchased: (itemId) => get().purchasedIds.includes(itemId),
}));
