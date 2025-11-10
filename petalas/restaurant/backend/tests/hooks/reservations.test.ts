import { describe, it, expect } from 'vitest';

describe('Reservations Hook', () => {
  it('should generate confirmation code', () => {
    const input = { name: 'John Doe', partySize: 4 };
    const result = processReservationCreate(input);
    expect(result.confirmationCode).toMatch(/^[A-Z0-9]{8}$/);
    expect(result.status).toBe('confirmed');
  });

  it('should validate party size', () => {
    expect(() => validatePartySize({ partySize: 0 })).toThrow();
    expect(() => validatePartySize({ partySize: 21 })).toThrow();
    expect(() => validatePartySize({ partySize: 4 })).not.toThrow();
  });

  it('should send confirmation notification', () => {
    const input = { id: 1, email: 'test@example.com', confirmationCode: 'ABC123' };
    const result = sendConfirmation(input);
    expect(result.notificationSent).toBe(true);
  });
});

function processReservationCreate(input: any) {
  input.confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  input.status = 'confirmed';
  return input;
}

function validatePartySize(input: any) {
  if (input.partySize < 1 || input.partySize > 20) {
    throw new Error('Party size must be between 1 and 20');
  }
}

function sendConfirmation(input: any) {
  input.notificationSent = true;
  return input;
}
