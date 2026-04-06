import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { AdminUserItem, AdminUserListResponse } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 권한 변경 확인 모달
  const [confirmTarget, setConfirmTarget] = useState<AdminUserItem | null>(null);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);

      const res = await apiFetch<AdminUserListResponse>(`/api/admin/users?${params}`);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      setError('유저 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleRoleToggleClick(user: AdminUserItem) {
    setConfirmTarget(user);
  }

  async function handleRoleConfirm() {
    if (!confirmTarget) return;

    const newIsAdmin = !confirmTarget.is_admin;
    setRoleLoading(confirmTarget.user_id);
    setConfirmTarget(null);

    try {
      await apiFetch(`/api/admin/users/${confirmTarget.user_id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ is_admin: newIsAdmin }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === confirmTarget.user_id ? { ...u, is_admin: newIsAdmin } : u
        )
      );
    } catch {
      // 실패 시 상태 안 바뀜
    } finally {
      setRoleLoading(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="이메일 또는 닉네임으로 검색"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          검색
        </button>
      </form>

      {/* 에러 */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 테이블 */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {search ? '검색 결과가 없습니다.' : '유저가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">닉네임</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">이메일</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">가입일</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-600">포인트</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-600">역할</th>
                  <th className="text-center px-5 py-3 font-medium text-slate-600">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">{u.nickname}</td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{u.points}pt</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                          u.is_admin
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.is_admin ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleRoleToggleClick(u)}
                        disabled={roleLoading === u.user_id}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          u.is_admin
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'border border-primary-200 text-primary-600 hover:bg-primary-50'
                        } disabled:opacity-40`}
                      >
                        {roleLoading === u.user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.is_admin ? (
                          <ShieldOff className="w-3.5 h-3.5" />
                        ) : (
                          <Shield className="w-3.5 h-3.5" />
                        )}
                        {u.is_admin ? '해제' : '승격'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* 권한 변경 확인 모달 */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-sqld-navy mb-3">
              {confirmTarget.is_admin ? '관리자 해제' : '관리자 승격'}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              <span className="font-semibold">{confirmTarget.nickname}</span>님을{' '}
              {confirmTarget.is_admin ? '일반 유저로 변경' : '관리자로 승격'}하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRoleConfirm}
                className={`flex-1 font-semibold py-2.5 rounded-lg text-white transition-colors ${
                  confirmTarget.is_admin
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
