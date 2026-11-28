import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload } from 'payload';

import { getServerURL } from '../auth/invites';

/**
 * Lead lifecycle hooks (CP-6.1, docs/DATABASE.md §2, docs/API.md §3).
 *
 * Two jobs, kept out of the collection config so they can be unit-tested:
 * stamping the facts a lead must carry (consent time, retention deadline) and
 * alerting staff when a new lead arrives. The alert is best-effort: a mail
 * failure is recorded on the lead, never thrown back at the visitor.
 */

type LeadDoc = Record<string, unknown> & { id?: number | string };

const DEFAULT_RETENTION_MONTHS = 24;

/** Reads the retention setting with server access; falls back to the documented default. */
async function retentionMonths(payload: Payload): Promise<number> {
  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    });
    const months = settings.retentionMonths;
    return typeof months === 'number' && months >= 1 && months <= 60
      ? months
      : DEFAULT_RETENTION_MONTHS;
  } catch {
    return DEFAULT_RETENTION_MONTHS;
  }
}

function addMonths(from: Date, months: number): Date {
  const result = new Date(from);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * On create: record when consent was given and when the lead must be deleted.
 * Retention starts at the arrival time, not at the first status change, so an
 * untouched lead cannot live forever.
 */
export const stampLead: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data;

  const now = new Date();
  const months = await retentionMonths(req.payload);

  return {
    ...data,
    ...(data.consent && !data.consentAt ? { consentAt: now.toISOString() } : {}),
    retainUntil: data.retainUntil ?? addMonths(now, months).toISOString(),
  };
};

const TYPE_LABELS: Record<string, string> = {
  contact: 'contact message',
  quote: 'quote request',
  inspection: 'inspection request',
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function line(label: string, value: unknown): string {
  const text = String(value ?? '').trim();
  return text ? `${label}: ${text}` : '';
}

/** Recipients from the settings global; `LEADS_ALERT_TO` is the fallback only. */
async function alertRecipients(payload: Payload): Promise<string[]> {
  const fromSettings = new Set<string>();

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    });
    for (const recipient of settings.leadAlertRecipients ?? []) {
      const email = typeof recipient === 'object' && recipient ? recipient.email : null;
      if (typeof email === 'string' && email.trim()) fromSettings.add(email.trim());
    }
  } catch {
    // Settings unavailable: the environment fallback still applies.
  }

  if (fromSettings.size > 0) return [...fromSettings];

  return (process.env.LEADS_ALERT_TO ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

function alertSubject(doc: LeadDoc): string {
  const type = TYPE_LABELS[String(doc.type ?? '')] ?? 'lead';
  const name = String(doc.name ?? '').trim();
  const subject = name ? `New ${type} from ${name}` : `New ${type}`;
  return subject.slice(0, 120);
}

function alertBody(doc: LeadDoc): { text: string; html: string } {
  const type = TYPE_LABELS[String(doc.type ?? '')] ?? 'lead';
  const items = Array.isArray(doc.items) ? doc.items : [];

  const lines = [
    `A new ${type} arrived through the website.`,
    '',
    line('Name', doc.name),
    line('Phone', doc.phone),
    line('Email', doc.email),
    line('City', doc.city),
    line('Area', doc.area),
    line('Property', doc.propertyType),
    line('Pest', doc.pestType),
    line('Preferred time', doc.preferredTime),
    line('Items', items.length),
    line('Message', doc.message),
    '',
    `Open the inbox: ${getServerURL()}/admin/collections/leads/${doc.id ?? ''}`,
  ].filter((entry, index, all) => entry !== '' || all[index - 1] !== '');

  return {
    text: lines.join('\n'),
    html: `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(
      lines.join('\n'),
    )}</pre>`,
  };
}

/**
 * After create: email the configured staff, then record the outcome on the
 * lead so the inbox shows whether anyone was told. Never throws — a new lead
 * must still be saved when the mail provider is down.
 */
export const alertOnLeadCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc;

  const payload = req.payload;
  const lead = doc as LeadDoc;

  try {
    const recipients = await alertRecipients(payload);

    if (recipients.length === 0) {
      payload.logger.warn(
        `Lead ${lead.id} saved, but no alert recipients are configured (site settings or LEADS_ALERT_TO).`,
      );
      return doc;
    }

    const { text, html } = alertBody(lead);
    await payload.sendEmail({
      to: recipients.join(','),
      subject: alertSubject(lead),
      text,
      html,
    });

    await payload.update({
      collection: 'leads',
      id: lead.id as number,
      data: { alertSentAt: new Date().toISOString(), alertError: null },
      depth: 0,
      overrideAccess: true,
    });
  } catch (error) {
    payload.logger.error(
      `Lead ${lead.id} alert failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    try {
      await payload.update({
        collection: 'leads',
        id: lead.id as number,
        data: {
          alertError: (error instanceof Error ? error.message : 'Email alert failed').slice(0, 400),
        },
        depth: 0,
        overrideAccess: true,
      });
    } catch {
      // The lead is saved; a record of the failure is a bonus, not a requirement.
    }
  }

  return doc;
};
