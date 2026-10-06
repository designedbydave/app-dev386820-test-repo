# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Astro 7 + React 19 static site used to demo ServiceNow DevOps Change Velocity. The app is deliberately small; the point of the repo is `.github/workflows/build-and-deploy.yml`.

## Commands

```
npm test                                 # Vitest (jsdom); single file: npx vitest run test/release.test.ts
npm run check                            # astro check — needs TypeScript 6 (astro check rejects TS 7)
npm run build                            # dist/; PUBLIC_APP_VERSION / PUBLIC_GIT_SHA / PUBLIC_RUN_URL bake in release info
npm run test:smoke                       # node:test against BASE_URL; set EXPECTED_VERSION to assert the deployed version
bash scripts/deploy-local.sh dist 4321 test && npm run test:smoke; bash scripts/stop-local.sh   # what the deploy jobs do
```

## How the pieces connect

- **Build once, promote.** `Build` uploads `dist/`; `Deploy TEST` and `Deploy PROD` download the same artifact. Release metadata is baked in at build time, so nothing in the bundle may be environment-specific.
- **Smoke tests need no install.** `smoke/` uses only `node:test` + `fetch`, and `scripts/serve.mjs` has no dependencies, so deploy jobs skip `npm ci`. Keep it that way.
- **`src/lib/pipeline.ts` mirrors the workflow jobs** for the in-app walkthrough. `test/pipeline.test.ts` asserts each `id`/`job` matches a job key and display name in the workflow, so renaming a job means updating both.

## ServiceNow workflow rules (see docs/SETUP.md for sources)

- Workflow `name` must equal the file name (`build-and-deploy`).
- Each ServiceNow action's `job-name` must equal the display `name` of the job it runs in.
- Jobs stay sequential (change automation doesn't support parallel jobs); `Register Package` must run in a job before `ServiceNow Change`.
- `setCloseCode` / `autoCloseChange` are JSON booleans, not strings.
- Don't send `assignment_group` from the workflow; it overrides the value set on the ServiceNow pipeline step.
- `deployment-gate` on `ServiceNow Change` means that action doesn't poll; the `production` environment's ServiceNow protection rule holds `Deploy PROD`.
