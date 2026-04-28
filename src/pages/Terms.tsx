import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Terms() {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/terms-of-service.md')
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.text();
      })
      .then(setContent)
      .catch(() => setError(true));
  }, []);

  return (
    <PageLayout showTabBar={false}>
      <div className="px-4 py-5">
        <h1 className="text-white text-xl font-bold mb-3">이용약관</h1>
        {error && (
          <p className="text-red-400 text-sm">
            약관을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}
        {!error && content === null && (
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        )}
        {content && (
          <pre className="whitespace-pre-wrap break-words text-gray-300 text-xs leading-relaxed font-sans">
            {content}
          </pre>
        )}
      </div>
    </PageLayout>
  );
}
