export interface LessonSection {
  id: string;
  title: string;
  body: string;
}

/**
 * 백엔드 body_markdown 은 레슨 전체를 하나의 마크다운 문서로 저장한다
 * (education.lesson_versions 설계). `## ` 제목 단위로 쪼개 번호가 매겨진
 * 카드로 나눠 렌더링한다 — 개념 노트 미리보기 시안과 동일한 구조.
 */
export function splitLessonSections(markdown: string): LessonSection[] {
  const lines = markdown.split('\n');
  const sections: LessonSection[] = [];
  let current: { title: string; lines: string[] } | null = null;
  let index = 0;

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      if (current) {
        sections.push({
          id: `sec-${index}`,
          title: current.title,
          body: current.lines.join('\n').trim(),
        });
        index += 1;
      }
      current = { title: match[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    sections.push({
      id: `sec-${index}`,
      title: current.title,
      body: current.lines.join('\n').trim(),
    });
  }

  return sections;
}
