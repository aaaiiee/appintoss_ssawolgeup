interface Props {
  poopCoins: number;
  tossPoints?: number;
}

export function AssetSummary({ poopCoins, tossPoints = 0 }: Props) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 bg-[#1a1a2e] rounded-xl p-3 text-center">
        <p className="text-yellow-400 font-bold text-xl">
          {poopCoins.toLocaleString()} <span className="text-2xl">🪙</span>
        </p>
        <p className="text-gray-500 text-xs">똥코인</p>
      </div>
      <div className="flex-1 bg-[#1a1a2e] rounded-xl p-3 text-center">
        <p className="text-[#3182F6] font-bold text-xl">{tossPoints.toLocaleString()} P</p>
        <p className="text-gray-500 text-xs">토스포인트</p>
      </div>
    </div>
  );
}
