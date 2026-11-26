import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { COLLECTIONS } from '../collections';
import { GLOBALS } from '../globals';
import { USER_ROLES, type UserRole } from './roles';

/**
 * Generated from the role table in docs/DATABASE.md §4 (CP-2.3): one case per
 * cell, for every collection and global that exists in code. Adding a
 * collection without a documented row — or changing an access helper without
 * changing the table — fails the suite.
 */

const doc = readFileSync(new URL('../../docs/DATABASE.md', import.meta.url), 'utf8');
const start = doc.indexOf('## 4. Role access matrix');
const end = doc.indexOf('## 5. Migrations');
const section = doc.slice(start, end);

function parseMatrix(): Map<string, Map<UserRole, string>> {
  const rows = new Map<string, Map<UserRole, string>>();

  for (const line of section.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 5) continue;

    const slug = cells[0].replaceAll('`', '');
    if (slug === 'Collection' || /^-+$/.test(slug)) continue;

    rows.set(slug, new Map(USER_ROLES.map((role, index) => [role, cells[index + 1]])));
  }

  return rows;
}

const matrix = parseMatrix();
const OP_LETTER = { create: 'C', read: 'R', update: 'U', delete: 'D' } as const;
const userFor = (role: UserRole) => ({ id: 7, roles: [role] });

describe('role access matrix (generated from docs/DATABASE.md §4)', () => {
  it('parses every documented row', () => {
    expect(matrix.size).toBeGreaterThanOrEqual(COLLECTIONS.length + GLOBALS.length);
    for (const collection of COLLECTIONS) {
      expect(matrix.has(collection.slug), `${collection.slug} needs a docs row`).toBe(true);
    }
    for (const global of GLOBALS) {
      expect(matrix.has(global.slug), `${global.slug} needs a docs row`).toBe(true);
    }
  });

  for (const collection of COLLECTIONS) {
    it(`${collection.slug}: every role and operation matches the table`, () => {
      const row = matrix.get(collection.slug);
      expect(row).toBeDefined();

      for (const role of USER_ROLES) {
        const documented = row!.get(role)!;

        for (const [op, letter] of Object.entries(OP_LETTER) as [
          keyof typeof OP_LETTER,
          string,
        ][]) {
          const access = collection.access?.[op];
          expect(access, `${collection.slug}.${op} must define access`).toBeTypeOf('function');

          const result = access!({ req: { user: userFor(role) } } as never);
          const allowed = documented.includes(letter);

          if (allowed) {
            // `R self` returns a where constraint rather than `true`; a
            // constraint is still an allow, narrowed to the actor.
            expect(result, `${collection.slug}.${op} should allow ${role}`).not.toBe(false);
          } else {
            expect(result, `${collection.slug}.${op} should deny ${role}`).toBe(false);
          }
        }
      }
    });
  }

  for (const global of GLOBALS) {
    it(`${global.slug}: every role matches the table, public read stays open`, () => {
      const row = matrix.get(global.slug);
      expect(row).toBeDefined();

      for (const role of USER_ROLES) {
        const documented = row!.get(role)!;
        const access = global.access?.update;
        expect(access, `${global.slug}.update must define access`).toBeTypeOf('function');

        const result = access!({ req: { user: userFor(role) } } as never);
        if (documented.includes('U')) {
          expect(result, `${global.slug} should allow ${role}`).toBe(true);
        } else {
          expect(result, `${global.slug} should deny ${role}`).toBe(false);
        }
      }

      const publicRead = global.access?.read?.({ req: { user: null } } as never);
      expect(publicRead, `${global.slug} must stay publicly readable`).toBe(true);
    });
  }
});

describe('anonymous access (docs/DATABASE.md §4: published public reads only)', () => {
  const publicReads: Record<string, true | 'published' | false> = {
    users: false,
    media: true,
    categories: true,
    pages: 'published',
    services: 'published',
    locations: 'published',
    products: 'published',
    posts: 'published',
    'price-history': false,
    'audit-logs': false,
  };

  for (const collection of COLLECTIONS) {
    it(`${collection.slug}: anonymous reads follow the public rule, writes are denied`, () => {
      expect(publicReads[collection.slug], `add an anonymous expectation`).toBeDefined();
      const expected = publicReads[collection.slug];

      for (const op of ['create', 'update', 'delete'] as const) {
        const result = collection.access?.[op]?.({ req: { user: null } } as never);
        expect(result, `anonymous ${collection.slug}.${op} must be denied`).toBe(false);
      }

      const read = collection.access?.read?.({ req: { user: null } } as never);
      if (expected === true) {
        expect(read).toBe(true);
      } else if (expected === 'published') {
        expect(read).toEqual({ _status: { equals: 'published' } });
      } else {
        expect(read).toBe(false);
      }
    });
  }
});
