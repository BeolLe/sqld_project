import { useNavigate } from 'react-router-dom';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import type { Difficulty } from '../types';
import { EXAM_LIST } from '../data/exams';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '기본',
  medium: '중급',
  hard: '고급',
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-600',
};

export default function ExamListPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-sqld-navy mb-1">모의고사</h1>
        <p className="text-slate-500 text-sm mb-8">
          실제 SQLD 시험 형식의 모의고사로 실력을 점검하세요. (1~3회 기본 / 4~6회 중급 / 7~10회
          고급)
        </p>

        <div className="grid gap-4">
          {EXAM_LIST.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              onClick={() => navigate(`/exams/${exam.id}/taking`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">{exam.round}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-sqld-navy">{exam.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {exam.problemCount}문항
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.timeLimit}분
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_COLOR[exam.avgDifficulty]}`}
                    >
                      {DIFFICULTY_LABEL[exam.avgDifficulty]}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
