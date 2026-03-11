import { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';
import { logEvent } from '../utils/eventLogger';

const STORAGE_KEY = 'solsqld_notepad';

interface NotepadProps {
  examSessionId?: string;
  userId?: string;
}

export default function Notepad({ examSessionId, userId }: NotepadProps) {
  const storageKey = examSessionId ? `${STORAGE_KEY}_${examSessionId}` : STORAGE_KEY;
  const [content, setContent] = useState(() => localStorage.getItem(storageKey) ?? '');

  // 실시간 저장 + 이벤트 로그
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, content);
      logEvent('notepad_update', { content, examSessionId }, userId);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, storageKey, examSessionId, userId]);

  return (
    <div className="flex flex-col h-full bg-amber-50 border border-amber-200 rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-b border-amber-200">
        <StickyNote className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-800">메모장</span>
        <span className="ml-auto text-xs text-amber-500">{content.length}자</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="시험 중 메모가 필요하신가요?&#10;여기에 자유롭게 입력하세요."
        className="flex-1 resize-none bg-transparent p-3 text-sm text-slate-700 placeholder:text-amber-300 focus:outline-none leading-relaxed font-mono"
      />
    </div>
  );
}
