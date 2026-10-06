import type { APIRoute } from 'astro';
import { getReleaseInfo } from '../lib/release';

// Static at build time. The smoke tests read this after each deploy to confirm
// the promoted bundle is the version the pipeline registered with ServiceNow.
export const GET: APIRoute = () => {
  const { version, sha, builtAt } = getReleaseInfo();
  return new Response(JSON.stringify({ status: 'UP', version, sha, builtAt }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
