import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ChevronDown, Send, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type {
  FeedbackTicket,
  FeedbackType,
  FeedbackStatus,
  AdminFeedbackTab,
  AdminFeedbackListResponse,
} from '../types';

const TAB_CONFIG: { key: AdminFeedbackTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'service', label: '서비스' },
  { key: 'sql', label: 'SQL' },
  { key: 'exam', label: '모의고사' },
];

const TYPE_LABELS: Record<FeedbackType, string> = {
  suggestion: '서비스 건의',
  bug: '버그 제보',
  exam_error: '모의고사 오류',
  sql_error: 'SQL 오류',
};

const STATUS_OPTIONS: { value: FeedbackStatus; label: string; className: string }[] = [
  { value: 'pending', label: '접수됨', className: 'bg-slate-100 text-slate-600' },
  { value: 'reviewing', label: '확인 중', className: 'bg-amber-100 text-amber-700' },
  { value: 'resolved', label: '처리 완료', className: 'bg-emerald-100 text-emerald-700' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStatusInfo(status: FeedbackStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

const PAGE_SIZE = 20;

export default function AdminFeedbackPage() {
  const [tab, setTab] = useState<AdminFeedbackTab>('all');
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 상세 패널
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 상태 변경
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // 답변 작성
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<AdminFeedbackListResponse>(
        `/admin/feedback?tab=${tab}&page=${page}&size=${PAGE_SIZE}`
      );
      setTickets(res.items);
      setTotal(res.total);
    } catch {
      setError('피드백 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function handleTabChange(newTab: AdminFeedbackTab) {
    setTab(newTab);
    setPage(1);
    setExpandedId(null);
  }

  async function handleStatusChange(ticketId: string, newStatus: FeedbackStatus) {
    setStatusLoading(ticketId);
    try {
      await apiFetch(`/admin/feedback/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTickets((prev) =>
        prev.map((t) => (t.ticket_id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch {
      // 조용히 실패 — UI에서 상태가 안 바뀜
    } finally {
      setStatusLoading(null);
    }
  }

  async function handleReplySubmit(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;

    setReplyLoading(ticketId);
    setReplyMessage((prev) => ({ ...prev, [ticketId]: undefined! }));
    try {
      await apiFetch(`/admin/feedback/${ticketId}/reply`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_reply: text }),
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId
            ? { ...t, admin_reply: text, replied_at: new Date().toISOString() }
            : t
        )
      );
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
      setReplyMessage((prev) => ({
        ...prev,
        [ticketId]: { type: 'success', text: '답변이 저장되었습니다.' },
      }));
    } catch {
      setReplyMessage((prev) => ({
        ...prev,
        [ticketId]: { type: 'error', text: '답변 저장에 실패했습니다.' },
      }));
    } finally {
      setReplyLoading(null);
    }
  }

  function handleExpand(ticketId: string) {
    const isExpanding = expandedId !== ticketId;
    setExpandedId(isExpanding ? ticketId : null);
    if (isExpanding) {
      const ticket = tickets.find((t) => t.ticket_id === ticketId);
      if (ticket?.admin_reply && !replyText[ticketId]) {
        setReplyText((prev) => ({ ...prev, [ticketId]: ticket.admin_reply ?? '' }));
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* 탭 */}
      <div className="flex gap-2">
        {TAB_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">피드백이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket.status);
            const isExpanded = expandedId === ticket.ticket_id;
            const msg = replyMessage[ticket.ticket_id];

            return (
              <div
                key={ticket.ticket_id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* 행 헤더 */}
                <button
                  onClick={() => handleExpand(ticket.ticket_id)}
                  className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {TYPE_LABELS[ticket.type]}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {ticket.title}
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:block">
                    {ticket.user_nickname ?? '알 수 없음'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(ticket.created_at)}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* 상세 패널 */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>작성자: {ticket.user_nickname ?? '-'} ({ticket.user_email ?? '-'})</span>
                      {ticket.related_exam_id && (
                        <span>관련 시험: {ticket.related_exam_id}</span>
                      )}
                      {ticket.related_problem_no != null && (
                        <span>문제 번호: {ticket.related_problem_no}</span>
                      )}
                    </div>

                    {/* 본문 */}
                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                      <p className="text-sm text-slate-700 whitespace-pre-line">{ticket.content}</p>
                    </div>

                    {/* 상태 변경 */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-700">상태 변경:</label>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.ticket_id, e.target.value as FeedbackStatus)}
                        disabled={statusLoading === ticket.ticket_id}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {statusLoading === ticket.ticket_id && (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      )}
                    </div>

                    {/* 답변 작성/수정 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        {ticket.admin_reply ? '답변 수정' : '답변 작성'}
                      </label>
                      <textarea
                        value={replyText[ticket.ticket_id] ?? ticket.admin_reply ?? ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [ticket.ticket_id]: e.target.value }))
                        }
                        rows={3}
                        placeholder="유저에게 전달할 답변을 작성하세요."
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleReplySubmit(ticket.ticket_id)}
                          disabled={replyLoading === ticket.ticket_id}
                          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          {replyLoading === ticket.ticket_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          저장
                        </button>
                        {msg && (
                          <span
                            className={`text-sm ${
                              msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {msg.text}
                          </span>
                        )}
                      </div>
                      {ticket.replied_at && (
                        <p className="text-xs text-slate-400">
                          마지막 답변: {formatDate(ticket.replied_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
