import test from 'node:test';
import assert from 'node:assert/strict';
import { inferenceLabel } from '../src/inferenceSource.mjs';

test('Firebase SDK actual lowercase enum values render correctly', () => {
  assert.equal(inferenceLabel('on_device'), '✓ ON DEVICE');
  assert.equal(inferenceLabel('in_cloud'), '☁ CLOUD');
});
test('legacy uppercase values still render and missing values never invent a source', () => {
  assert.equal(inferenceLabel('ON_DEVICE'), '✓ ON DEVICE');
  assert.equal(inferenceLabel('IN_CLOUD'), '☁ CLOUD');
  assert.equal(inferenceLabel('UNREPORTED'), 'SOURCE UNVERIFIED');
  assert.equal(inferenceLabel(undefined), 'SOURCE UNVERIFIED');
});
