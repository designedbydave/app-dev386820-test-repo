interface ImportMetaEnv {
  readonly PUBLIC_APP_VERSION?: string;
  readonly PUBLIC_GIT_SHA?: string;
  readonly PUBLIC_BUILD_TIME?: string;
  readonly PUBLIC_RUN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
