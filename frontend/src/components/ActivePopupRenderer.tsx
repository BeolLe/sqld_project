import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import type { NoticePopupSchema } from './NoticePopup';

const NoticePopup = lazy(() => import('./NoticePopup'));
const SurveyPopup = lazy(() => import('./SurveyPopup'));
const SurveyPopupLegacy = lazy(() => import('./SurveyPopupLegacy'));
const EventPopup = lazy(() => import('./EventPopup'));
const ExamCheerPopup = lazy(() => import('./ExamCheerPopup'));

export type PopupRendererKey = 'notice' | 'survey' | 'survey_legacy' | 'event' | 'exam_cheer';

export interface PopupFormField {
  key: string;
  type: string;
  label: string;
  required?: boolean;
}

export interface ActivePopupCampaign {
  campaignKey: string;
  title: string;
  phaseCode: 'phase1' | 'phase2' | 'cheer' | 'notice';
  popupType: 'maintenance' | 'critical_notice' | 'notice' | 'exam_cheer' | 'survey' | 'promotion';
  rendererKey: PopupRendererKey;
  audienceCode: 'public' | 'authenticated';
  displayPriority: number;
  formSchema?: NoticePopupSchema & { fields?: PopupFormField[] };
}

interface ActivePopupRendererProps {
  campaign: ActivePopupCampaign;
  onClose: (dismissForToday: boolean, hideUntilCampaignEnd?: boolean) => void;
}

type PopupRenderFunction = (props: ActivePopupRendererProps) => ReactNode;

const popupRegistry: Record<PopupRendererKey, PopupRenderFunction> = {
  notice: ({ campaign, onClose }) => (
    <NoticePopup title={campaign.title} schema={campaign.formSchema} onClose={onClose} />
  ),
  survey: ({ campaign, onClose }) => (
    <SurveyPopup
      campaignKey={campaign.campaignKey}
      formSchema={{ fields: campaign.formSchema?.fields ?? [] }}
      onClose={onClose}
    />
  ),
  survey_legacy: ({ campaign, onClose }) => (
    <SurveyPopupLegacy campaignKey={campaign.campaignKey} onClose={onClose} />
  ),
  event: ({ campaign, onClose }) => (
    <EventPopup
      phaseCode={campaign.phaseCode === 'phase2' ? 'phase2' : 'phase1'}
      onClose={onClose}
    />
  ),
  exam_cheer: ({ onClose }) => <ExamCheerPopup onClose={onClose} />,
};

function PopupLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
      <div className="rounded-xl bg-white px-6 py-4 text-sm text-slate-600 shadow-xl">
        안내를 불러오는 중입니다...
      </div>
    </div>
  );
}

interface PopupErrorBoundaryProps {
  children: ReactNode;
  onClose: ActivePopupRendererProps['onClose'];
}

interface PopupErrorBoundaryState {
  failed: boolean;
}

class PopupErrorBoundary extends Component<PopupErrorBoundaryProps, PopupErrorBoundaryState> {
  state: PopupErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): PopupErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('팝업 컴포넌트 로드 실패', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:hidden">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
          <p className="mb-4 text-sm text-slate-600">안내를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => this.props.onClose(false)}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }
}

export default function ActivePopupRenderer(props: ActivePopupRendererProps) {
  const renderPopup = popupRegistry[props.campaign.rendererKey];

  return (
    <PopupErrorBoundary key={props.campaign.campaignKey} onClose={props.onClose}>
      <Suspense fallback={<PopupLoadingFallback />}>{renderPopup(props)}</Suspense>
    </PopupErrorBoundary>
  );
}
