# app-dev386820-test-repo

Demo of ServiceNow DevOps Change Velocity with a GitHub Actions change gate.

```
tag vX.Y.Z ──► Build ──► ServiceNow Change ──► Deploy (held until the change reaches Implement)
```

## Release

```
scripts/release.sh            # patch bump, asks before pushing
scripts/release.sh minor      # or major; add --yes to skip the prompt
```

The script bumps `package.json`, adds a `CHANGELOG.md` entry, commits, tags and pushes. The tag push starts `build-and-deploy`, which:

1. runs the unit tests and reports them to ServiceNow,
2. creates a change request on the **DevOps Simplified** model,
3. waits at the `production` environment until ServiceNow approves the change and moves it to **Implement**, then deploys.

## Local

```
npm test
```

Requires Node 22+. No dependencies.
