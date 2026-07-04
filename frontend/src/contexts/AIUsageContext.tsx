import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { fetchAIUsage } from '../api/ai';
import { useAuth } from './AuthContext';
import type { AIUsageResponse } from '../types';

interface AIUsageContextValue {
  usage: AIUsageResponse | null;
  loading: boolean;
  refreshUsage: () => Promise<void>;
  applyUsage: (u: { input: number; output: number }) => void;
}

const AIUsageContext = createContext<AIUsageContextValue | null>(null);

export function AIUsageProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [usage, setUsage] = useState<AIUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshUsage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAIUsage();
      setUsage(data);
    } catch {
      // 오류 시 usage를 null로 유지
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인 상태가 되면 사용량 조회
  useEffect(() => {
    if (isLoggedIn) {
      void refreshUsage();
    } else {
      setUsage(null);
    }
  }, [isLoggedIn, refreshUsage]);

  const applyUsage = useCallback((_u: { input: number; output: number }) => {
    setUsage((prev) => {
      if (!prev) return prev;
      const remaining = Math.max(0, prev.explain.remaining - 1);
      return {
        ...prev,
        explain: {
          ...prev.explain,
          used: prev.explain.used + 1,
          remaining,
        },
      };
    });
  }, []);

  return (
    <AIUsageContext.Provider value={{ usage, loading, refreshUsage, applyUsage }}>
      {children}
    </AIUsageContext.Provider>
  );
}

export function useAIUsage(): AIUsageContextValue {
  const ctx = useContext(AIUsageContext);
  if (!ctx) throw new Error('useAIUsage must be used within AIUsageProvider');
  return ctx;
}
