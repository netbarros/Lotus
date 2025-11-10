import { describe, it, expect } from 'vitest';

describe('Waitlist Hook', () => {
  it('should generate wait number', () => {
    const result = processWaitlistCreate({ name: 'John', partySize: 4 });
    expect(result.waitNumber).toBeDefined();
    expect(typeof result.waitNumber).toBe('number');
  });

  it('should estimate wait time', () => {
    const result = estimateWait({ partySize: 4 }, 5);
    expect(result.estimatedWait).toBeGreaterThan(0);
  });

  it('should set status to waiting', () => {
    const result = processWaitlistCreate({ name: 'Jane', partySize: 2 });
    expect(result.status).toBe('waiting');
  });
});

function processWaitlistCreate(input: any) {
  input.waitNumber = Math.floor(Math.random() * 1000) + 1;
  input.status = 'waiting';
  return input;
}

function estimateWait(input: any, queueLength: number) {
  input.estimatedWait = queueLength * 15; // 15 mins per party
  return input;
}
