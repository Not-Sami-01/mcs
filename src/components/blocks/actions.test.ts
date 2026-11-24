import { describe, expect, it } from 'vitest';

import { resolveAction } from './BlockAction';

const contacts = {
  phone: { href: 'tel:+923001234567', display: '+92 300 123 4567' },
  whatsapp: { href: 'https://wa.me/923001234567' },
};

const none = { phone: null, whatsapp: null };

describe('resolveAction', () => {
  it('uses saved contact facts for call and WhatsApp actions', () => {
    expect(resolveAction({ label: 'Call', kind: 'call', href: 'ignored' }, contacts)).toEqual({
      label: 'Call',
      kind: 'call',
      href: 'tel:+923001234567',
      external: true,
    });
    expect(
      resolveAction({ label: 'WhatsApp', kind: 'whatsapp', href: 'ignored' }, contacts),
    ).toEqual({
      label: 'WhatsApp',
      kind: 'whatsapp',
      href: 'https://wa.me/923001234567',
      external: true,
    });
  });

  it('hides call and WhatsApp when no number is saved', () => {
    expect(resolveAction({ label: 'Call', kind: 'call', href: 'ignored' }, none)).toBeNull();
    expect(
      resolveAction({ label: 'WhatsApp', kind: 'whatsapp', href: 'ignored' }, none),
    ).toBeNull();
  });

  it('maps inspection actions to the internal form page', () => {
    expect(
      resolveAction({ label: 'Book', kind: 'inspection', href: 'ignored' }, none),
    ).toMatchObject({ href: '/free-inspection', external: false });
  });

  it('accepts safe links and rejects unsafe schemes', () => {
    expect(resolveAction({ label: 'About', kind: 'link', href: '/about-us' }, none)).toMatchObject({
      href: '/about-us',
      external: false,
    });
    expect(
      resolveAction({ label: 'Email', kind: 'link', href: 'mailto:hello@example.com' }, none),
    ).toMatchObject({ external: true });

    for (const href of ['javascript:alert(1)', 'data:text/html,x', '//evil.example']) {
      expect(resolveAction({ label: 'Bad', kind: 'link', href }, none)).toBeNull();
    }
  });

  it('rejects a blank label', () => {
    expect(resolveAction({ label: '  ', kind: 'link', href: '/about-us' }, none)).toBeNull();
  });
});
