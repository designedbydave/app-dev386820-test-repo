# change-velocity-demo

Astro + React site whose GitHub Actions pipeline demonstrates **ServiceNow DevOps Change Velocity**: automatic change receipts for TEST and a **deployment gate** that holds production until a ServiceNow change request is approved.

The site itself shows the release it was built from (version, commit, run) and an interactive walkthrough of the pipeline, including the gate.

## Local use

Requires Node 22+.

```
npm install
npm run dev          # http://localhost:4321
npm test             # unit + component tests (Vitest)
npm run check        # astro check (TypeScript)
npm run build        # outputs dist/
npm run serve        # serve dist/ on :4321 with the same server the pipeline uses
npm run test:smoke   # smoke tests against BASE_URL (default http://localhost:4321)
```

## Pipeline (`.github/workflows/build-and-deploy.yml`)

```
Build ──► Deploy TEST ──► Register Package ──► ServiceNow Change ──► Deploy PROD
```

| Job | ServiceNow interaction |
| --- | --- |
| `Build` | Vitest results → test summary; `dist/` registered as artifact `change-velocity-demo` `1.0.<run>` |
| `Deploy TEST` | Change **receipt** (no approval), smoke test results → test summary |
| `Register Package` | Package `change-velocity-demo-1.0.<run>` |
| `ServiceNow Change` | Normal change request; arms the deployment gate on `production` |
| `Deploy PROD` | Held by the ServiceNow protection rule until the change reaches **Implement** |

PRs run `Build` only, and don't report to ServiceNow. Deployments are simulated on the runner (`scripts/deploy-local.sh`); swap in a real host for a customer pipeline.

Setup for the ServiceNow instance, GitHub secrets and environments: **[docs/SETUP.md](docs/SETUP.md)**.
