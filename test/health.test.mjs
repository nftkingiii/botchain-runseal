import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { get } from 'node:http';

function getLocal(port, path) {
  return new Promise((resolve, reject) => get({ hostname: '127.0.0.1', port, path, agent: false }, response => {
    let body = ''; response.setEncoding('utf8'); response.on('data', chunk => body += chunk); response.on('end', () => resolve({ status: response.statusCode, body }));
  }).on('error', reject));
}

test('health route returns service and revision without exposing environment', async () => {
  const server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: '0', BUILD_REVISION: 'test-revision', SECRET_PROBE: 'must-not-leak' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const port = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('server did not report its ephemeral port')), 5000);
      server.once('error', reject);
      server.stdout.on('data', chunk => { output += chunk.toString(); const found = output.match(/listening on 0\.0\.0\.0:(\d+)/); if (found) { clearTimeout(timer); resolve(Number(found[1])); } });
    });
    const response = await getLocal(port, '/healthz');
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { ok: true, revision: 'test-revision', service: 'runseal-web' });
  } finally { server.kill(); }
});
