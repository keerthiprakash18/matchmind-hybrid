import test from 'node:test';
import assert from 'node:assert/strict';
import { friendlyInferenceError } from '../src/errors.mjs';
test('redacts sensitive URLs and request details from UI',()=>{
 const actual='Firebase App Check token is invalid from https://secret.invalid/?token=private';
 const safe=friendlyInferenceError(new Error(actual));
 assert.match(safe,/App Check/);
 assert.doesNotMatch(safe,/secret|private|https:/);
});
test('model lifecycle and quota errors are actionable',()=>{
 assert.match(friendlyInferenceError(new Error('404 model no longer available')),/model unavailable/i);
 assert.match(friendlyInferenceError(new Error('429 RESOURCE_EXHAUSTED')),/limit reached/);
});

test('production App Check failure recommends allowed-domain checks, never debug tokens',()=>{
 const message=friendlyInferenceError(new Error('App attestation failed.'),'production');
 assert.match(message,/reCAPTCHA Enterprise allowed domains/);
 assert.doesNotMatch(message,/Verify the debug token for this Web App locally/);
});
