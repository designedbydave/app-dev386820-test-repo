import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STAGES } from '../src/lib/pipeline';

// The tracker describes the real workflow, so keep the two in sync: ServiceNow
// matches actions to jobs by display name, and a drifted name is easy to miss.
const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/build-and-deploy.yml'), 'utf8');

describe('STAGES', () => {
  it('has unique ids and job names', () => {
    expect(new Set(STAGES.map((s) => s.id)).size).toBe(STAGES.length);
    expect(new Set(STAGES.map((s) => s.job)).size).toBe(STAGES.length);
  });

  it.each(STAGES.map((s) => [s.id, s.job]))('job %s is named "%s" in the workflow', (id, job) => {
    expect(workflow).toMatch(new RegExp(`^  ${id}:\\n    name: ${job}$`, 'm'));
  });

  it('ends with the gated production deploy', () => {
    expect(STAGES.at(-2)?.kind).toBe('gate');
    expect(STAGES.at(-1)?.id).toBe('deploy-prod');
  });
});
