import { applyProductImport, CSV_MAX_BYTES, CSV_MAX_ROWS, planProductImport } from '@/csv/products';
import { jsonResponse, productsCsvAccess } from '@/csv/session';
import { CsvError } from '@/csv/csv';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/staff/products/import?mode=dry-run|commit` (docs/API.md §4).
 *
 * The body is the CSV itself. `dry-run` (the default) validates everything and
 * returns row-level results without writing; `commit` applies the plan but only
 * when **every** row is valid, so a half-applied price list is impossible.
 * Super Admin and Product Manager only; published price changes go through the
 * products hook, which writes price history and the audit entry.
 */
export async function POST(request: Request): Promise<Response> {
  const access = await productsCsvAccess(request);
  if (!access.ok) return jsonResponse({ ok: false, error: access.error }, access.status);

  const mode = new URL(request.url).searchParams.get('mode') ?? 'dry-run';
  if (mode !== 'dry-run' && mode !== 'commit') {
    return jsonResponse({ ok: false, error: 'mode must be dry-run or commit.' }, 400);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > CSV_MAX_BYTES) {
    return jsonResponse({ ok: false, error: 'The file is larger than 1 MB.' }, 413);
  }

  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > CSV_MAX_BYTES) {
    return jsonResponse({ ok: false, error: 'The file is larger than 1 MB.' }, 413);
  }

  const { docs } = await access.payload.find({
    collection: 'products',
    depth: 0,
    limit: 5000,
    pagination: false,
    overrideAccess: false,
    user: access.user,
  });
  const existingSlugs = new Set(docs.map((product) => product.slug));

  let plan;
  try {
    plan = planProductImport(text, existingSlugs);
  } catch (error) {
    if (error instanceof CsvError) {
      return jsonResponse({ ok: false, error: error.message }, 422);
    }
    throw error;
  }

  const summary = {
    totalRows: plan.totalRows,
    creates: plan.creates,
    updates: plan.updates,
    rows: plan.rows,
  };

  if (plan.totalRows > CSV_MAX_ROWS) {
    return jsonResponse({ ok: false, error: `At most ${CSV_MAX_ROWS} rows per file.` }, 413);
  }

  if (!plan.valid) {
    return jsonResponse({ ok: false, mode, valid: false, ...summary }, 422);
  }

  if (mode === 'dry-run') {
    return jsonResponse({ ok: true, mode, valid: true, ...summary });
  }

  const result = await applyProductImport({
    payload: access.payload,
    plan,
    user: access.user,
  });

  return jsonResponse({
    ok: true,
    mode,
    valid: true,
    created: result.created,
    updated: result.updated,
    ...summary,
  });
}
