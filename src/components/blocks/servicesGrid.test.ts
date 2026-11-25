import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Service } from '@/payload-types';

import { ServicesGrid } from './ServicesGrid';

const services = [
  {
    id: 1,
    title: 'Termite control',
    slug: 'termite-control',
    shortDescription: 'Termite service.',
  },
  {
    id: 2,
    title: 'General pest control',
    slug: 'general-pest',
    shortDescription: 'General service.',
  },
  { id: 3, title: 'Rodent control', slug: 'rodent-control', shortDescription: 'Rodent service.' },
] as unknown as Service[];

describe('ServicesGrid', () => {
  it('lists every published service in automatic mode', () => {
    const html = renderToStaticMarkup(
      createElement(ServicesGrid, {
        block: { blockType: 'servicesGrid', headline: 'Our services', mode: 'auto' },
        services,
      }),
    );

    expect(html).toContain('Our services');
    expect(html).toContain('/services/termite-control');
    expect(html).toContain('/services/general-pest');
    expect(html).toContain('/services/rodent-control');
  });

  it('keeps the editor selection order and drops unknown ids in manual mode', () => {
    const html = renderToStaticMarkup(
      createElement(ServicesGrid, {
        block: {
          blockType: 'servicesGrid',
          headline: 'Picked services',
          mode: 'manual',
          services: [3, 999, 1],
        },
        services,
      }),
    );

    expect(html.indexOf('/services/rodent-control')).toBeLessThan(
      html.indexOf('/services/termite-control'),
    );
    expect(html).not.toContain('/services/general-pest');
    expect(html).not.toContain('/services/undefined');
  });

  it('renders nothing when there are no published services', () => {
    const html = renderToStaticMarkup(
      createElement(ServicesGrid, {
        block: { blockType: 'servicesGrid', headline: 'Our services', mode: 'auto' },
        services: [],
      }),
    );

    expect(html).toBe('');
  });
});
