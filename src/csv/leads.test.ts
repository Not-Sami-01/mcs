import { describe, expect, it } from 'vitest';

import { exportLeadsCsv, LEAD_CSV_COLUMNS } from './leads';

const base = {
  id: 1,
  type: 'contact' as const,
  name: 'Ayesha',
  phone: '0300 1234567',
  email: 'ayesha@example.com',
  city: 'Lahore',
  area: 'Model Town',
  leadStatus: 'new' as const,
  consent: true,
  createdAt: '2026-11-28T10:00:00.000Z',
  updatedAt: '2026-11-28T10:00:00.000Z',
};

describe('lead CSV export', () => {
  it('writes one header row and one row per lead', () => {
    const csv = exportLeadsCsv([
      { ...base, message: 'Two rooms, please.' },
      { ...base, id: 2, name: 'Bilal' },
    ] as never);

    const [header, first, second] = csv.trimEnd().split('\r\n');
    expect(header).toBe(LEAD_CSV_COLUMNS.join(','));
    expect(first).toContain('Ayesha');
    expect(second).toContain('Bilal');
  });

  it('neutralises spreadsheet formulas in visitor-supplied text', () => {
    const csv = exportLeadsCsv([{ ...base, message: '=HYPERLINK("https://evil.test")' }] as never);
    expect(csv).toContain(`'=HYPERLINK`);
    expect(csv).not.toMatch(/(^|,)\s*=/m);
  });

  it('flattens quote items and counts notes', () => {
    const csv = exportLeadsCsv([
      {
        ...base,
        type: 'quote',
        items: [{ product: { id: 4, title: 'Termite Gel' }, packLabel: '250 ml', quantity: 2 }],
        notes: [{ text: 'one' }, { text: 'two' }],
      },
    ] as never);

    expect(csv).toContain('Termite Gel (250 ml) × 2');
    expect(csv).toContain(',2,');
  });
});
