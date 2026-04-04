import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Inbox, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import type { FeedbackTicket, FeedbackType, FeedbackStatus } from '../types';

const TYPE_LABELS: Record<FeedbackType, string> = {
  suggestion: '서비스 건의',
  bug: '버그 제보',
  exam_error: '모의고사 문제 오류',
  sql_error: 'SQL 실습 문제 오류',
};

const STATUS_LABELS: Record<FeedbackStatus, { text: string; className: string }> = {
  pending: { text: '접수됨', className: 'bg-slate-100 text-slate-600' },
  reviewing: { text: '확인 중', className: 'bg-amber-100 text-amber-700' },
  resolved: { text: '처리 완료', className: 'bg-emerald-100 text-emerald-700' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useAuth();

  // 탭
  const [tab, setTab] = useState<'write' | 'list'>('write');

  // 작성 폼
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug'>('suggestion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 내 피드백 목록
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 비로그인 리다이렉트
  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isInitializing, isLoggedIn, navigate]);

  // 내 피드백 로드
  useEffect(() => {
    if (tab !== 'list' || !isLoggedIn) return;

    let cancelled = false;
    setListLoading(true);
    setListError('');

    apiFetch<{ total: number; items: FeedbackTicket[] }>('/api/feedback')
      .then((res) => {
        if (!cancelled) setTickets(res.items);
      })
      .catch(() => {
        if (!cancelled) setListError('피드백 API가 아직 준비되지 않았습니다.');
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => { cancelled = true; };
  }, [tab, isLoggedIn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);

    if (!title.trim()) {
      setSubmitMessage({ type: 'error', text: '제목을 입력해주세요.' });
      return;
    }
    if (!content.trim()) {
      setSubmitMessage({ type: 'error', text: '내용을 입력해주세요.' });
      return;
    }

    try {
      setSubmitLoading(true);
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          type: feedbackType,
          title: title.trim(),
          content: content.trim(),
        }),
      });
      setTitle('');
      setContent('');
      setSubmitMessage({ type: 'success', text: '피드백이 접수되었습니다. 내 피드백에서 처리 상태를 확인할 수 있습니다.' });
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : '제출에 실패했습니다.' });
    } finally {
      setSubmitLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-sqld-navy">피드백</h1>
          <p className="text-sm text-slate-500 mt-1">서비스 개선 의견이나 문제 오류를 알려주세요.</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('write')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'write'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            피드백 작성
          </button>
          <button
            onClick={() => setTab('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            내 피드백
          </button>
        </div>

        {/* 피드백 작성 탭 */}
        {tab === 'write' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">유형</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={feedbackType === 'suggestion'}
                      onChange={() => setFeedbackType('suggestion')}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">서비스 건의</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={feedbackType === 'bug'}
                      onChange={() => setFeedbackType('bug')}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">버그 제보</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="간단한 제목을 입력해주세요."
                  maxLength={200}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="자세한 내용을 적어주세요."
                  rows={6}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {submitMessage && (
                <p className={`text-sm px-4 py-2 rounded-lg ${
                  submitMessage.type === 'success'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-red-600 bg-red-50'
                }`}>
                  {submitMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                {submitLoading ? '제출 중...' : '제출하기'}
              </button>
            </form>
          </div>
        )}

        {/* 내 피드백 탭 */}
        {tab === 'list' && (
          <div className="space-y-3">
            {listLoading && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">로딩 중...</p>
              </div>
            )}

            {listError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
                {listError}
              </div>
            )}

            {!listLoading && !listError && tickets.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">제출한 피드백이 없습니다.</p>
              </div>
            )}

            {tickets.map((ticket) => {
              const statusInfo = STATUS_LABELS[ticket.status];
              const isExpanded = expandedId === ticket.ticket_id;

              return (
                <div
                  key={ticket.ticket_id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ticket.ticket_id)}
                    className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {TYPE_LABELS[ticket.type]}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                      {ticket.title}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(ticket.created_at)}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 mt-3 whitespace-pre-line">{ticket.content}</p>

                      {ticket.admin_reply && (
                        <div className="mt-4 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3">
                          <p className="text-xs font-medium text-primary-700 mb-1">
                            운영자 답변 {ticket.replied_at ? `(${formatDate(ticket.replied_at)})` : ''}
                          </p>
                          <p className="text-sm text-slate-700 whitespace-pre-line">{ticket.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
