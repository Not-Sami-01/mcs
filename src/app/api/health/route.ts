import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Liveness plus a real database round trip.
 * Never include connection details, error messages or secrets in the response.
 */
export async function GET() {
  let databaseOk = false;

  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3_000,
    });

    try {
      await client.connect();
      await client.query('select 1');
      databaseOk = true;
    } catch {
      databaseOk = false;
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  return NextResponse.json(
    { ok: databaseOk },
    {
      status: databaseOk ? 200 : 503,
      headers: { 'cache-control': 'no-store' },
    },
  );
}
