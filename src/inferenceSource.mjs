/** Never infer route from selected mode. Trust only Firebase SDK's reported source. */
export function inferenceLabel(source) {
  if (source === 'on_device' || source === 'ON_DEVICE') return '✓ ON DEVICE';
  if (source === 'in_cloud' || source === 'IN_CLOUD') return '☁ CLOUD';
  return 'SOURCE UNVERIFIED';
}
