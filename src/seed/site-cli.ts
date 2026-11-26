// Load env before importing the Payload config (docs/PROJECT.md gotcha 17),
// then run the demo-site seed. A rejected import makes `payload run` exit 1.
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile?.(file);
  } catch {
    // Missing file is fine; the environment may already be exported.
  }
}

export {};

const { seedSite } = await import('./site/index');

try {
  await seedSite();
} catch (error) {
  process.exitCode = 1;
  throw error;
}
