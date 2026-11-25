import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, TRANSLATIONS } from './i18n.ts';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      keys.push(`${path}[len:${v.length}]`);
      v.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          keys.push(...collectKeys(item as Record<string, unknown>, `${path}[${idx}]`));
        } else {
          assert.equal(typeof item, 'string');
          assert.ok(String(item).trim().length > 0, `Empty string at ${path}[${idx}]`);
        }
      });
    } else if (typeof v === 'object' && v !== null) {
      keys.push(...collectKeys(v as Record<string, unknown>, path));
    } else {
      assert.equal(typeof v, 'string', `Expected string at ${path}`);
      assert.ok(String(v).trim().length > 0, `Empty string at ${path}`);
      keys.push(path);
    }
  }
  return keys;
}

test('all 5 regional & default languages have identical complete translation trees', () => {
  assert.deepEqual(
    LANGUAGES.map((l) => l.code),
    ['en', 'hi', 'mr', 'vrh', 'gon'],
  );

  const baseKeys = collectKeys(TRANSLATIONS.en as unknown as Record<string, unknown>).sort();
  for (const lang of LANGUAGES) {
    const langKeys = collectKeys(
      TRANSLATIONS[lang.code] as unknown as Record<string, unknown>,
    ).sort();
    assert.deepEqual(langKeys, baseKeys, `Key mismatch in language: ${lang.code}`);
  }
});
