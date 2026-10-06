import { describe, expect, it } from 'vitest';
import { getReleaseInfo, shortSha } from '../src/lib/release';

describe('shortSha', () => {
  it('shortens a full commit SHA', () => {
    expect(shortSha('9cc2c35a1b2c3d4e5f60718293a4b5c6d7e8f901')).toBe('9cc2c35');
  });

  it('leaves non-SHA values alone', () => {
    expect(shortSha('local')).toBe('local');
  });
});

describe('getReleaseInfo', () => {
  it('reads build metadata from the environment', () => {
    const info = getReleaseInfo({
      PUBLIC_APP_VERSION: '1.0.42',
      PUBLIC_GIT_SHA: 'abcdef0123456789',
      PUBLIC_BUILD_TIME: '2026-10-06T12:00:00Z',
      PUBLIC_RUN_URL: 'https://github.com/o/r/actions/runs/1',
    });
    expect(info).toEqual({
      version: '1.0.42',
      sha: 'abcdef0123456789',
      shortSha: 'abcdef0',
      builtAt: '2026-10-06T12:00:00Z',
      runUrl: 'https://github.com/o/r/actions/runs/1',
    });
  });

  it('falls back to dev defaults when CI metadata is missing', () => {
    const info = getReleaseInfo({});
    expect(info.version).toBe('0.0.0-dev');
    expect(info.sha).toBe('local');
    expect(info.runUrl).toBeNull();
  });
});
