import { useState } from 'react';
import { SHOP_ITEMS, useShopStore, type ShopItem } from '@/stores/shopStore';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

type Category = 'title' | 'skin' | 'boost';
const CATEGORY_LABELS: Record<Category, string> = {
  title: '칭호',
  skin: '똥스킨',
  boost: '부스트',
};

function ShopItemCard({ item, owned, active, onBuy, onEquip }: {
  item: ShopItem;
  owned: boolean;
  active: boolean;
  onBuy: () => void;
  onEquip: () => void;
}) {
  return (
    <div className={`bg-[#111] rounded-xl p-3 flex justify-between items-center ${active ? 'border border-[#FF6B35]' : ''}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-3xl leading-none">{item.emoji}</span>
        <div>
          <p className="text-white text-sm font-bold">{item.name}</p>
          <p className="text-gray-500 text-xs">{item.description}</p>
        </div>
      </div>
      {owned ? (
        item.category === 'boost' ? (
          <span className="text-green-400 text-xs font-bold px-3 py-1.5">보유 중</span>
        ) : active ? (
          <span className="text-[#FF6B35] text-xs font-bold px-3 py-1.5">장착 중</span>
        ) : (
          <button onClick={onEquip} className="bg-[#222] text-white text-xs font-bold px-3 py-1.5 rounded-lg active:bg-[#333]">
            장착
          </button>
        )
      ) : (
        <button onClick={onBuy} className="bg-[#FF6B35] text-white text-xs font-bold px-3 py-1.5 rounded-lg active:opacity-80">
          {item.price} 🪙
        </button>
      )}
    </div>
  );
}

export function CoinShop() {
  const [category, setCategory] = useState<Category>('title');
  const { user, refetch } = useUser();
  const { purchasedIds, activeTitle, activeSkin, purchase, setActiveTitle, setActiveSkin } = useShopStore();

  if (!user) return null;

  const items = SHOP_ITEMS.filter((i) => i.category === category);

  const handleBuy = (item: ShopItem) => {
    if (user.poop_coins < item.price) {
      toast.error(`코인이 부족합니다 (보유: ${user.poop_coins}, 필요: ${item.price})`);
      return;
    }
    purchase(item.id);
    // Deduct coins via mock
    import('@/lib/api').then(({ api }) => {
      api.patch('/api/user/me', { poop_coins: user.poop_coins - item.price }).then(() => refetch());
    });
    toast.success(`${item.emoji} ${item.name} 구매 완료!`);

    // Auto-equip if first of category
    if (item.category === 'title' && !activeTitle) setActiveTitle(item.id);
    if (item.category === 'skin') setActiveSkin(item.id);
  };

  const handleEquip = (item: ShopItem) => {
    if (item.category === 'title') {
      setActiveTitle(item.id);
      toast.success(`${item.emoji} ${item.name} 칭호 장착!`);
    }
    if (item.category === 'skin') {
      setActiveSkin(item.id);
      toast.success(`${item.emoji} ${item.name} 스킨 적용!`);
    }
  };

  return (
    <div>
      <p className="text-white text-base font-bold mb-2">
        <span className="text-xl mr-1">🛒</span>똥코인 상점
      </p>

      <div className="flex gap-1.5 mb-3">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              c === category ? 'bg-[#FF6B35] text-white' : 'bg-[#222] text-gray-500'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            owned={purchasedIds.includes(item.id)}
            active={
              (item.category === 'title' && activeTitle === item.id) ||
              (item.category === 'skin' && activeSkin === item.id)
            }
            onBuy={() => handleBuy(item)}
            onEquip={() => handleEquip(item)}
          />
        ))}
      </div>
    </div>
  );
}
