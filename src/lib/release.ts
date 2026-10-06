// Release metadata is baked in at build time by CI (see the Build job in
// .github/workflows/build-and-deploy.yml). The same bundle is promoted to TEST
// and PROD, so nothing here is environment-specific.

export interface ReleaseInfo {
  version: string;
  sha: string;
  shortSha: string;
  builtAt: string;
  runUrl: string | null;
}

export function shortSha(sha: string): string {
  return /^[0-9a-f]{7,40}$/i.test(sha) ? sha.slice(0, 7) : sha;
}

type ReleaseEnv = Pick<ImportMetaEnv, 'PUBLIC_APP_VERSION' | 'PUBLIC_GIT_SHA' | 'PUBLIC_BUILD_TIME' | 'PUBLIC_RUN_URL'>;

export function getReleaseInfo(env: ReleaseEnv = import.meta.env): ReleaseInfo {
  const sha = env.PUBLIC_GIT_SHA || 'local';
  return {
    version: env.PUBLIC_APP_VERSION || '0.0.0-dev',
    sha,
    shortSha: shortSha(sha),
    builtAt: env.PUBLIC_BUILD_TIME || new Date().toISOString(),
    runUrl: env.PUBLIC_RUN_URL || null,
  };
}
