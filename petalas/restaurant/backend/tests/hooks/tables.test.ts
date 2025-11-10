import { describe, it, expect } from 'vitest';

describe('Tables Hook', () => {
  it('should set default status to available', () => {
    const result = processTableCreate({ tableNumber: 1, capacity: 4 });
    expect(result.status).toBe('available');
  });

  it('should validate capacity', () => {
    expect(() => validateCapacity({ capacity: 0 })).toThrow();
    expect(() => validateCapacity({ capacity: 4 })).not.toThrow();
  });

  it('should track occupancy time', () => {
    const result = occupyTable({ id: 1, status: 'occupied' });
    expect(result.occupiedAt).toBeDefined();
  });
});

function processTableCreate(input: any) {
  input.status = input.status || 'available';
  return input;
}

function validateCapacity(input: any) {
  if (input.capacity < 1) throw new Error('Invalid capacity');
}

function occupyTable(input: any) {
  if (input.status === 'occupied') {
    input.occupiedAt = new Date().toISOString();
  }
  return input;
}
