import { Lightbulb, TriangleAlert } from 'lucide-react';
import type { Blank, LearnNode } from '../../data/learn/types';
import InlineText from './InlineText';
import QueryViz from './QueryViz';

interface Props {
  nodes: LearnNode[];
  blanks: Blank[];
  quizMode: boolean;
  onGrade: (blankId: string, correct: boolean) => void;
}

export default function BlockRenderer({ nodes, blanks, quizMode, onGrade }: Props) {
  return (
    <>
      {nodes.map((node, index) => {
        const key = `${node.kind}-${index}`;
        const inline = (text: string) => (
          <InlineText text={text} blanks={blanks} quizMode={quizMode} onGrade={onGrade} />
        );

        switch (node.kind) {
          case 'p':
            return (
              <p key={key} className="mb-3.5 leading-[1.8] text-slate-700">
                {inline(node.text)}
              </p>
            );

          case 'list':
            return (
              <ul key={key} className="mb-3.5 list-disc space-y-1.5 pl-5 text-slate-700">
                {node.items.map((item, i) => (
                  <li key={i} className="leading-[1.8]">
                    {inline(item)}
                  </li>
                ))}
              </ul>
            );

          case 'table':
            return (
              <div key={key} className="mb-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {node.head.map((cell, i) => (
                        <th
                          key={i}
                          className="whitespace-nowrap border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[0.8125rem] font-semibold text-slate-500"
                        >
                          {inline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {node.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`border border-slate-200 px-3 py-2 align-top leading-relaxed ${
                              cellIndex === 0
                                ? 'whitespace-nowrap font-semibold text-slate-900'
                                : 'text-slate-700'
                            }`}
                          >
                            {inline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'analogy':
            return (
              <div
                key={key}
                className="mb-4 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3.5"
              >
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  비유로 이해하기
                </div>
                <p className="mb-2 font-bold leading-relaxed text-slate-900">{inline(node.lead)}</p>
                {node.body.map((paragraph, i) => (
                  <p key={i} className="text-[0.9375rem] leading-[1.75] text-slate-700">
                    {inline(paragraph)}
                  </p>
                ))}
              </div>
            );

          case 'trap':
            return (
              <div key={key} className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  함정
                </div>
                <p className="text-[0.9rem] leading-[1.7] text-amber-900">{inline(node.text)}</p>
              </div>
            );

          case 'viz':
            return (
              <div key={key} className="mb-4">
                <QueryViz spec={node.spec} />
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
