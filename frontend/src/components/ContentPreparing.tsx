import { Link } from 'react-router-dom';
import { AlertCircle, Hourglass, ChevronRight } from 'lucide-react';
import { useExamType } from '../hooks/useExamType';
import { useContentReady } from '../hooks/useExamCapabilities';

interface ContentPreparingProps {
  /** 예: '모의고사' */
  feature: string;
  /** 대신 이용할 수 있는 화면 안내 (선택) */
  cta?: { label: string; path: string };
}

/**
 * 시험 콘텐츠를 쓸 수 없을 때의 빈 화면.
 * 해당 시험이 아직 공개되지 않았으면 '준비 중', 공개 여부 조회 자체가 실패했으면 '확인 실패'와 다시 시도 버튼을 보여 준다.
 */
export default function ContentPreparing({ feature, cta }: ContentPreparingProps) {
  const { config, examPath } = useExamType();
  const { failed, refresh } = useContentReady();
  return (
    <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-100 text-center">
      <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
        {failed ? <AlertCircle className="w-6 h-6 text-amber-600" /> : <Hourglass className="w-6 h-6 text-amber-600" />}
      </div>
      {failed ? (
        <>
          <p className="font-bold text-sqld-navy mb-1">
            {config.name} {feature} 상태를 확인하지 못했습니다.
          </p>
          <p className="text-sm text-slate-500">네트워크 상태를 확인한 뒤 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-5 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            다시 시도
          </button>
        </>
      ) : (
        <>
          <p className="font-bold text-sqld-navy mb-1">
            {config.name} {feature}를 준비하고 있습니다.
          </p>
          <p className="text-sm text-slate-500">콘텐츠가 올라오는 대로 이 화면에서 바로 이용할 수 있습니다.</p>
        </>
      )}
      {cta && (
        <div>
          <Link
            to={examPath(cta.path)}
            className="inline-flex items-center gap-1 mt-5 text-sm text-primary-600 hover:underline font-medium"
          >
            {cta.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
