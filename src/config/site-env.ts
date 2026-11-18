export type SiteEnvironment = 'development' | 'staging' | 'production';

const siteEnvironments = new Set<SiteEnvironment>(['development', 'staging', 'production']);

export function getSiteEnvironment(value = process.env.SITE_ENV): SiteEnvironment {
  if (value && siteEnvironments.has(value as SiteEnvironment)) {
    return value as SiteEnvironment;
  }

  return 'development';
}

export function getRobotsDirectives(environment = getSiteEnvironment()) {
  const index = environment === 'production';

  return {
    index,
    follow: index,
  };
}

export function getRobotsFile(environment = getSiteEnvironment()) {
  const production = environment === 'production';

  return {
    rules: {
      userAgent: '*',
      ...(production ? { allow: '/', disallow: ['/admin', '/api', '/edit'] } : { disallow: '/' }),
    },
  };
}
