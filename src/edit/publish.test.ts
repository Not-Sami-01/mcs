import { describe, expect, it } from 'vitest';

import type { Page } from '@/payload-types';
import { collectPublishProblems, parseScheduleWindow } from './publish';

function page(overrides: Partial<Page> = {}): Page {
  return {
    id: 1,
    title: 'Test page',
    slug: 'test',
    path: 'test',
    template: 'standard',
    seo: { metaTitle: 'Test title', metaDescription: 'Test description' },
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Hello',
        paragraphs: [{ paragraph: 'Body text' }],
      },
    ],
    updatedAt: '',
    createdAt: '',
    ...overrides,
  } as Page;
}

describe('publish gates', () => {
  it('passes a page with metadata and clean copy', () => {
    expect(collectPublishProblems(page())).toEqual([]);
  });

  it('requires a meta title and description', () => {
    const problems = collectPublishProblems(page({ seo: {} }));
    expect(problems.map((problem) => problem.field)).toEqual([
      'seo.metaTitle',
      'seo.metaDescription',
    ]);
  });

  it('blocks TODO(client) placeholders anywhere in the layout', () => {
    const problems = collectPublishProblems(
      page({
        layout: [
          {
            blockType: 'textBlocks',
            headline: 'TODO(client): real headline',
            paragraphs: [{ paragraph: 'Body' }],
          },
        ],
      }),
    );
    expect(problems.some((problem) => problem.message.includes('TODO(client)'))).toBe(true);
  });

  it('accepts a future schedule and rejects invalid or inverted windows', () => {
    const now = new Date('2026-11-26T10:00:00.000Z');

    expect(parseScheduleWindow({ publishAt: '2026-11-26T11:00:00.000Z', now })).toMatchObject({
      ok: true,
      window: { unpublishAt: null },
    });

    expect(
      parseScheduleWindow({
        publishAt: '2026-11-26T11:00:00.000Z',
        unpublishAt: '2026-12-01T11:00:00.000Z',
        now,
      }).ok,
    ).toBe(true);

    expect(parseScheduleWindow({ publishAt: '2026-11-26T09:00:00.000Z', now }).ok).toBe(false);
    expect(parseScheduleWindow({ publishAt: 'not-a-date', now }).ok).toBe(false);
    expect(
      parseScheduleWindow({
        publishAt: '2026-11-26T11:00:00.000Z',
        unpublishAt: '2026-11-26T11:00:00.000Z',
        now,
      }).ok,
    ).toBe(false);
  });

  it('requires proof notes on trust stats but ignores hidden sections', () => {
    const trust = {
      blockType: 'trustStrip' as const,
      items: [{ statValue: '10+', statLabel: 'Years', proofNote: '' }],
    };

    const visible = collectPublishProblems(page({ layout: [trust] }));
    expect(visible.some((problem) => problem.field.includes('proofNote'))).toBe(true);

    const hidden = collectPublishProblems(page({ layout: [{ ...trust, hidden: true } as never] }));
    expect(hidden.some((problem) => problem.field.includes('proofNote'))).toBe(false);
  });
});
