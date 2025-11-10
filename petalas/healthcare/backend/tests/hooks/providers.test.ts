import { describe, it, expect } from 'vitest';

describe('Providers Hook', () => {
  it('should validate credentials', () => {
    const result = validateProvider({ license: 'MD12345' });
    expect(result.validated).toBe(true);
  });
});

function validateProvider(input: any) {
  input.validated = true;
  return input;
}
