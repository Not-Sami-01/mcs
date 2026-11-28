import { describe, expect, it, vi } from 'vitest';

import { alertOnLeadCreate, stampLead } from './hooks';

const lead = {
  id: 12,
  type: 'inspection' as const,
  name: 'Ayesha',
  phone: '0300 1234567',
  email: 'ayesha@example.com',
  city: 'Lahore',
  message: 'Termites in the kitchen.',
};

function fakePayload(settings: Record<string, unknown> = {}) {
  return {
    findGlobal: vi.fn().mockResolvedValue({ retentionMonths: 24, ...settings }),
    sendEmail: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
  };
}

describe('stampLead', () => {
  it('adds the consent time and a retention deadline on create', async () => {
    const data = await stampLead({
      data: { consent: true },
      operation: 'create',
      req: { payload: fakePayload() },
    } as never);

    expect(data.consentAt).toBeTruthy();
    const months =
      (new Date(String(data.retainUntil)).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44);
    expect(months).toBeGreaterThan(23);
    expect(months).toBeLessThan(25);
  });

  it('does not rewrite a lead on update', async () => {
    const original = { consent: true, retainUntil: '2028-01-01T00:00:00.000Z' };
    const data = await stampLead({
      data: original,
      operation: 'update',
      req: { payload: fakePayload() },
    } as never);

    expect(data).toEqual(original);
  });

  it('uses the configured retention period', async () => {
    const data = await stampLead({
      data: {},
      operation: 'create',
      req: { payload: fakePayload({ retentionMonths: 6 }) },
    } as never);

    const months =
      (new Date(String(data.retainUntil)).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44);
    expect(months).toBeGreaterThan(5);
    expect(months).toBeLessThan(7);
  });
});

describe('alertOnLeadCreate', () => {
  it('emails the configured recipients once and records that it was sent', async () => {
    const payload = fakePayload({
      leadAlertRecipients: [{ email: 'owner@example.com' }, { email: 'sales@example.com' }],
    });

    await alertOnLeadCreate({
      doc: lead,
      operation: 'create',
      req: { payload },
    } as never);

    expect(payload.sendEmail).toHaveBeenCalledTimes(1);
    const sent = payload.sendEmail.mock.calls[0][0];
    expect(sent.to).toBe('owner@example.com,sales@example.com');
    expect(sent.subject).toContain('Ayesha');
    expect(sent.text).toContain('Termites in the kitchen.');
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ alertSentAt: expect.any(String) }),
      }),
    );
  });

  it('falls back to LEADS_ALERT_TO when the settings list is empty', async () => {
    vi.stubEnv('LEADS_ALERT_TO', 'fallback@example.com');
    const payload = fakePayload({ leadAlertRecipients: [] });

    await alertOnLeadCreate({ doc: lead, operation: 'create', req: { payload } } as never);

    expect(payload.sendEmail.mock.calls[0][0].to).toBe('fallback@example.com');
    vi.unstubAllEnvs();
  });

  it('keeps the lead and records an error when the email fails', async () => {
    const payload = fakePayload({ leadAlertRecipients: [{ email: 'owner@example.com' }] });
    payload.sendEmail.mockRejectedValueOnce(new Error('provider down'));

    const returned = await alertOnLeadCreate({
      doc: lead,
      operation: 'create',
      req: { payload },
    } as never);

    expect(returned).toBe(lead);
    expect(payload.logger.error).toHaveBeenCalled();
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { alertError: 'provider down' } }),
    );
  });

  it('does nothing on update', async () => {
    const payload = fakePayload();

    await alertOnLeadCreate({ doc: lead, operation: 'update', req: { payload } } as never);

    expect(payload.sendEmail).not.toHaveBeenCalled();
  });
});
