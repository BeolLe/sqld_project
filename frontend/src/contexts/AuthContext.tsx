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
import { apiRequest } from '../utils/api';

interface AuthResult {
  message: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isInitializing: boolean;
  login: (email: string, password: string, autoLogin?: boolean) => Promise<AuthResult>;
  signup: (
    email: string,
    password: string,
    nickname?: string,
    termsAgreed?: boolean,
    privacyAgreed?: boolean,
    signupPurposeCode?: number | null,
    signupPurposeOther?: string
  ) => Promise<AuthResult>;
  completeSocialSignup: (
    socialSignupToken: string,
    nickname?: string,
    termsAgreed?: boolean,
    privacyAgreed?: boolean,
    signupPurposeCode?: number | null,
    signupPurposeOther?: string
  ) => Promise<AuthResult>;
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
  message: string;
}

interface RegisterResponse {
  message: string;
}

const PENDING_SOCIAL_SIGNUP_KEY = 'pendingSocialSignup';
const PENDING_ACCOUNT_DELETE_KEY = 'pendingAccountDelete';

interface MeResponse {
  user_id: string;
  email: string;
  nickname: string;
  points: number;
  is_admin?: boolean;
  isAdmin?: boolean;
  auth_provider?: 'local' | 'google';
}

function toUser(me: MeResponse): User {
  return {
    id: me.user_id,
    email: me.email,
    nickname: me.nickname,
    points: me.points ?? 0,
    isAdmin: me.is_admin ?? me.isAdmin ?? false,
    createdAt: new Date().toISOString(),
    authProvider: me.auth_provider ?? 'local',
  };
}

function clearAuthRedirectParams() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('auth_provider');
  currentUrl.searchParams.delete('auth_error');
  currentUrl.searchParams.delete('auth_success');
  currentUrl.searchParams.delete('social_signup_required');
  currentUrl.searchParams.delete('social_signup_token');
  currentUrl.searchParams.delete('account_delete_ready');
  currentUrl.searchParams.delete('account_delete_provider');
  currentUrl.searchParams.delete('account_delete_token');
  window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
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
  'terms agreement is required': '서비스 이용약관에 동의해주세요.',
  'privacy agreement is required': '개인정보 수집 및 이용에 동의해주세요.',
  'Password too short': '비밀번호가 너무 짧습니다.',
  'Invalid email format': '올바른 이메일 형식이 아닙니다.',
  'Unauthorized': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Token expired': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Internal server error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'deactivated account': '비활성화된 계정입니다.',
  'signup purpose code is invalid': '가입 목적 값이 올바르지 않습니다.',
  'signup purpose other is required': '기타 가입 목적을 입력해주세요.',
  'social signup token expired': '소셜 가입 세션이 만료되었습니다. 다시 시도해주세요.',
  'social signup token is invalid': '소셜 가입 정보를 확인하지 못했습니다. 다시 시도해주세요.',
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
  const response = await apiRequest(path, init);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
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

  const loadCurrentUser = useCallback(async () => {
    try {
      const me = await request<MeResponse>('/auth/me');
      return applyAuthenticatedUser(me);
    } catch (error) {
      logout();
      throw error;
    }
  }, [applyAuthenticatedUser, logout]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectAuthProvider = searchParams.get('auth_provider');
    const redirectAuthError = searchParams.get('auth_error');
    const redirectAuthSuccess = searchParams.get('auth_success');
    const socialSignupRequired = searchParams.get('social_signup_required');
    const socialSignupToken = searchParams.get('social_signup_token');
    const accountDeleteReady = searchParams.get('account_delete_ready');
    const accountDeleteProvider = searchParams.get('account_delete_provider');
    const accountDeleteToken = searchParams.get('account_delete_token');

    if (socialSignupRequired === '1' && socialSignupToken) {
      window.sessionStorage.setItem(
        PENDING_SOCIAL_SIGNUP_KEY,
        JSON.stringify({
          provider: redirectAuthProvider ?? 'google',
          token: socialSignupToken,
        })
      );
    }

    if (accountDeleteReady === '1' && accountDeleteToken) {
      window.sessionStorage.setItem(
        PENDING_ACCOUNT_DELETE_KEY,
        JSON.stringify({
          provider: accountDeleteProvider ?? 'google',
          token: accountDeleteToken,
        })
      );
    }

    if (
      redirectAuthError ||
      redirectAuthProvider ||
      redirectAuthSuccess ||
      socialSignupRequired ||
      socialSignupToken ||
      accountDeleteReady ||
      accountDeleteProvider ||
      accountDeleteToken
    ) {
      clearAuthRedirectParams();
    }

    if (redirectAuthError) {
      window.alert(redirectAuthError);
    }

    loadCurrentUser()
      .then((me) => {
        if (redirectAuthSuccess) {
          logEvent(
            'common_login_succeeded',
            { email: me.email, provider: redirectAuthProvider ?? 'social' },
            me.id
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        setIsInitializing(false);
      });
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string, autoLogin = false) => {
    await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, auto_login: autoLogin }),
    });

    const me = await loadCurrentUser();
    logEvent('common_login_succeeded', { email: me.email }, me.id);

    return { message: '로그인에 성공했습니다.' };
  }, [loadCurrentUser]);

  const signup = useCallback(async (
    email: string,
    password: string,
    nickname?: string,
    termsAgreed = false,
    privacyAgreed = false,
    signupPurposeCode: number | null = null,
    signupPurposeOther = ''
  ) => {
    const resolvedNickname = nickname?.trim() || email.split('@')[0];
    const normalizedSignupPurposeOther = signupPurposeCode === 4 ? signupPurposeOther.trim() : '';
    const response = await request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        nickname: resolvedNickname,
        password,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        signup_purpose_code: signupPurposeCode,
        signup_purpose_other: normalizedSignupPurposeOther || null,
      }),
    });

    logEvent(
      'common_signup_succeeded',
      { email, nickname: resolvedNickname, signupPurposeCode },
      email
    );
    logEvent('system_first_visit', { email }, email);

    return {
      message:
        response.message === 'user created'
          ? '회원가입이 완료되었습니다. 이제 로그인할 수 있습니다.'
          : response.message,
    };
  }, []);

  const completeSocialSignup = useCallback(async (
    socialSignupToken: string,
    nickname?: string,
    termsAgreed = false,
    privacyAgreed = false,
    signupPurposeCode: number | null = null,
    signupPurposeOther = ''
  ) => {
    const response = await request<RegisterResponse>('/auth/social/register', {
      method: 'POST',
      body: JSON.stringify({
        social_signup_token: socialSignupToken,
        nickname: nickname?.trim() || null,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        signup_purpose_code: signupPurposeCode,
        signup_purpose_other: signupPurposeCode === 4 ? signupPurposeOther.trim() || null : null,
      }),
    });

    window.sessionStorage.removeItem(PENDING_SOCIAL_SIGNUP_KEY);
    const me = await loadCurrentUser();
    logEvent(
      'common_signup_succeeded',
      { email: me.email, nickname: me.nickname, provider: 'google', signupPurposeCode },
      me.id
    );
    logEvent('system_first_visit', { email: me.email, provider: 'google' }, me.id);

    return {
      message:
        response.message === 'social signup completed'
          ? '구글 계정 가입이 완료되었습니다.'
          : response.message,
    };
  }, [loadCurrentUser]);

  const logoutWithServer = useCallback(async () => {
    try {
      await request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // 서버 로그아웃 실패 시에도 로컬 상태는 즉시 비웁니다.
    } finally {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isInitializing,
        login,
        signup,
        completeSocialSignup,
        logout: logoutWithServer,
        updatePoints,
        updateNickname,
      }}
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
