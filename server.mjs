import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./dist', import.meta.url)));
const port = Number(process.env.PORT || 4310);
const revision = process.env.BUILD_REVISION || 'local';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };

const server = createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://rpc.bohr.life; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return; }
  let pathname; try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  if (pathname === '/healthz') { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify({ ok: true, revision, service: 'runseal-web' })); return; }
  const candidate = resolve(root, `.${pathname}`);
  const safe = candidate === root || candidate.startsWith(root + sep);
  const file = safe && existsSync(candidate) && statSync(candidate).isFile() ? candidate : resolve(root, 'index.html');
  if (!existsSync(file)) { res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Build the app first: npm run build'); return; }
  res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600' });
  if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
});
server.listen(port, '0.0.0.0', () => {
  const actualPort = server.address()?.port ?? port;
  process.stdout.write(`Runseal listening on 0.0.0.0:${actualPort}\n`);
});
