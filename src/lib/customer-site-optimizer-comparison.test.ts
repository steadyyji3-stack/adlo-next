import assert from 'node:assert/strict';
import test from 'node:test';
import { compareSiteOptimizerScans, type SiteOptimizerSnapshot } from './customer-site-optimizer-comparison';

test('separates fixed, partially improved, regressed, and newly observed issues', () => {
  const comparison = compareSiteOptimizerScans(
    scan('before', 55, snapshot([
      page('/', 50, [check('title', 'SEO 標題', 'fail'), check('h1', 'H1', 'warn'), check('links', '內部連結', 'pass')]),
    ])),
    scan('after', 72, snapshot([
      page('/', 72, [check('title', 'SEO 標題', 'pass'), check('h1', 'H1', 'pass'), check('links', '內部連結', 'warn')]),
      page('/menu', 60, [check('description', '搜尋摘要', 'fail')]),
    ])),
  );

  assert.equal(comparison.scoreDelta, 17);
  assert.deepEqual(comparison.resolved.map((item) => item.checkId), ['h1', 'title']);
  assert.deepEqual(comparison.regressed.map((item) => item.checkId), ['links']);
  assert.deepEqual(comparison.newIssues.map((item) => item.checkId), ['description']);
  assert.equal(comparison.commonPages, 1);
  assert.equal(comparison.currentPages, 2);
});

test('reports fail-to-warn as improvement without claiming it is fixed', () => {
  const comparison = compareSiteOptimizerScans(
    scan('before', 40, snapshot([page('/', 40, [check('title', 'SEO 標題', 'fail')])])),
    scan('after', 55, snapshot([page('/', 55, [check('title', 'SEO 標題', 'warn')])])),
  );
  assert.equal(comparison.resolved.length, 0);
  assert.equal(comparison.improved.length, 1);
});

test('does not call a missing page resolved', () => {
  const comparison = compareSiteOptimizerScans(
    scan('before', 50, snapshot([page('/old', 50, [check('title', 'SEO 標題', 'fail')])])),
    scan('after', 70, snapshot([page('/', 70, [check('title', 'SEO 標題', 'pass')])])),
  );
  assert.equal(comparison.resolved.length, 0);
  assert.equal(comparison.commonPages, 0);
});

function scan(id: string, overallScore: number, value: SiteOptimizerSnapshot) {
  return { id, overallScore, snapshot: value };
}

function snapshot(pages: SiteOptimizerSnapshot['pages']): SiteOptimizerSnapshot {
  return { version: 1, pages };
}

function page(path: string, score: number, checks: SiteOptimizerSnapshot['pages'][number]['checks']) {
  return { path, score, checks };
}

function check(id: string, label: string, status: 'pass' | 'warn' | 'fail') {
  return { id, label, status };
}
