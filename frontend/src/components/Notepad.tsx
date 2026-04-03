import { useCallback, useEffect, useRef, useState } from 'react';
import { Save, StickyNote } from 'lucide-react';
import { logEvent } from '../utils/eventLogger';

interface NotepadProps {
  examId?: string;
  initialContent?: string;
  userId?: string;
  onSave?: (content: string) => Promise<void> | void;
}

export default function Notepad({ examId, initialContent = '', userId, onSave }: NotepadProps) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // 실시간 저장 + 이벤트 로그
  useEffect(() => {
    const timer = setTimeout(() => {
      void onSave?.(content);
      logEvent('exam_notepad_typed', { content, examId }, userId);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, examId, userId, onSave]);

  const handleSave = useCallback(() => {
    void onSave?.(content);
    logEvent('exam_notepad_saved', { content_length: content.length, examId }, userId);
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1500);
  }, [content, examId, userId, onSave]);

  // cleanup timer on unmount
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  return (
    <div className="flex flex-col h-full bg-amber-50 border border-amber-200 rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-b border-amber-200">
        <StickyNote className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-800">메모장</span>
        <button
          onClick={handleSave}
          className={`ml-auto flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            saved
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
          }`}
        >
          <Save className="w-3 h-3" />
          {saved ? '저장됨!' : '저장'}
        </button>
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
