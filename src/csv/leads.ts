import type { Lead, Product, User } from '../payload-types';
import { serializeCsv } from './csv';

/**
 * Lead CSV export (CP-6.1, docs/API.md §4).
 *
 * One row per lead, with quote lines flattened into a readable column. Cells go
 * through the shared serialiser, so a message beginning with `=` cannot run in
 * a spreadsheet. The export is staff-only and audited by the route.
 */

export const LEAD_CSV_COLUMNS = [
  'created_at',
  'type',
  'lead_status',
  'name',
  'phone',
  'email',
  'city',
  'area',
  'property_type',
  'pest_type',
  'preferred_time',
  'message',
  'quote_items',
  'assigned_to',
  'notes',
  'consent',
  'source_path',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'retain_until',
] as const;

function assignedLabel(assignedTo: Lead['assignedTo']): string {
  if (!assignedTo) return '';
  if (typeof assignedTo === 'object') return (assignedTo as User).email ?? '';
  return String(assignedTo);
}

function itemsLabel(items: Lead['items']): string {
  return (items ?? [])
    .map((item) => {
      const product = typeof item.product === 'object' ? (item.product as Product) : null;
      const title = product?.title ?? (item.product ? `#${item.product}` : '');
      const pack = item.packLabel ? ` (${item.packLabel})` : '';
      return `${title}${pack} × ${item.quantity}`;
    })
    .filter(Boolean)
    .join('; ');
}

export function exportLeadsCsv(leads: Lead[]): string {
  return serializeCsv(
    LEAD_CSV_COLUMNS,
    leads.map((lead) => [
      lead.createdAt,
      lead.type,
      lead.leadStatus,
      lead.name,
      lead.phone,
      lead.email,
      lead.city,
      lead.area,
      lead.propertyType,
      lead.pestType,
      lead.preferredTime,
      lead.message,
      itemsLabel(lead.items),
      assignedLabel(lead.assignedTo),
      lead.notes?.length ?? 0,
      lead.consent ? 'yes' : 'no',
      lead.sourcePath,
      lead.referrer,
      lead.utm?.source,
      lead.utm?.medium,
      lead.utm?.campaign,
      lead.retainUntil,
    ]),
  );
}
