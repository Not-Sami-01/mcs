import { describe, expect, it } from 'vitest';

import { emailField } from './fields';
import { TEXT_LIMITS } from './limits';

describe('emailField', () => {
  const field = emailField({ name: 'email', label: 'Email', required: true });

  it('uses the canonical email length limit', () => {
    expect(field.maxLength).toBe(TEXT_LIMITS.emailAddress);
  });

  it('validates email format server-side', () => {
    const validate = field.validate as (
      value: string | string[] | null | undefined,
    ) => true | string;
    expect(validate('person@example.com')).toBe(true);
    expect(validate('not-an-email')).toBe('Enter a valid email address.');
  });
});
