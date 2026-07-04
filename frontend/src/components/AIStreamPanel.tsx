import { Sparkles, RotateCcw } from 'lucide-react';
import type { AIStreamStatus } from '../hooks/useAIStream';

interface AIStreamPanelProps {
  status: AIStreamStatus;
  text: string;
  error: string | null;
  onRetry: () => void;
}

export default function AIStreamPanel({ status, text, error, onRetry }: AIStreamPanelProps) {
  return (
    <div className="mt-3 rounded-xl border border-primary-200 bg-primary-50/40 px-4 py-3 max-h-64 overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary-500 shrink-0" />
        <span className="text-xs font-semibold text-primary-700">AI 맞춤 해설</span>
      </div>

      {/* 본문 */}
      {status === 'streaming' && !text && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          생성 중
          <span className="inline-flex gap-0.5">
            <span className="animate-bounce delay-0">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>
        </p>
      )}

      {(status === 'streaming' || status === 'done') && text && (
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {text}
          {status === 'streaming' && (
            <span className="inline-block w-0.5 h-3.5 bg-primary-500 ml-0.5 animate-pulse align-text-bottom">
              ▍
            </span>
          )}
        </p>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2">
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button
            onClick={onRetry}
            className="shrink-0 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            재시도
          </button>
        </div>
      )}
    </div>
  );
}
