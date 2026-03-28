// ─── DDL / INSERT 파서 유틸리티 ────────────────────────────────────────────

export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnDef[];
}

/** CREATE TABLE 문을 파싱하여 테이블 스키마 배열 반환 */
export function parseDDL(ddl: string): TableSchema[] {
  const schemas: TableSchema[] = [];
  // 각 CREATE TABLE 문을 분리
  const createRegex =
    /CREATE\s+TABLE\s+(\w+)\s*\(([^;]+)\)/gi;
  let match: RegExpExecArray | null;

  while ((match = createRegex.exec(ddl)) !== null) {
    const tableName = match[1];
    const body = match[2];

    // 테이블 레벨 PK 찾기
    const tablePkMatch = body.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    const tablePkCols = tablePkMatch
      ? tablePkMatch[1].split(',').map((s) => s.trim().toUpperCase())
      : [];

    const columns: ColumnDef[] = [];
    // 컬럼 정의 추출 — 테이블 레벨 제약조건(PRIMARY KEY(...), CONSTRAINT...)은 제외
    const parts = splitColumnDefs(body);

    for (const part of parts) {
      const trimmed = part.trim();
      // 테이블 레벨 제약조건 스킵
      if (/^\s*(PRIMARY\s+KEY|CONSTRAINT|UNIQUE|CHECK|FOREIGN)\s/i.test(trimmed)) {
        continue;
      }
      const colMatch = trimmed.match(/^(\w+)\s+(.+)/);
      if (!colMatch) continue;

      const name = colMatch[1];
      const rest = colMatch[2];

      // 타입 추출 (첫 번째 토큰 + 괄호)
      const typeMatch = rest.match(/^(\w+(?:\s*\([^)]*\))?)/);
      const type = typeMatch ? typeMatch[1].replace(/\s+/g, '') : rest.split(/\s/)[0];

      const inlinePk = /PRIMARY\s+KEY/i.test(rest);
      const notNull = /NOT\s+NULL/i.test(rest) || inlinePk;
      const isPrimaryKey = inlinePk || tablePkCols.includes(name.toUpperCase());

      columns.push({
        name: name.toUpperCase(),
        type: type.toUpperCase(),
        nullable: !notNull && !isPrimaryKey,
        isPrimaryKey,
      });
    }

    schemas.push({ tableName: tableName.toUpperCase(), columns });
  }

  return schemas;
}

/** 괄호 중첩을 고려하여 컬럼 정의를 콤마로 분리 */
function splitColumnDefs(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of body) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

export interface SampleDataTable {
  tableName: string;
  columns: string[];
  rows: (string | null)[][];
}

/** INSERT 문을 파싱하여 테이블별 샘플 데이터 반환 */
export function parseInserts(insertSQL: string): SampleDataTable[] {
  const tableMap = new Map<string, { columns: string[]; rows: (string | null)[][] }>();

  const insertRegex =
    /INSERT\s+INTO\s+(\w+)(?:\s*\(([^)]*)\))?\s+VALUES\s*\(([^;]*?)\)\s*;?/gi;
  let match: RegExpExecArray | null;

  while ((match = insertRegex.exec(insertSQL)) !== null) {
    const tableName = match[1].toUpperCase();
    const colsPart = match[2];
    const valsPart = match[3];

    // 값 파싱 — 함수 호출 내 콤마를 고려
    const values = splitValues(valsPart);

    if (!tableMap.has(tableName)) {
      // 컬럼이 명시되어 있으면 사용, 없으면 나중에 스키마에서 매칭
      const columns = colsPart
        ? colsPart.split(',').map((s) => s.trim().toUpperCase())
        : [];
      tableMap.set(tableName, { columns, rows: [] });
    }

    const entry = tableMap.get(tableName)!;

    // 컬럼이 아직 비어있고 첫 INSERT에 명시됨
    if (entry.columns.length === 0 && colsPart) {
      entry.columns = colsPart.split(',').map((s) => s.trim().toUpperCase());
    }

    const row = values.map((v) => {
      const trimmed = v.trim();
      if (/^NULL$/i.test(trimmed)) return null;
      // 문자열 리터럴 → 따옴표 제거
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1);
      }
      // TO_DATE 등 함수 → 첫 번째 문자열 인자만 추출
      const fnMatch = trimmed.match(/TO_DATE\s*\(\s*'([^']+)'/i);
      if (fnMatch) return fnMatch[1];
      return trimmed;
    });

    entry.rows.push(row);
  }

  return Array.from(tableMap.entries()).map(([tableName, data]) => ({
    tableName,
    columns: data.columns,
    rows: data.rows,
  }));
}

/** 함수 호출 내 괄호를 고려하여 VALUES 내의 값들을 콤마로 분리 */
function splitValues(valsPart: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;

  for (let i = 0; i < valsPart.length; i++) {
    const char = valsPart[i];
    if (char === "'" && (i === 0 || valsPart[i - 1] !== "'")) {
      inString = !inString;
      current += char;
    } else if (inString) {
      current += char;
    } else if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}
