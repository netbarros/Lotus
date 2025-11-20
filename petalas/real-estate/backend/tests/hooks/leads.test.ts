import { describe, it, expect } from 'vitest';

describe('Leads Hook', () => {
  it('should normalize email', () => {
    const result = processLeadCreate({ email: 'TEST@EXAMPLE.COM' });
    expect(result.email).toBe('test@example.com');
  });

  it('should set initial status', () => {
    const result = processLeadCreate({ name: 'John', email: 'john@example.com' });
    expect(result.status).toBe('new');
  });
});

function processLeadCreate(input: any) {
  input.email = input.email.toLowerCase();
  input.status = input.status || 'new';
  return input;
}
