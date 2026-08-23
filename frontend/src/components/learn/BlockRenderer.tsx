import { Brain, Lightbulb, TriangleAlert } from 'lucide-react';
import type { Blank, LearnNode } from '../../data/learn/types';
import InlineText from './InlineText';
import QueryViz, { QueryVizPrintFrames } from './QueryViz';

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
              <p key={key} className="mb-3.5 whitespace-pre-line leading-[1.8] text-slate-700">
                {inline(node.text)}
              </p>
            );

          case 'list':
            return (
              <ul key={key} className="mb-3.5 list-disc space-y-1.5 pl-5 text-slate-700">
                {node.items.map((item, i) => (
                  <li key={i} className="whitespace-pre-line leading-[1.8]">
                    {inline(item)}
                  </li>
                ))}
              </ul>
            );

          case 'table':
            return (
              <div key={key} className="mb-4 overflow-x-auto print:break-inside-avoid">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {node.head.map((cell, i) => (
                        <th
                          key={i}
                          className="whitespace-pre border border-slate-300 bg-slate-100 px-3 py-2 text-left text-[0.8125rem] font-semibold text-slate-600"
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
                            className={`border border-slate-300 px-3 py-2 align-top leading-relaxed ${
                              cellIndex === 0
                                ? 'whitespace-pre font-semibold text-slate-900'
                                : 'whitespace-pre-line text-slate-700'
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
                className="mb-4 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3.5 print:break-inside-avoid"
              >
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  비유로 이해하기
                </div>
                <p className="mb-2 whitespace-pre-line font-bold leading-relaxed text-slate-900">
                  {inline(node.lead)}
                </p>
                {node.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line text-[0.9375rem] leading-[1.75] text-slate-700"
                  >
                    {inline(paragraph)}
                  </p>
                ))}
              </div>
            );

          case 'subheading':
            return (
              <h3
                key={key}
                className="mb-2.5 mt-6 text-[1rem] font-bold text-slate-800 first:mt-0"
              >
                {inline(node.text)}
              </h3>
            );

          case 'memory':
            return (
              <div
                key={key}
                className="mb-4 rounded-xl border border-primary-100 border-l-4 border-l-primary-500 bg-primary-50 px-4 py-3 print:break-inside-avoid"
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                  <Brain className="h-3.5 w-3.5" aria-hidden="true" />
                  암기
                </div>
                <p className="whitespace-pre-line text-[0.9rem] font-bold leading-[1.7] text-primary-900">
                  {inline(node.text)}
                </p>
              </div>
            );

          case 'trap':
            return (
              <div
                key={key}
                className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 print:break-inside-avoid"
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  함정
                </div>
                {/* text 안의 \n 을 줄바꿈으로 살린다 */}
                <p className="whitespace-pre-line text-[0.9rem] leading-[1.7] text-amber-900">
                  {inline(node.text)}
                </p>
              </div>
            );

          case 'viz':
            return (
              <div key={key} className="mb-4">
                <div className="print:hidden">
                  <QueryViz spec={node.spec} />
                </div>
                <div className="hidden print:block">
                  <QueryVizPrintFrames spec={node.spec} />
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
