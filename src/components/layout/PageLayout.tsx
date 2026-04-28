import { TabBar } from './TabBar';

interface PageLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
}

export function PageLayout({ children, showTabBar = true }: PageLayoutProps) {
  return (
    <div
      className="h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-[#0A0A0A] text-white"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <main className={`flex-1 ${showTabBar ? 'pb-20' : ''}`}>{children}</main>
      {showTabBar && <TabBar />}
    </div>
  );
}
