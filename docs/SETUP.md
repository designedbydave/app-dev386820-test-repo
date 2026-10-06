# Setup: ServiceNow instance + GitHub

Connects this repo's `build-and-deploy` workflow to a ServiceNow instance with DevOps Change Velocity, with GitHub connected through the **OAuth 2.0 GitHub App (JWT)** method. This mirrors the setup proven in the `sn-devops-change-velocity` demo repo; sources are listed at the end.

## 1. Connect GitHub to the instance (JWT)

Follow **OAuth 2.0 credentials for GitHub Apps – JWT** end to end: create the GitHub App, generate the JKS (see the procedure in the parent folder's `CLAUDE.md`), attach it to the instance, create the JWT signing key and provider, register GitHub as an OAuth provider, and create the credential.

Then onboard the GitHub tool and **discover + configure** this repo. Configuring creates the `push`, `issues` and `workflow_job` webhooks.

Constraints from the docs:
- One GitHub App ↔ one GitHub org ↔ one GitHub tool.
- Don't configure the same repo in more than one tool.
- JWT is what enables GitHub environments + deployment gates (not supported with basic auth).

## 2. GitHub secrets

From **All > Tools > Orchestration Tools** → your GitHub tool, then **Settings > Secrets and variables > Actions** in GitHub:

| Secret | Value |
| --- | --- |
| `SN_INSTANCE_URL` | `https://<instance>.service-now.com` |
| `SN_ORCHESTRATION_TOOL_ID` | sys_id of the GitHub tool record |
| `SN_DEVOPS_INTEGRATION_TOKEN` | **Copy token** on the tool record |

## 3. GitHub environments

**Settings > Environments**:

| Environment | Configuration |
| --- | --- |
| `test` | none |
| `production` | **Deployment protection rules** → select the ServiceNow GitHub App → save. Recommended: deployment branches = `main` only. |

Per the docs, the user who created the GitHub tool in ServiceNow must be a reviewer to approve workflows for GitHub environments. GitHub environments on **private** repos require GitHub Enterprise Cloud, so use a public repo otherwise.

## 4. Test results

The test-report action reports through the GitHub orchestration tool, so no separate test tool is needed. Confirm a **JUnit ↔ GitHub** mapping exists under **DevOps > Integrations > Test Type Mappings** (base system includes `GitHub - JUnit`). Both Vitest and the `node:test` smoke tests emit JUnit XML.

## 5. First run, then configure the pipeline steps

Push to `main` (or **Actions > build-and-deploy > Run workflow**). The pipeline and its steps are created in ServiceNow from the `workflow_job` events. Then, on the pipeline step records:

| Step | Configuration |
| --- | --- |
| `Deploy TEST` | **Change receipt = true** (change is recorded, no approval wait) |
| `ServiceNow Change` | Change control on. Leave **Change model** empty when change models are disabled; the workflow passes `"type": "normal"`. Set the **assignment group** here: the workflow deliberately doesn't send one, because a pipeline value overrides the step form. |

Approval for type-based DevOps changes comes from whichever flow is active (**DevOps Change Request Manual Approval**, **Minimal Automation Approval**, or **Advanced Automation Approval**).

Approve the change and move it to **Implement** → the gate releases `Deploy PROD`.

## 6. Where the data shows up

| Data | Navigation |
| --- | --- |
| Test summaries (`Unit Tests - 1.0.<run>`, `Smoke Tests TEST - 1.0.<run>`) | **DevOps > Test Results > Test Summaries** |
| Artifacts | **DevOps > Artifact > Artifacts** |
| Packages | **DevOps > Artifact > Packages** |
| Pipeline change requests | **DevOps > Orchestrate > Pipeline Change Requests** |
| Artifact/package staging issues | `sn_devops_artifact_staging` |

Reference a GitHub issue in a commit message (`Fixes #12`) to link the commit to a work item.

## 7. Demo scenarios

| Scenario | How |
| --- | --- |
| Happy path | Push to `main`, approve the change, watch `Deploy PROD` run |
| Failing unit test | Break an assertion in `test/release.test.ts` → `Build` fails; the failed summary still posts (`if: always()`) |
| Failed smoke test | Change the `<title>` in `src/pages/index.astro` without updating `smoke/site.test.mjs` → `Deploy TEST` fails, no change is created for PROD |
| Rejected change | Reject the change → `Deploy PROD` never runs |
| Batched release | Several pushes before approving; the package pulls in every commit since the last prod deploy |

## Sources

- [DevOps change models (Australia)](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/devops-change-multimodel.md)
- [GitHub integration with DevOps Change Velocity](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/github-integration-dev-ops.md)
- [OAuth 2.0 credentials for GitHub Apps – JWT](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/dev-ops-github-apps-oath-jwt.md)
- [GitHub Actions configurations](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/github-actions-integration-with-devops.md)
- [GitHub Deployment Gates for ServiceNow DevOps Change](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/github-deployment-gate-for-servicenow-devops-change.md)
- [ServiceNow DevOps custom actions from GitHub marketplace](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/servicenow-devops-custom-actions-from-github-marketplace.md)
- [Artifacts and packages](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/using-dev-ops-release-change.md)
- [DevOps test tool integration](https://github.com/rapdev-io/frame/blob/main/knowledge/platforms/servicenow/docs/australia/markdown/it-service-management/devops-change-velocity/dev-ops-test-tool-integration.md)
- Action READMEs/source (v7.1.0): [change](https://github.com/ServiceNow/servicenow-devops-change), [test-report](https://github.com/ServiceNow/servicenow-devops-test-report), [register-artifact](https://github.com/ServiceNow/servicenow-devops-register-artifact), [register-package](https://github.com/ServiceNow/servicenow-devops-register-package)
