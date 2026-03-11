import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { Difficulty } from '../types';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-600',
};

// 목업 SQL 실습 문제
const SQL_PROBLEMS = [
  {
    id: 'sql1',
    title: 'EMP 테이블 전체 조회',
    category: 'DML',
    difficulty: 'easy' as Difficulty,
    correctRate: 92,
  },
  {
    id: 'sql2',
    title: 'GROUP BY와 HAVING 절',
    category: 'DML',
    difficulty: 'medium' as Difficulty,
    correctRate: 68,
  },
  {
    id: 'sql3',
    title: 'INNER JOIN 기본',
    category: 'JOIN',
    difficulty: 'medium' as Difficulty,
    correctRate: 74,
  },
  {
    id: 'sql4',
    title: 'LEFT OUTER JOIN',
    category: 'JOIN',
    difficulty: 'medium' as Difficulty,
    correctRate: 61,
  },
  {
    id: 'sql5',
    title: 'ROLLUP 함수 활용',
    category: '집합연산',
    difficulty: 'hard' as Difficulty,
    correctRate: 38,
  },
  {
    id: 'sql6',
    title: 'RANK / DENSE_RANK 윈도우 함수',
    category: '함수',
    difficulty: 'hard' as Difficulty,
    correctRate: 42,
  },
  {
    id: 'sql7',
    title: 'SUBSTR / INSTR 문자 함수',
    category: '함수',
    difficulty: 'easy' as Difficulty,
    correctRate: 81,
  },
  {
    id: 'sql8',
    title: '서브쿼리 기본',
    category: '서브쿼리',
    difficulty: 'medium' as Difficulty,
    correctRate: 55,
  },
  {
    id: 'sql9',
    title: 'EXISTS 서브쿼리',
    category: '서브쿼리',
    difficulty: 'hard' as Difficulty,
    correctRate: 33,
  },
  {
    id: 'sql10',
    title: 'INSERT / UPDATE / DELETE',
    category: 'DML',
    difficulty: 'easy' as Difficulty,
    correctRate: 88,
  },
];

type SortKey = 'default' | 'difficulty_asc' | 'difficulty_desc' | 'rate_asc' | 'rate_desc';

export default function SQLPracticeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');

  const filtered = useMemo(() => {
    let list = SQL_PROBLEMS.filter((p) => {
      const matchSearch = p.title.includes(search) || p.category.includes(search);
      const matchDiff = diffFilter === 'all' || p.difficulty === diffFilter;
      return matchSearch && matchDiff;
    });

    const diffOrder: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
    if (sort === 'difficulty_asc')
      list = [...list].sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
    if (sort === 'difficulty_desc')
      list = [...list].sort((a, b) => diffOrder[b.difficulty] - diffOrder[a.difficulty]);
    if (sort === 'rate_asc') list = [...list].sort((a, b) => a.correctRate - b.correctRate);
    if (sort === 'rate_desc') list = [...list].sort((a, b) => b.correctRate - a.correctRate);

    return list;
  }, [search, sort, diffFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-sqld-navy mb-1">SQL 실습</h1>
        <p className="text-slate-500 text-sm mb-6">
          Oracle 환경에서 직접 SQL을 작성하고 결과를 확인하세요.
        </p>

        {/* 검색 및 필터 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="문제명 또는 카테고리 검색"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors border ${
                  diffFilter === d
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary-400'
                }`}
              >
                {d === 'all' ? '전체' : DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-600"
          >
            <option value="default">기본 순</option>
            <option value="difficulty_asc">난이도 낮은 순</option>
            <option value="difficulty_desc">난이도 높은 순</option>
            <option value="rate_asc">정답률 낮은 순</option>
            <option value="rate_desc">정답률 높은 순</option>
          </select>
        </div>

        {/* 문제 목록 */}
        <div className="grid gap-3">
          {filtered.map((problem) => (
            <div
              key={problem.id}
              onClick={() => navigate(`/sql-practice/${problem.id}`)}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-primary-400 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DIFFICULTY_COLOR[problem.difficulty]}`}
                >
                  {DIFFICULTY_LABEL[problem.difficulty]}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{problem.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{problem.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">정답률</p>
                  <p className="text-sm font-bold text-sqld-navy">{problem.correctRate}%</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
