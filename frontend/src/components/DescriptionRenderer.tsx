/**
 * 문제 description 문자열을 파싱하여
 * 테이블, SQL 코드, 일반 텍스트를 구분 렌더링하는 컴포넌트.
 *
 * 지원 패턴:
 * - 파이프(|) 구분 테이블 (마크다운식 구분선 포함/미포함 모두)
 * - SQL 키워드로 시작하는 코드 블록
 * - 일반 텍스트
 */

const SQL_KEYWORDS =
  /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|MERGE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|WITH|TRUNCATE)\b/i;
const SQL_INLINE_KEYWORDS =
  /^--.+|^(SET|FROM|WHERE|ORDER|GROUP|HAVING|JOIN|LEFT|RIGHT|FULL|CROSS|INNER|OUTER|ON|AND|OR|IN|NOT|EXISTS|UNION|INTERSECT|MINUS|EXCEPT|START|CONNECT|PARTITION|OVER|CASE|WHEN|THEN|ELSE|END|VALUES|INTO|AS|BETWEEN|LIKE|IS|NULL|DISTINCT|ALL|ANY|SOME|LIMIT|FETCH|OFFSET)\b/i;

/** 파이프 구분선 행인지 (|------|------| 형태) */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-:]+(\|[\s\-:]+)+\|?$/.test(line.trim());
}

/** 파이프로 구분된 테이블 행인지 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  const pipeCount = (trimmed.match(/\|/g) || []).length;
  return pipeCount >= 2 && !isSeparatorRow(line);
}

/** 파이프 행에서 셀 값 추출 */
function parseCells(line: string): string[] {
  const trimmed = line.trim();
  // 앞뒤 파이프 제거 후 split
  const inner = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const cleaned = inner.endsWith('|') ? inner.slice(0, -1) : inner;
  return cleaned.split('|').map((c) => c.trim());
}

interface Block {
  type: 'text' | 'table' | 'sql';
  lines: string[];
}

/** description 문자열을 블록 단위로 분류 */
function parseBlocks(description: string): Block[] {
  const lines = description.split('\n');
  const blocks: Block[] = [];
  let current: Block | null = null;

  function flush() {
    if (current && current.lines.length > 0) {
      blocks.push(current);
    }
    current = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 빈 줄은 현재 블록 종료
    if (trimmed === '') {
      flush();
      continue;
    }

    // 테이블 행 감지
    if (isTableRow(line) || isSeparatorRow(line)) {
      if (current?.type === 'table') {
        current.lines.push(line);
      } else {
        flush();
        current = { type: 'table', lines: [line] };
      }
      continue;
    }

    // SQL 블록 감지 (SQL 키워드로 시작하는 줄)
    if (SQL_KEYWORDS.test(trimmed)) {
      if (current?.type === 'sql') {
        current.lines.push(line);
      } else {
        flush();
        current = { type: 'sql', lines: [line] };
      }
      continue;
    }

    // SQL 블록 연속 (이미 SQL 블록 안에 있을 때 SQL 관련 키워드)
    if (current?.type === 'sql' && SQL_INLINE_KEYWORDS.test(trimmed)) {
      current.lines.push(line);
      continue;
    }

    // SQL 블록 안의 세미콜론으로 끝나는 줄
    if (current?.type === 'sql' && trimmed.endsWith(';')) {
      current.lines.push(line);
      flush();
      continue;
    }

    // SQL 블록 안의 서브 라인 (괄호, 콤마 등으로 이어지는 줄)
    if (current?.type === 'sql' && /^[\s(,)]/.test(line)) {
      current.lines.push(line);
      continue;
    }

    // 일반 텍스트
    if (current?.type === 'text') {
      current.lines.push(line);
    } else {
      flush();
      current = { type: 'text', lines: [line] };
    }
  }

  flush();
  return blocks;
}

function TableBlock({ lines }: { lines: string[] }) {
  // 구분선 제거, 데이터 행만 추출
  const dataLines = lines.filter((l) => !isSeparatorRow(l));
  if (dataLines.length === 0) return null;

  const header = parseCells(dataLines[0]);
  const rows = dataLines.slice(1).map(parseCells);

  return (
    <div className="my-2 overflow-x-auto">
      <table className="text-xs border-collapse border border-slate-300 w-auto">
        <thead>
          <tr className="bg-slate-100">
            {header.map((cell, i) => (
              <th
                key={i}
                className="border border-slate-300 px-3 py-1.5 text-left font-semibold text-slate-700 whitespace-nowrap"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border border-slate-300 px-3 py-1 text-slate-600 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SqlBlock({ lines }: { lines: string[] }) {
  return (
    <pre className="my-2 bg-white text-slate-900 text-xs border border-slate-800 px-4 py-3 overflow-x-auto font-mono leading-relaxed">
      {lines.join('\n')}
    </pre>
  );
}

function TextBlock({ lines }: { lines: string[] }) {
  return (
    <span>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

export default function DescriptionRenderer({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'table':
            return <TableBlock key={i} lines={block.lines} />;
          case 'sql':
            return <SqlBlock key={i} lines={block.lines} />;
          case 'text':
            return <TextBlock key={i} lines={block.lines} />;
        }
      })}
    </div>
  );
}
