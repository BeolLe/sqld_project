import { Link } from 'react-router-dom';
import { Hourglass, ChevronRight } from 'lucide-react';
import { useExamType } from '../hooks/useExamType';

interface ContentPreparingProps {
  /** 예: '모의고사' */
  feature: string;
  /** 대신 이용할 수 있는 화면 안내 (선택) */
  cta?: { label: string; path: string };
}

/**
 * 시험 콘텐츠가 아직 올라오지 않았을 때(GET /api/content/exam-capabilities 에서 해당 시험이 사용 불가일 때)의 빈 화면.
 */
export default function ContentPreparing({ feature, cta }: ContentPreparingProps) {
  const { config, examPath } = useExamType();
  return (
    <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-100 text-center">
      <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Hourglass className="w-6 h-6 text-amber-600" />
      </div>
      <p className="font-bold text-sqld-navy mb-1">
        {config.name} {feature}를 준비하고 있습니다.
      </p>
      <p className="text-sm text-slate-500">콘텐츠가 올라오는 대로 이 화면에서 바로 이용할 수 있습니다.</p>
      {cta && (
        <Link
          to={examPath(cta.path)}
          className="inline-flex items-center gap-1 mt-5 text-sm text-primary-600 hover:underline font-medium"
        >
          {cta.label}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
