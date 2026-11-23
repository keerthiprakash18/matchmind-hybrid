import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const config=JSON.parse(readFileSync('vercel.json','utf8'));
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const headers=config.headers?.flatMap(route=>route.headers ?? []) ?? [];
const csp=headers.find(h=>h.key.toLowerCase()==='content-security-policy')?.value ?? '';

test('production CSP protects script origins, framing, object and base URIs',()=>{
  for(const directive of [
    "default-src 'self'","object-src 'none'","base-uri 'self'",
    "frame-ancestors 'none'","script-src 'self'","connect-src 'self'",
    "https://www.google.com/recaptcha/","https://www.gstatic.com/recaptcha/",
    "https://*.googleapis.com","font-src 'self'"
  ]) assert.ok(csp.includes(directive), 'Missing CSP directive '+directive);
  assert.doesNotMatch(csp,/script-src[^;]*'unsafe-eval'/);
  assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(csp,/default-src[^;]*\*/);
});

test('Vercel deploys must pass a fail-closed build test/security gate',()=>{
  assert.equal(config.buildCommand,'npm run release:verify');
  for(const command of ['npm test','npm run security:check','npm audit --omit=dev --audit-level=high','npm run build']) {
    assert.ok(pkg.scripts['release:verify'].includes(command), 'Missing mandatory release check: '+command);
  }
  const indices=['npm test','npm run security:check','npm audit --omit=dev --audit-level=high','npm run build']
    .map(s=>pkg.scripts['release:verify'].indexOf(s));
  assert.deepEqual([...indices].sort((a,b)=>a-b),indices,'All gates must run before compilation');
});
