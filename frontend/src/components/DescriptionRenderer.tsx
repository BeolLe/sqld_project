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
  /^(SELECT\b|INSERT\b|UPDATE\b|DELETE\b|CREATE\b|ALTER\b|DROP\s+(TABLE|VIEW|INDEX|SEQUENCE|SYNONYM)\b.+|MERGE\s+INTO\b|GRANT\b.+\bTO\b.+|REVOKE\b.+\bFROM\b.+|COMMIT\s*;?$|ROLLBACK(?:\s+TO\s+[A-Za-z0-9_$#]+)?\s*;?$|SAVEPOINT\s+[A-Za-z0-9_$#]+\s*;?$|WITH\b|TRUNCATE\b)/i;
const SQL_INLINE_KEYWORDS =
  /^--.+|^(SET|FROM|WHERE|ORDER|GROUP|HAVING|JOIN|LEFT|RIGHT|FULL|CROSS|INNER|OUTER|ON|AND|OR|IN|NOT|EXISTS|UNION|INTERSECT|MINUS|EXCEPT|START|CONNECT|PARTITION|OVER|CASE|WHEN|THEN|ELSE|END|VALUES|INTO|AS|BETWEEN|LIKE|IS|NULL|DISTINCT|ALL|ANY|SOME|LIMIT|FETCH|OFFSET|USING)\b/i;

/** 파이프 구분선 행인지 (|------|------| 형태) */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-:]+(\|[\s\-:]+)+\|?$/.test(line.trim());
}

/** 파이프로 구분된 테이블 행인지 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  const pipeCount = (trimmed.match(/\|/g) || []).length;
  return pipeCount >= 1 && !isSeparatorRow(line);
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
  type: 'text' | 'table' | 'sql' | 'preformatted' | 'inline-table';
  lines: string[];
}

function isInlineTableDefinitionLine(line: string): boolean {
  return /^\[[^\]]+\]\s*테이블\s*:\s*.+$/.test(line.trim());
}

function parseInlineTableDefinition(line: string):
  | { title: string; headers: string[]; rows: string[][] }
  | null {
  const match = line.trim().match(/^\[([^\]]+)\]\s*테이블\s*:\s*(.+)$/);
  if (!match) return null;

  const title = `${match[1]} 테이블`;
  const body = match[2].trim();

  const tupleMatches = [...body.matchAll(/\(([^)]*)\)/g)];
  if (tupleMatches.length > 0) {
    const rows = tupleMatches
      .map((tuple) => tuple[1].split(',').map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 2);

    if (rows.length > 0 && rows.every((cells) => cells.length === rows[0].length)) {
      return { title, headers: [], rows };
    }
  }

  const headers = body
    .split(',')
    .map((cell) => cell.trim())
    .filter(Boolean);

  if (headers.length >= 2) {
    return { title, headers, rows: [] };
  }

  return null;
}

function isPreformattedStarter(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('--') || /^\[.+\]$/.test(trimmed) || /^예시\s*:/.test(trimmed);
}

function isPreformattedContinuation(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('--') ||
    /^트랜잭션\s+T\d+\s*:/.test(trimmed) ||
    /^데이터 변경\s*:/.test(trimmed) ||
    /^[가-힣A-Z]\.\s+/.test(trimmed)
  );
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

  let inFencedSql = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 마크다운 코드블록 시작 (```sql, ```SQL 등)
    if (/^```\s*sql\s*$/i.test(trimmed)) {
      flush();
      inFencedSql = true;
      current = { type: 'sql', lines: [] };
      continue;
    }

    // 마크다운 코드블록 종료 (```)
    if (inFencedSql && /^```\s*$/.test(trimmed)) {
      inFencedSql = false;
      flush();
      continue;
    }

    // 마크다운 코드블록 내부 — 그대로 SQL 블록에 추가
    if (inFencedSql) {
      current!.lines.push(line);
      continue;
    }

    // 빈 줄은 현재 블록 종료
    if (trimmed === '') {
      flush();
      continue;
    }

    if (isInlineTableDefinitionLine(line)) {
      flush();
      current = { type: 'inline-table', lines: [line] };
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

    // 예시 데이터/상황 블록 감지
    if (isPreformattedStarter(line)) {
      if (current?.type === 'preformatted') {
        current.lines.push(line);
      } else {
        flush();
        current = { type: 'preformatted', lines: [line] };
      }
      continue;
    }

    if (current?.type === 'preformatted' && isPreformattedContinuation(line)) {
      current.lines.push(line);
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
      <table className="inline-table text-xs border-collapse border border-slate-300 w-auto min-w-[16rem] table-auto">
        <thead>
          <tr className="bg-slate-100">
            {header.map((cell, i) => (
              <th
                key={i}
                className="border border-slate-300 px-3 py-1.5 text-left align-top font-semibold text-slate-700 whitespace-normal break-words"
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
                  className="border border-slate-300 px-3 py-1 align-top text-slate-600 whitespace-normal break-words"
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

function InlineTableDefinitionBlock({ line }: { line: string }) {
  const parsed = parseInlineTableDefinition(line);
  if (!parsed) {
    return <TextBlock lines={[line]} />;
  }

  return (
    <div className="my-2">
      <div className="mb-1 text-sm font-semibold text-slate-700">{parsed.title}</div>
      <div className="overflow-x-auto">
        <table className="inline-table text-xs border-collapse border border-slate-300 w-auto min-w-[16rem] table-auto">
          {parsed.headers.length > 0 && (
            <thead>
              <tr className="bg-slate-100">
                {parsed.headers.map((cell, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 px-3 py-1.5 text-left align-top font-semibold text-slate-700 whitespace-normal break-words"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          {parsed.rows.length > 0 && (
            <tbody>
              {parsed.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-slate-300 px-3 py-1 align-top text-slate-600 whitespace-normal break-words"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

function SqlBlock({ lines }: { lines: string[] }) {
  const displayLines = lines.map((line) => line.replace(/^(\s*)--\s?/, '$1'));

  return (
    <pre className="my-2 bg-white text-slate-900 text-xs border border-slate-800 px-4 py-3 overflow-x-auto font-mono leading-relaxed">
      {displayLines.join('\n')}
    </pre>
  );
}

function PreformattedBlock({ lines }: { lines: string[] }) {
  const displayLines = lines.map((line) => line.replace(/^(\s*)--\s?/, '$1'));

  if (lines.length === 1) {
    const label = displayLines[0].trim();
    return (
      <div className="my-1 text-sm font-semibold text-slate-600">
        {label}
      </div>
    );
  }

  return (
    <pre className="my-2 bg-slate-50 text-slate-800 text-sm border border-slate-200 px-4 py-3 overflow-x-auto whitespace-pre-wrap break-words font-medium leading-relaxed">
      {displayLines.join('\n')}
    </pre>
  );
}

function TextBlock({ lines }: { lines: string[] }) {
  return (
    <div className="leading-relaxed">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}

/** DB에서 줄바꿈이 유실된 description을 보수적으로 정규화 */
function normalizeDescription(text: string): string {
  return text
    .replace(/;\s*(?=의\s+[^\n?]*\?)/g, ';\n\n')
    .replace(/\?\s*(?=\[[^\]]+\]\s*테이블)/g, '?\n\n')
    .replace(/\?\s*(?=예시\s*:)/g, '?\n\n')
    .replace(/\?(?=[A-Za-z가-힣\[])/g, '?\n\n');
}

export default function DescriptionRenderer({ text }: { text: string }) {
  const blocks = parseBlocks(normalizeDescription(text));

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'table':
            return <TableBlock key={i} lines={block.lines} />;
          case 'inline-table':
            return <InlineTableDefinitionBlock key={i} line={block.lines[0]} />;
          case 'sql':
            return <SqlBlock key={i} lines={block.lines} />;
          case 'preformatted':
            return <PreformattedBlock key={i} lines={block.lines} />;
          case 'text':
            return <TextBlock key={i} lines={block.lines} />;
        }
      })}
    </div>
  );
}
