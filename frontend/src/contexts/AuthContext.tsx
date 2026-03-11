import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { logEvent } from '../utils/eventLogger';

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: 실제 API 호출로 교체
    const mockUser: User = {
      id: crypto.randomUUID(),
      email,
      nickname: email.split('@')[0],
      points: 0,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    logEvent('user_login', { email }, mockUser.id);
  }, []);

  const signup = useCallback(async (email: string, _password: string, nickname?: string) => {
    // 닉네임 미입력 시 이메일 @ 앞부분 자동 설정
    const resolvedNickname = nickname?.trim() || email.split('@')[0];
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      nickname: resolvedNickname,
      points: 0,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    logEvent('user_signup', { email, nickname: resolvedNickname }, newUser.id);
    logEvent('user_first_visit', { email }, newUser.id);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
