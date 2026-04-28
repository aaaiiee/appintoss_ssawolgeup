import { create } from 'zustand';

interface AuthState {
  jwt: string | null;
  isLoggedIn: boolean;
  profileEmoji: string;
  setJwt: (jwt: string) => void;
  clearAuth: () => void;
  setProfileEmoji: (emoji: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  jwt: null,
  isLoggedIn: false,
  profileEmoji: '💩',
  setJwt: (jwt) => set({ jwt, isLoggedIn: true }),
  clearAuth: () => set({ jwt: null, isLoggedIn: false }),
  setProfileEmoji: (emoji) => set({ profileEmoji: emoji }),
}));
