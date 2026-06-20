/**
 * __tests__/security.test.js  (node:test, sin dependencias)
 * Requiere la app corriendo en http://localhost:3000.
 *
 * Validan comportamiento SEGURO -> en la app VULNERABLE FALLAN a proposito
 * (rojo). Tras la remediacion deben pasar a verde. Son la red de seguridad que
 * complementa al DAST (ZAP) en el pipeline.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EXPECT_PRODUCTION_SECURITY = process.env.EXPECT_PRODUCTION_SECURITY === 'true';

test('V5 - la cookie de sesión tiene atributos seguros', async () => {
  const r = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice', password: 'alice123' }),
  });
  const sc = r.headers.get('set-cookie') || '';
  assert.equal(r.status, 200);
  assert.match(sc, /(?:^|;\s*)HttpOnly(?:;|$)/i, 'Set-Cookie debería incluir HttpOnly');
  assert.match(sc, /(?:^|;\s*)SameSite=Lax(?:;|$)/i, 'Set-Cookie debería incluir SameSite=Lax');
  assert.match(sc, /(?:^|;\s*)Path=\/(?:;|$)/i, 'Set-Cookie debería incluir Path=/');
  if (EXPECT_PRODUCTION_SECURITY) {
    assert.match(sc, /(?:^|;\s*)Secure(?:;|$)/i, 'Set-Cookie debería incluir Secure');
  }
});

test('V4 - existen los headers de seguridad globales', async () => {
  const r = await fetch(`${BASE}/`);
  const csp = r.headers.get('content-security-policy') || '';
  assert.match(csp, /script-src[^;]*'nonce-[^']+'/i, 'la CSP debería usar un nonce');
  if (EXPECT_PRODUCTION_SECURITY) {
    assert.doesNotMatch(csp, /'unsafe-inline'/i, 'la CSP de producción no debe permitir inline scripts');
  }
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('cross-origin-resource-policy'), 'same-origin');
  assert.equal(r.headers.get('cross-origin-embedder-policy'), 'require-corp');
  assert.equal(r.headers.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  assert.ok(r.headers.get('permissions-policy'), 'falta Permissions-Policy');
  assert.ok(r.headers.get('strict-transport-security'), 'falta Strict-Transport-Security');
});

test('V2 - Path Traversal: no debe leer /etc/passwd', async () => {
  const r = await fetch(`${BASE}/api/files?name=..%2F..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd`);
  const body = await r.text();
  assert.ok([400, 403, 404].includes(r.status), `estado inesperado: ${r.status}`);
  assert.ok(!/root:.*:0:0:/.test(body), 'el endpoint devolvio /etc/passwd (path traversal)');
});

test('V3 - Open Redirect: bloquea dominios externos', async () => {
  const r = await fetch(`${BASE}/api/go?url=https://www.ucn.cl`, { redirect: 'manual' });
  const loc = r.headers.get('location') || '';
  assert.ok(!loc.startsWith('https://www.ucn.cl'), `redirige a externo: ${loc}`);
  assert.equal(new URL(loc, BASE).origin, new URL(BASE).origin);
});

test('V3 - Open Redirect: conserva redirecciones internas legítimas', async () => {
  const r = await fetch(`${BASE}/api/go?url=${encodeURIComponent('/search?q=cafe')}`, {
    redirect: 'manual',
  });
  assert.equal(new URL(r.headers.get('location'), BASE).pathname, '/search');
});

test('V1 - Reflected XSS: el query no debe reflejarse como HTML crudo', async () => {
  const r = await fetch(`${BASE}/search?q=${encodeURIComponent('<script>alert(1)</script>')}`);
  const html = await r.text();
  assert.ok(!html.includes('<script>alert(1)</script>'), 'el payload <script> se reflejo sin escapar');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'el payload debería mostrarse escapado');
});

test('V2 - el endpoint de archivos conserva el acceso legítimo', async () => {
  const r = await fetch(`${BASE}/api/files?name=bienvenida.txt`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Bienvenido/);
});
