import { useState, useRef, useCallback, useEffect } from 'react';
import { streamAIExplain } from '../api/ai';
import type { AIExplainRequest } from '../types';

export type AIStreamStatus = 'idle' | 'streaming' | 'done' | 'error';

interface AIStreamState {
  status: AIStreamStatus;
  text: string;
  usage: { input: number; output: number } | null;
  error: string | null;
}

interface UseAIStreamReturn extends AIStreamState {
  start: (body: AIExplainRequest) => void;
  abort: () => void;
  retry: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [status, setStatus] = useState<AIStreamStatus>('idle');
  const [text, setText] = useState('');
  const [usage, setUsage] = useState<{ input: number; output: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const lastBodyRef = useRef<AIExplainRequest | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const start = useCallback((body: AIExplainRequest) => {
    // 진행 중인 스트림이 있으면 중단
    controllerRef.current?.abort();

    // 상태 초기화
    setText('');
    setError(null);
    setUsage(null);
    setStatus('streaming');

    lastBodyRef.current = body;

    const controller = new AbortController();
    controllerRef.current = controller;

    void streamAIExplain(
      body,
      {
        onToken: (t) => setText((prev) => prev + t),
        onDone: (u) => {
          setUsage(u);
          setStatus('done');
        },
        onError: (m) => {
          setError(m);
          setStatus('error');
        },
      },
      controller.signal,
    );
  }, []);

  const retry = useCallback(() => {
    const body = lastBodyRef.current;
    if (body) {
      start(body);
    }
  }, [start]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { status, text, usage, error, start, abort, retry };
}
