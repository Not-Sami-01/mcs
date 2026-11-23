import { describe, expect, it } from 'vitest';

import {
  buildInviteUrl,
  INVITE_EXPIRATION_MS,
  INVITE_SUBJECT,
  inviteEmailHtml,
  shouldSendInvite,
} from './invites';

describe('staff invites (CP-2.1)', () => {
  it('keeps the invite lifetime at 24 hours', () => {
    expect(INVITE_EXPIRATION_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('builds an absolute one-time set-password URL from the site origin', () => {
    expect(buildInviteUrl({ serverURL: 'https://mcs.example/', token: 'abc123' })).toBe(
      'https://mcs.example/admin/reset/abc123',
    );
  });

  it('sends only creates made by an authenticated Super Admin', () => {
    expect(shouldSendInvite({ operation: 'create', hasAuthenticatedUser: true, context: {} })).toBe(
      true,
    );
    expect(
      shouldSendInvite({ operation: 'create', hasAuthenticatedUser: false, context: {} }),
    ).toBe(false);
    expect(shouldSendInvite({ operation: 'update', hasAuthenticatedUser: true, context: {} })).toBe(
      false,
    );
    expect(
      shouldSendInvite({
        operation: 'create',
        hasAuthenticatedUser: true,
        context: { allowFirstUserBootstrap: true },
      }),
    ).toBe(false);
  });

  it('puts the link and its expiry in the email without any user-controlled markup', () => {
    const html = inviteEmailHtml({ url: 'https://mcs.example/admin/reset/abc123' });

    expect(html).toContain('https://mcs.example/admin/reset/abc123');
    expect(html).toContain('24 hours');
    expect(html).toContain('Set your password');
    expect(INVITE_SUBJECT).toBe('Set your MCS staff password');
  });
});
