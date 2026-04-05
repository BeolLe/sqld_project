import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { logEvent, setAmplitudeUserId, resetAmplitudeUserId } from '../utils/eventLogger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'solsqld_access_token';

interface AuthResult {
  message: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, nickname?: string, termsAgreed?: boolean, privacyAgreed?: boolean) => Promise<AuthResult>;
  logout: () => void;
  updatePoints: (points: number) => void;
  updateNickname: (nickname: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ApiErrorPayload {
  detail?: string;
  message?: string;
}

interface LoginResponse {
  access_token: string;
}

interface RegisterResponse {
  message: string;
}

interface MeResponse {
  user_id: string;
  email: string;
  nickname: string;
  points: number;
}

function toUser(me: MeResponse): User {
  return {
    id: me.user_id,
    email: me.email,
    nickname: me.nickname,
    points: me.points ?? 0,
    createdAt: new Date().toISOString(),
  };
}

function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function storeAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const ERROR_MESSAGE_MAP: Record<string, string> = {
  'Email already registered': '이미 가입된 이메일입니다.',
  'email already registered': '이미 가입된 이메일입니다.',
  'Invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'User not found': '등록되지 않은 사용자입니다.',
  'user not found': '등록되지 않은 사용자입니다.',
  'Invalid email or password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Terms must be agreed': '서비스 이용약관에 동의해주세요.',
  'Privacy policy must be agreed': '개인정보 수집 및 이용에 동의해주세요.',
  'Password too short': '비밀번호가 너무 짧습니다.',
  'Invalid email format': '올바른 이메일 형식이 아닙니다.',
  'Unauthorized': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Token expired': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Internal server error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'deactivated account': '비활성화된 계정입니다.',
};

function translateErrorMessage(message: string): string {
  return ERROR_MESSAGE_MAP[message] ?? message;
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    const raw = payload.detail || payload.message || '요청 처리 중 오류가 발생했습니다.';
    return translateErrorMessage(raw);
  } catch {
    return '요청 처리 중 오류가 발생했습니다.';
  }
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    setUser(null);
    resetAmplitudeUserId();
  }, []);

  const updatePoints = useCallback((points: number) => {
    setUser((previousUser) =>
      previousUser
        ? {
            ...previousUser,
            points,
          }
        : previousUser
    );
  }, []);

  const updateNickname = useCallback((nickname: string) => {
    setUser((previousUser) =>
      previousUser
        ? {
            ...previousUser,
            nickname,
          }
        : previousUser
    );
  }, []);

  const applyAuthenticatedUser = useCallback((me: MeResponse) => {
    const nextUser = toUser(me);
    setUser(nextUser);
    setAmplitudeUserId(nextUser.id);
    return nextUser;
  }, []);

  const loadCurrentUser = useCallback(
    async (token: string) => {
      try {
        const me = await request<MeResponse>('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return applyAuthenticatedUser(me);
      } catch (error) {
        logout();
        throw error;
      }
    },
    [applyAuthenticatedUser, logout]
  );

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setIsInitializing(false);
      return;
    }

    loadCurrentUser(token)
      .catch(() => undefined)
      .finally(() => {
        setIsInitializing(false);
      });
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token: accessToken } = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    storeAccessToken(accessToken);
    const me = await loadCurrentUser(accessToken);
    logEvent('common_login_succeeded', { email: me.email }, me.id);

    return { message: '로그인에 성공했습니다.' };
  }, [loadCurrentUser]);

  const signup = useCallback(async (email: string, password: string, nickname?: string, termsAgreed = false, privacyAgreed = false) => {
    const resolvedNickname = nickname?.trim() || email.split('@')[0];
    const response = await request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        nickname: resolvedNickname,
        password,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
      }),
    });

    logEvent('common_signup_succeeded', { email, nickname: resolvedNickname }, email);
    logEvent('system_first_visit', { email }, email);

    return {
      message:
        response.message === 'user created'
          ? '회원가입이 완료되었습니다. 이제 로그인할 수 있습니다.'
          : response.message,
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isInitializing, login, signup, logout, updatePoints, updateNickname }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
