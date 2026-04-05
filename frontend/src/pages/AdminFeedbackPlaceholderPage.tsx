import { Link, useSearchParams } from 'react-router-dom';

export default function AdminFeedbackPlaceholderPage() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket_id');

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          미구현 페이지
        </div>
        <h1 className="mt-4 text-2xl font-bold text-sqld-navy">피드백 관리자 페이지</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          이 페이지는 슬랙 알림에서 바로 진입할 수 있도록 먼저 만들어둔 플레이스홀더입니다.
          현재 단계에서는 관리자 처리 화면이 아직 구현되지 않았습니다.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">전달된 정보</p>
          <p className="mt-2 text-sm text-slate-700">
            ticket_id: <span className="font-mono">{ticketId ?? '-'}</span>
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            to="/feedback"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            피드백 페이지로 이동
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
