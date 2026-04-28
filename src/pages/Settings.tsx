import { PageLayout } from '@/components/layout/PageLayout';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { WageSettings } from '@/components/settings/WageSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { BannerAdWrapper } from '@/components/BannerAdWrapper';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/authStore';
import { BRAND } from '@/lib/constants';
import { getBannerAdGroupId } from '@/lib/adConstants';

export default function Settings() {
  const { user, isLoading } = useUser();
  const { profileEmoji, setProfileEmoji } = useAuthStore();

  if (isLoading || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          로딩 중...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <h2 className="text-white font-bold text-xl">설정</h2>
        <ProfileSection user={user} emoji={profileEmoji} onEmojiChange={setProfileEmoji} />
        <WageSettings />
        <NotificationSettings />
        <BannerAdWrapper adGroupId={getBannerAdGroupId('list')} mode="inline" />
        <AccountSettings />
        <p className="text-center text-gray-600 text-xs mt-2 leading-relaxed">
          {BRAND.name} v1.0.0
          <br />
          문의: aaaiiee2@gmail.com
        </p>
      </div>
    </PageLayout>
  );
}
