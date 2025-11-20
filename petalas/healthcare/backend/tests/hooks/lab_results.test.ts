import { describe, it, expect } from 'vitest';

describe('Lab Results Hook', () => {
  it('should notify on abnormal results', () => {
    const result = checkAbnormal({ glucose: 200 });
    expect(result.notified).toBe(true);
  });
});

function checkAbnormal(input: any) {
  input.notified = input.glucose > 140;
  return input;
}
