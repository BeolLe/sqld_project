import type { ErdSpec } from '../../data/learn/types';

interface Props {
  spec: ErdSpec;
}

const LINE = '#475569';
const BOX_FILL = '#f8fafc';
const BOX_STROKE = '#94a3b8';

/** 관계선 y 좌표. 기호와 엔터티 상자가 모두 이 선을 기준으로 놓인다. */
const Y = 74;
const SPREAD = 15;

interface EndProps {
  /** 관계선이 엔터티 상자와 만나는 x */
  edge: number;
  /** 엔터티가 놓인 방향. 기호는 이 반대쪽으로 쌓인다. */
  side: 'left' | 'right';
  min: 'one' | 'zero';
  max: 'one' | 'many';
}

/**
 * 한쪽 끝의 기호를 그린다.
 * 엔터티에 가까운 쪽이 max(관계차수), 먼 쪽이 min(관계선택사양)이다.
 */
function EndSymbol({ edge, side, min, max }: EndProps) {
  const dir = side === 'left' ? 1 : -1;
  const maxX = edge + dir * 22;
  const minX = edge + dir * 40;

  return (
    <g stroke={LINE} strokeWidth={1.8} fill="none">
      {max === 'many' ? (
        <>
          <line x1={maxX} y1={Y} x2={edge} y2={Y - SPREAD} />
          <line x1={maxX} y1={Y} x2={edge} y2={Y + SPREAD} />
        </>
      ) : (
        <line x1={maxX} y1={Y - 12} x2={maxX} y2={Y + 12} />
      )}

      {min === 'zero' ? (
        <circle cx={minX} cy={Y} r={6.5} fill="#ffffff" />
      ) : (
        <line x1={minX} y1={Y - 12} x2={minX} y2={Y + 12} />
      )}
    </g>
  );
}

/** IE(정보공학) 표기법으로 관계 하나를 그린다. */
export default function ErdDiagram({ spec }: Props) {
  const leftEdge = 168;
  const rightEdge = 432;

  return (
    <figure className="mb-4 print:break-inside-avoid">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2">
        <svg
          viewBox="0 0 600 132"
          className="mx-auto block h-auto w-full min-w-[420px] max-w-[600px]"
          role="img"
          aria-label={`${spec.left.label}과 ${spec.right.label}의 관계 다이어그램`}
        >
          <rect
            x={24}
            y={Y - 25}
            width={144}
            height={50}
            rx={6}
            fill={BOX_FILL}
            stroke={BOX_STROKE}
            strokeWidth={1.5}
          />
          <text
            x={96}
            y={Y + 5}
            textAnchor="middle"
            className="fill-slate-700 text-[15px] font-semibold"
          >
            {spec.left.label}
          </text>

          <rect
            x={432}
            y={Y - 25}
            width={144}
            height={50}
            rx={6}
            fill={BOX_FILL}
            stroke={BOX_STROKE}
            strokeWidth={1.5}
          />
          <text
            x={504}
            y={Y + 5}
            textAnchor="middle"
            className="fill-slate-700 text-[15px] font-semibold"
          >
            {spec.right.label}
          </text>

          <line
            x1={leftEdge}
            y1={Y}
            x2={rightEdge}
            y2={Y}
            stroke={LINE}
            strokeWidth={1.8}
          />

          <EndSymbol edge={leftEdge} side="left" min={spec.left.min} max={spec.left.max} />
          <EndSymbol edge={rightEdge} side="right" min={spec.right.min} max={spec.right.max} />

          <text
            x={300}
            y={Y - 16}
            textAnchor="middle"
            className="fill-slate-500 text-[13px]"
          >
            {spec.relation}
          </text>
        </svg>
      </div>
      {spec.caption && (
        <figcaption className="mt-1.5 text-center text-[0.8125rem] leading-relaxed text-slate-500">
          {spec.caption}
        </figcaption>
      )}
    </figure>
  );
}
