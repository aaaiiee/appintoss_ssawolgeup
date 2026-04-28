import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountSettings() {
  const { logout } = useAuth();

  return (
    <div>
      <p className="text-gray-400 text-sm font-bold mb-2 px-1">
        <span className="text-xl mr-1">👤</span>계정
      </p>
      <div className="bg-[#111] rounded-xl overflow-hidden">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full px-4 py-3.5 flex justify-between items-center text-left">
              <span className="text-red-500 text-sm">로그아웃</span>
              <span className="text-gray-500 text-sm">›</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">로그아웃 할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                로그아웃해도 데이터는 유지되며 다시 로그인하면 이어서 사용할 수 있어요.
                <br />
                <br />
                <span className="text-gray-400">
                  토스 연동을 완전히 해제하려면 토스 앱 → 설정 → 연결된 서비스에서 진행해 주세요.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#333] text-white border-none">취소</AlertDialogCancel>
              <AlertDialogAction onClick={logout} className="bg-red-600 text-white">
                로그아웃
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
