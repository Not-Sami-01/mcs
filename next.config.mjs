import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const isProduction = process.env.SITE_ENV === 'production';

const nextConfig = {
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      { key: 'X-Frame-Options', value: 'DENY' },
      {
        key: 'Content-Security-Policy-Report-Only',
        value:
          "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
      },
      ...(!isProduction ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ...(isProduction ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    ];

    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The admin panel is never indexed, in any environment.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/edit/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default withPayload(nextConfig);
