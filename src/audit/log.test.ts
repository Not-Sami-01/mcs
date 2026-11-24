import { describe, expect, it } from 'vitest';

import { isLoginFailure } from './hooks';
import { hashIp, mapTotpEvent } from './log';

const headers = (values: Record<string, string>) => new Headers(values);

describe('hashIp', () => {
  it('is deterministic for the same address and salt', () => {
    const h = headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    expect(hashIp(h, 'salt')).toBe(hashIp(h, 'salt'));
    expect(hashIp(h, 'salt')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes with the address and with the salt', () => {
    const a = hashIp(headers({ 'x-forwarded-for': '203.0.113.9' }), 'salt');
    const b = hashIp(headers({ 'x-forwarded-for': '203.0.113.10' }), 'salt');
    const c = hashIp(headers({ 'x-forwarded-for': '203.0.113.9' }), 'other-salt');
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it('falls back to x-real-ip and refuses to hash without a salt or address', () => {
    expect(hashIp(headers({ 'x-real-ip': '198.51.100.4' }), 'salt')).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp(headers({ 'x-real-ip': '198.51.100.4' }), undefined)).toBeUndefined();
    expect(hashIp(headers({}), 'salt')).toBeUndefined();
  });
});

describe('login failure detection', () => {
  it('recognises Payload authentication and lock errors only', () => {
    const auth = new Error('wrong password');
    auth.name = 'AuthenticationError';
    const locked = new Error('locked');
    locked.name = 'LockedAuth';

    expect(isLoginFailure(auth)).toBe(true);
    expect(isLoginFailure(locked)).toBe(true);
    expect(isLoginFailure(new Error('validation'))).toBe(false);
    expect(isLoginFailure(undefined)).toBe(false);
  });
});

describe('TOTP audit mapping', () => {
  it('maps every plugin event to a specific audit action', () => {
    expect(mapTotpEvent('totp.setup.initiated')?.action).toBe('totp_setup_started');
    expect(mapTotpEvent('totp.setup.completed')?.action).toBe('totp_enrolled');
    expect(mapTotpEvent('totp.validate.success')?.action).toBe('totp_verified');
    expect(mapTotpEvent('totp.validate.failed')?.action).toBe('totp_failed');
    expect(mapTotpEvent('totp.validate.backup')?.action).toBe('totp_recovery_used');
    expect(mapTotpEvent('totp.disabled.by-admin')?.action).toBe('totp_reenrolled');
    expect(mapTotpEvent('totp.rate-limit.lockout')?.action).toBe('totp_locked');
  });
});
