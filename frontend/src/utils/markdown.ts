/**
 * CommonMark 규칙상 강조(**bold** 또는 __bold__) 내용이 따옴표/괄호 등
 * 구두점으로 끝나고 뒤에 공백 없이 글자(주로 한글 조사)가 바로 붙으면
 * 닫는 델리미터로 인식되지 않아 마커(** 또는 __)가 그대로 노출된다.
 * 구두점과 닫는 마커 사이에 폭 없는 공백(zero-width space)을 넣어 우회한다.
 *
 * 예) `**선택성(최소 개수)**과` 처럼 국문 조사가 바로 붙는 문장에서 발생한다.
 * ** 뿐 아니라 __ 도 함께 처리하여 작성자의 표기 습관과 무관하게 동일하게 렌더한다.
 */
const ZERO_WIDTH_SPACE = '\u200B';

export function normalizeMarkdownEmphasis(text: string): string {
  return text
    .replace(/\*\*([^\n*]+?)\*\*/g, (match, inner: string) =>
      /[\p{P}\p{S}]$/u.test(inner) ? `**${inner}${ZERO_WIDTH_SPACE}**` : match,
    )
    .replace(/__([^\n_]+?)__/g, (match, inner: string) =>
      /[\p{P}\p{S}]$/u.test(inner) ? `__${inner}${ZERO_WIDTH_SPACE}__` : match,
    );
}
