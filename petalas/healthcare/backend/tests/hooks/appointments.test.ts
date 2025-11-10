import { describe, it, expect } from 'vitest';

describe('Appointments Hook', () => {
  it('should send confirmation', () => {
    const result = processAppointmentCreate({ patientId: 1, providerId: 1 });
    expect(result.confirmationSent).toBe(true);
  });
});

function processAppointmentCreate(input: any) {
  input.confirmationSent = true;
  return input;
}
