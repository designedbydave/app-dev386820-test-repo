#!/usr/bin/env node
// Minimal static file server for the built site. The deploy jobs use it to
// "deploy" dist/ on the runner without installing dependencies; replace it with a
// real host (S3, Azure Static Web Apps, Pages, etc.) for a customer pipeline.
//
// Usage: node scripts/serve.mjs <dir> <port>
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const path = normalize(join(root, decodeURIComponent(urlPath.split('?')[0])));
  if (path !== root && !path.startsWith(root + sep)) return null;
  try {
    return statSync(path).isDirectory() ? join(path, 'index.html') : path;
  } catch {
    return null;
  }
}

createServer((req, res) => {
  const file = resolvePath(req.url ?? '/');
  try {
    if (!file || !statSync(file).isFile()) throw new Error('not found');
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
