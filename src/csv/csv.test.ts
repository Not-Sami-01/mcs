import { describe, expect, it } from 'vitest';

import { CsvError, formulaSafe, parseCsv, parseCsvRecords, serializeCsv } from './csv';

describe('parseCsv', () => {
  it('reads plain and quoted fields', () => {
    const rows = parseCsv('slug,title\r\none,"A, quoted title"\r\ntwo,"Line\nbreak"\r\n');

    expect(rows).toEqual([
      ['slug', 'title'],
      ['one', 'A, quoted title'],
      ['two', 'Line\nbreak'],
    ]);
  });

  it('unescapes doubled quotes and strips a BOM', () => {
    expect(parseCsv('\uFEFFa,b\n"say ""hi""",2')).toEqual([
      ['a', 'b'],
      ['say "hi"', '2'],
    ]);
  });

  it('drops blank rows and rejects broken quoting', () => {
    expect(parseCsv('a,b\n\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
    expect(() => parseCsv('a,"b')).toThrow(CsvError);
    expect(() => parseCsv('a,b"c')).toThrow(/Unexpected quote/);
    expect(() => parseCsv('   ')).toThrow(/empty/);
  });
});

describe('parseCsvRecords', () => {
  it('keys values by a lowercased, trimmed header and reports file rows', () => {
    const records = parseCsvRecords(' Slug , Rate\n one , 500\n', ['slug', 'rate']);

    expect(records).toEqual([{ rowNumber: 2, values: { slug: 'one', rate: '500' } }]);
  });

  it('rejects a missing required column, duplicate headers and short rows', () => {
    expect(() => parseCsvRecords('slug\none\n', ['slug', 'rate'])).toThrow(/missing the "rate"/);
    expect(() => parseCsvRecords('slug,slug\none,two\n', ['slug'])).toThrow(/duplicate/);
    expect(() => parseCsvRecords('a,b\n1,2,3\n', ['a'])).toThrow(/more cells/);
  });
});

describe('serializeCsv', () => {
  it('quotes separators, quotes and newlines', () => {
    const csv = serializeCsv(
      ['a', 'b'],
      [
        ['one, two', 'say "hi"'],
        ['line\nbreak', 3],
      ],
    );

    expect(csv).toBe('a,b\r\n"one, two","say ""hi"""\r\n"line\nbreak",3\r\n');
  });

  it('neutralises spreadsheet formulas in every value cell', () => {
    expect(formulaSafe('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(formulaSafe('+92')).toBe("'+92");
    expect(formulaSafe('-1')).toBe("'-1");
    expect(formulaSafe('@cmd')).toBe("'@cmd");
    expect(formulaSafe('safe')).toBe('safe');

    const csv = serializeCsv(['title'], [['=HYPERLINK("http://x")']]);
    expect(csv).toContain('"\'=HYPERLINK(""http://x"")"');
  });
});
