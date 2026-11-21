export function validateSeedEnvironment({
  nodeEnv = process.env.NODE_ENV,
  siteEnv = process.env.SITE_ENV,
}: {
  nodeEnv?: string;
  siteEnv?: string;
} = {}): void {
  if (nodeEnv === 'production' || siteEnv === 'production') {
    throw new Error('Seeding is strictly prohibited in production.');
  }
  if (siteEnv !== 'development' && siteEnv !== 'staging') {
    throw new Error('Set SITE_ENV=development or SITE_ENV=staging before running the sample seed.');
  }
}
