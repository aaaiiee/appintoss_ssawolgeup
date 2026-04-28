import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { tossLogin } from '@/lib/sdk';
import { api } from '@/lib/api';

export function useAuth() {
  const { jwt, isLoggedIn, setJwt, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async () => {
    const tossResult = await tossLogin();
    if (!tossResult) {
      throw new Error('로그인이 취소되었습니다');
    }

    // Dev mock: skip API call when using mock authorizationCode (no backend running)
    if (tossResult.authorizationCode === 'mock-authorization-code') {
      setJwt('mock-jwt-token');
      navigate('/home');
      return;
    }

    const { jwt: appJwt } = await api.post<{ jwt: string }>('/api/auth/login', {
      authorizationCode: tossResult.authorizationCode,
      referrer: tossResult.referrer,
    });

    setJwt(appJwt);
    navigate('/home');
  }, [setJwt, navigate]);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  return { jwt, isLoggedIn, login, logout };
}
