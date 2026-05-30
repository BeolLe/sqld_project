import { useState } from 'react';
import { Gift, Send, CheckCircle, X, ChevronDown } from 'lucide-react';
import { submitSurvey } from '../api/survey';

const SURVEY_DISMISS_KEY = 'survey_popup_dismissed_date';
const SURVEY_SUBMITTED_KEY = 'survey_submitted';

function isDismissedToday(): boolean {
  const dismissed = localStorage.getItem(SURVEY_DISMISS_KEY);
  if (!dismissed) return false;
  return dismissed === new Date().toISOString().slice(0, 10);
}

function dismissForToday() {
  localStorage.setItem(SURVEY_DISMISS_KEY, new Date().toISOString().slice(0, 10));
}

export function shouldShowSurveyPopup(): boolean {
  if (isDismissedToday()) return false;
  if (localStorage.getItem(SURVEY_SUBMITTED_KEY) === 'true') return false;
  return true;
}

type ExamResult = 'passed' | 'failed' | 'pending' | 'not_taken';

const EXAM_RESULT_OPTIONS: { value: ExamResult; label: string }[] = [
  { value: 'passed', label: '합격' },
  { value: 'failed', label: '불합격' },
  { value: 'pending', label: '결과 미확인' },
  { value: 'not_taken', label: '미응시' },
];

interface SurveyPopupProps {
  onClose: () => void;
}

export default function SurveyPopup({ onClose }: SurveyPopupProps) {
  const [helpfulness, setHelpfulness] = useState(0);
  const [examResult, setExamResult] = useState<ExamResult | ''>('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const [dismissChecked, setDismissChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (helpfulness === 0) next.helpfulness = '도움 정도를 선택해주세요';
    if (!examResult) next.examResult = '시험 결과를 선택해주세요';
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10 || digits.length > 11) {
      next.phone = '올바른 전화번호를 입력해주세요';
    }
    if (!privacyConsent) next.privacyConsent = '개인정보 수집 및 제3자 제공에 동의해주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitSurvey({
        helpfulness,
        exam_result: examResult,
        phone: phone.replace(/\D/g, ''),
        comment,
      });
      localStorage.setItem(SURVEY_SUBMITTED_KEY, 'true');
      setSubmitted(true);
    } catch {
      setErrors({ submit: '설문 제출에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (dismissChecked) dismissForToday();
    onClose();
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">설문이 제출되었습니다!</h3>
          <p className="text-sm text-slate-600 mb-6">
            소중한 의견 감사합니다.
            <br />
            당첨자에게는 개별 연락드리겠습니다.
          </p>
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-900 px-8 py-5 text-white relative overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Survey Event</span>
          </div>
          <h2 className="text-lg font-bold">SQLD 설문조사 참여</h2>
          <p className="text-sm text-white/80 mt-1">
            참여해주신 분 중 추첨을 통해{' '}
            <span className="font-semibold text-white">10명</span>에게 투썸플레이스 커피
            기프티콘을 드립니다
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Q1 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Q1. SolSQLD가 SQLD 시험 준비에 도움이 되었나요?{' '}
              <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => {
                    setHelpfulness(score);
                    clearError('helpfulness');
                  }}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    helpfulness === score
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
              <span>전혀 아니다</span>
              <span>매우 그렇다</span>
            </div>
            {errors.helpfulness && (
              <p className="text-xs text-red-500 mt-1">{errors.helpfulness}</p>
            )}
          </div>

          {/* Q2 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Q2. SQLD 시험 결과는 어떻게 되었나요?{' '}
              <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXAM_RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setExamResult(value);
                    clearError('examResult');
                  }}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    examResult === value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.examResult && (
              <p className="text-xs text-red-500 mt-1">{errors.examResult}</p>
            )}
          </div>

          {/* Q3 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Q3. 기프티콘 수령용 전화번호 <span className="text-red-500">*</span>
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                clearError('phone');
              }}
              placeholder="010-0000-0000"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.phone ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}

            <div className={`mt-3 border rounded-lg overflow-hidden ${errors.privacyConsent ? 'border-red-400' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => {
                      setPrivacyConsent(e.target.checked);
                      clearError('privacyConsent');
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    [필수] 개인정보 수집 및 제3자 제공 동의
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPrivacyDetail((v) => !v)}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5 shrink-0"
                >
                  {showPrivacyDetail ? '접기' : '전문 보기'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrivacyDetail ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showPrivacyDetail && (
                <div className="px-3 py-3 border-t border-slate-200 bg-white text-xs text-slate-600 space-y-3">
                  <div>
                    <p className="font-semibold text-slate-700 mb-1.5">1. 개인정보 수집 · 이용</p>
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">수집 항목</th>
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">수집 목적</th>
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">보유 기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 px-2 py-1.5">전화번호</td>
                          <td className="border border-slate-200 px-2 py-1.5">이벤트 당첨 확인 및 경품 발송</td>
                          <td className="border border-slate-200 px-2 py-1.5">경품 발송 완료 후 지체 없이 파기</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1.5">2. 개인정보 제3자 제공</p>
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">제공받는 자</th>
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">제공 목적</th>
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">제공 항목</th>
                          <th className="border border-slate-200 px-2 py-1.5 text-left font-medium">보유 기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 px-2 py-1.5">경품 발송 대행사</td>
                          <td className="border border-slate-200 px-2 py-1.5">모바일 기프티콘 발송</td>
                          <td className="border border-slate-200 px-2 py-1.5">전화번호</td>
                          <td className="border border-slate-200 px-2 py-1.5">발송 완료 후 지체 없이 파기</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    위 동의를 거부할 권리가 있으며, 동의를 거부하실 경우 이벤트 경품 수령이
                    제한됩니다.
                  </p>
                </div>
              )}
            </div>
            {errors.privacyConsent && (
              <p className="text-xs text-red-500 mt-1">{errors.privacyConsent}</p>
            )}
          </div>

          {/* Q4 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Q4. 건의사항이나 의견이 있으시면 자유롭게 남겨주세요
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="(선택 사항)"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? (
              '제출 중...'
            ) : (
              <>
                설문 제출하기
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
          <div className="flex items-center justify-center mt-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dismissChecked}
                onChange={(e) => setDismissChecked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-slate-400">오늘 하루 안 보기</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
