'use client';

import { useAuth } from '@payloadcms/ui';
import Link from 'next/link';

/**
 * Two-factor enrolment is optional (2026-11-24 client request). The plugin's
 * setup view has no built-in navigation entry, so this link makes the opt-in
 * discoverable. It hides once the account has enrolled; enrolled users still
 * verify at login.
 */
export default function TwoFactorLink() {
  const { user } = useAuth();

  if (!user || user.totp?.enabled) return null;

  return (
    <Link
      href="/admin/setup-totp"
      style={{
        display: 'block',
        padding: '0.5rem 1rem',
        color: 'var(--theme-elevation-800)',
        textDecoration: 'none',
      }}
    >
      Set up two-factor authentication
    </Link>
  );
}
