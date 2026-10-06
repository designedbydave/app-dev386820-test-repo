// Post-deploy smoke tests, run with node:test against a deployed site so they
// need no npm install. Results are reported to ServiceNow from the deploy jobs.
//
//   BASE_URL=http://localhost:4321 EXPECTED_VERSION=1.0.42 npm run test:smoke
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';
const EXPECTED_VERSION = process.env.EXPECTED_VERSION;

describe(`smoke: ${BASE_URL}`, () => {
  it('health endpoint is UP', async () => {
    const res = await fetch(`${BASE_URL}/health.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'UP');
    if (EXPECTED_VERSION) assert.equal(body.version, EXPECTED_VERSION, 'deployed version');
  });

  it('home page renders the release and the pipeline', async () => {
    const res = await fetch(BASE_URL);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Change Velocity Demo<\/title>/);
    assert.match(html, /Pipeline walkthrough/);
    if (EXPECTED_VERSION) assert.match(html, new RegExp(`id="version">${EXPECTED_VERSION.replaceAll('.', '\\.')}<`));
  });

  it('serves the React island bundle', async () => {
    const html = await (await fetch(BASE_URL)).text();
    const src = html.match(/<astro-island[^>]*component-url="([^"]+)"/)?.[1];
    assert.ok(src, 'astro-island with component-url');
    const res = await fetch(new URL(src, BASE_URL));
    assert.equal(res.status, 200);
  });
});
