// The stages of .github/workflows/build-and-deploy.yml, in order. `id` matches
// the job key in the workflow; `job` matches its display name, which is also the
// `job-name` passed to the ServiceNow actions.

export type StageKind = 'ci' | 'receipt' | 'register' | 'gate' | 'deploy';

export interface Stage {
  id: string;
  job: string;
  kind: StageKind;
  summary: string;
  servicenow: string;
}

export const STAGES: readonly Stage[] = [
  {
    id: 'build',
    job: 'Build',
    kind: 'ci',
    summary: 'Unit tests, Astro build, package the static site.',
    servicenow: 'Unit test results and the build artifact are registered against the pipeline run.',
  },
  {
    id: 'deploy-test',
    job: 'Deploy TEST',
    kind: 'receipt',
    summary: 'Deploy to TEST and run smoke tests.',
    servicenow: 'A change receipt is recorded: the change is created with pipeline data and closed without waiting for approval.',
  },
  {
    id: 'register-package',
    job: 'Register Package',
    kind: 'register',
    summary: 'Group the artifact into a releasable package.',
    servicenow: 'The package links the artifact, commits and test results to the change created next.',
  },
  {
    id: 'change',
    job: 'ServiceNow Change',
    kind: 'gate',
    summary: 'Open a Normal change request for production.',
    servicenow: 'The change is created and the deployment gate is armed on the production environment.',
  },
  {
    id: 'deploy-prod',
    job: 'Deploy PROD',
    kind: 'deploy',
    summary: 'Deploy to PROD and verify.',
    servicenow: 'GitHub holds this job until the change request reaches Implement, then releases it.',
  },
];

export function stageIndex(id: string): number {
  return STAGES.findIndex((s) => s.id === id);
}
