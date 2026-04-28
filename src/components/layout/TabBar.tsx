import { useLocation, useNavigate } from 'react-router-dom';
import { TAB_ITEMS } from '@/lib/constants';

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#222] flex justify-around py-2 z-50">
      {TAB_ITEMS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              isActive ? 'text-[#3182F6]' : 'text-[#666]'
            }`}
          >
            <span className="text-2xl leading-none">{tab.emoji}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
