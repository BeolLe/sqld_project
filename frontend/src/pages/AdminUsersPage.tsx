import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Users, Search, Shield, ShieldOff, Loader2, Filter, RotateCcw } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { AdminUserItem, AdminUserListResponse } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PAGE_SIZE = 20;

type RoleFilter = 'all' | 'user' | 'admin';

interface UserFilters {
  search: string;
  registeredFrom: string;
  registeredTo: string;
  emailDomain: string;
  minPoints: string;
  maxPoints: string;
  role: RoleFilter;
}

interface AdminUsersPageProps {
  onRoleChanged?: () => void | Promise<void>;
}

const EMPTY_FILTERS: UserFilters = {
  search: '',
  registeredFrom: '',
  registeredTo: '',
  emailDomain: '',
  minPoints: '',
  maxPoints: '',
  role: 'all',
};

function hasActiveFilters(filters: UserFilters): boolean {
  return (
    filters.search !== '' ||
    filters.registeredFrom !== '' ||
    filters.registeredTo !== '' ||
    filters.emailDomain !== '' ||
    filters.minPoints !== '' ||
    filters.maxPoints !== '' ||
    filters.role !== 'all'
  );
}

export default function AdminUsersPage({ onRoleChanged }: AdminUsersPageProps) {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<UserFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(EMPTY_FILTERS);
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
      if (appliedFilters.search) params.set('search', appliedFilters.search);
      if (appliedFilters.registeredFrom) {
        params.set('registered_from', appliedFilters.registeredFrom);
      }
      if (appliedFilters.registeredTo) {
        params.set('registered_to', appliedFilters.registeredTo);
      }
      if (appliedFilters.emailDomain) {
        params.set('email_domain', appliedFilters.emailDomain);
      }
      if (appliedFilters.minPoints) params.set('min_points', appliedFilters.minPoints);
      if (appliedFilters.maxPoints) params.set('max_points', appliedFilters.maxPoints);
      if (appliedFilters.role !== 'all') params.set('role', appliedFilters.role);

      const res = await apiFetch<AdminUserListResponse>(`/auth/admin/users?${params}`);
      setUsers(res.items);
      setTotal(res.total);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : '유저 목록을 불러올 수 없습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      draftFilters.registeredFrom &&
      draftFilters.registeredTo &&
      draftFilters.registeredFrom > draftFilters.registeredTo
    ) {
      setError('가입 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    if (
      draftFilters.minPoints !== '' &&
      draftFilters.maxPoints !== '' &&
      Number(draftFilters.minPoints) > Number(draftFilters.maxPoints)
    ) {
      setError('최소 포인트는 최대 포인트보다 클 수 없습니다.');
      return;
    }

    setError('');
    setAppliedFilters({
      ...draftFilters,
      search: draftFilters.search.trim(),
      emailDomain: draftFilters.emailDomain.trim().toLowerCase().replace(/^@/, ''),
    });
    setPage(1);
  }

  function handleFilterReset() {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setError('');
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
      await apiFetch(`/auth/admin/users/${confirmTarget.user_id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ is_admin: newIsAdmin }),
      });
      await fetchUsers();
      await onRoleChanged?.();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : '권한 변경에 실패했습니다. 변경 내용은 반영되지 않았습니다.'
      );
    } finally {
      setRoleLoading(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersApplied = hasActiveFilters(appliedFilters);

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <form
        onSubmit={handleFilterSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-sqld-navy">유저 조회 조건</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">이메일·닉네임</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={draftFilters.search}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="이메일 또는 닉네임"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">가입 시작일</span>
            <input
              type="date"
              value={draftFilters.registeredFrom}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, registeredFrom: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">가입 종료일</span>
            <input
              type="date"
              value={draftFilters.registeredTo}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, registeredTo: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">이메일 도메인</span>
            <input
              type="text"
              value={draftFilters.emailDomain}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, emailDomain: e.target.value }))
              }
              placeholder="예: gmail.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600">포인트 범위</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <input
                type="number"
                min="0"
                value={draftFilters.minPoints}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, minPoints: e.target.value }))
                }
                placeholder="최소"
                className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-slate-400">~</span>
              <input
                type="number"
                min="0"
                value={draftFilters.maxPoints}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, maxPoints: e.target.value }))
                }
                placeholder="최대"
                className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">역할</span>
            <select
              value={draftFilters.role}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, role: e.target.value as RoleFilter }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="user">일반 유저</option>
              <option value="admin">관리자</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            조회 결과{' '}
            <span className="font-semibold text-sqld-navy">{total.toLocaleString()}명</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFilterReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Search className="h-4 w-4" />
              조회
            </button>
          </div>
        </div>
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
            {filtersApplied ? '조건에 맞는 유저가 없습니다.' : '유저가 없습니다.'}
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmTarget(null)}
          />
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
