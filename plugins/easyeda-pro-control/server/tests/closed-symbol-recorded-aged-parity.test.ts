import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../src/', import.meta.url);
function captureBody(text: string): string { return text.slice(text.indexOf('function capture('), text.indexOf('\nfunction clock(')); }
for (const [name, digest] of [
  ['closed-symbol-recorded-witness.ts', '4ca56ec62042fdb116540e9f8ab4700ef616bce6f9d89dcb9e37d20a51fa8005'],
  ['closed-symbol-recorded-witness-baseline.ts', '64b0b59893a09998947348eddc4f5ddcbfda2926fe60f2c6ddc49aa46f34cefe'],
  ['closed-symbol-recorded-sql.ts', '2bec69ba26831f824dfb10a2c27ce6a21f559a4a9e1833f0d490edce7b9bd04d'],
  ['closed-symbol-terminal-shape.ts', 'c6e1d08ab833acb4b7aad64c199f100f11a02b1dc4dec927b311017c645e60c8'],
] as const) {
  void test(`maintained locked bytes remain exact: ${name}`, async () => {
    const bytes = await readFile(new URL(name, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), digest);
  });
}
void test('aged SQL body differs only in imports, export name and exact eligibility guards', async () => {
  const locked = await readFile(new URL('closed-symbol-recorded-sql.ts', root), 'utf8');
  const expected = locked
    .replaceAll('reconstructClosedSymbolSqlEvidence', 'reconstructAgedClosedSymbolSqlEvidence')
    .replace('!Object.hasOwn(witness, "agedHead")', 'Object.hasOwn(witness, "agedHead") && witness.agedHead !== undefined')
    .replace('first historical profile requires the exact locked witness', 'aged historical profile requires its exact aged witness')
    .replace('sqlPlan.headEligibility === "locked"', 'sqlPlan.headEligibility === "aged-unlocked"')
    .replace('only the locked-head historical profile is admitted', 'only the aged-unlocked historical profile is admitted');
  assert.equal(await readFile(new URL('../src/closed-symbol-recorded-aged-sql.ts', import.meta.url), 'utf8'), expected);
});
void test('preserved pre-fix calendar parser is byte-identical to the locked subset parser', async () => {
  const locked = await readFile(new URL('closed-symbol-recorded-witness.ts', root), 'utf8');
  const oldAged = await readFile(new URL('helpers/recorded-witness-calendar-baseline.txt', import.meta.url), 'utf8');
  assert.ok(captureBody(locked).length > 1000); assert.equal(oldAged, `${captureBody(locked)}\n`);
});
