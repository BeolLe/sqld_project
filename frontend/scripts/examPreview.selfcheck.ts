// Run: node --experimental-strip-types scripts/examPreview.selfcheck.ts
import assert from 'node:assert/strict';
import { isExamPreviewHost, getPreviewExam, examPreviewPath } from '../src/utils/examPreview.ts';

assert.equal(isExamPreviewHost('test_dummies.selfronny.com'), true);
assert.equal(isExamPreviewHost('localhost'), true);
assert.equal(isExamPreviewHost('solsqld.com'), false);
assert.equal(isExamPreviewHost('www.solsqld.com'), false);
assert.equal(isExamPreviewHost('test_dummies.selfronny.com.example.com'), false);
assert.equal(getPreviewExam('/adsp/learn'), 'adsp');
assert.equal(getPreviewExam('/adsp-other'), 'sqld');
assert.equal(getPreviewExam('/learn', 'adsp'), 'sqld');
assert.equal(getPreviewExam('/mypage', 'adsp'), 'adsp');
assert.equal(examPreviewPath('/learn', 'adsp'), '/adsp/learn');
assert.equal(examPreviewPath('/adsp/learn', 'sqld'), '/learn');
assert.equal(examPreviewPath('/learn/sb-join', 'adsp'), '/adsp/learn');
assert.equal(examPreviewPath('/exams/1/result', 'adsp'), '/adsp/exams');
assert.equal(examPreviewPath('/sql-practice', 'adsp'), '/adsp');
assert.equal(examPreviewPath('/adsp', 'sqld'), '/');
assert.equal(examPreviewPath('/feedback', 'adsp'), '/feedback');
assert.equal(examPreviewPath('/admin', 'adsp'), '/admin');
console.log('Exam preview: 17 checks passed');
