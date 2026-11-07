/** Original-reference seams only. Full SQLite/crypto is tested by the shared
 * comparator; no native owner, helper, application or source file is created. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";

void test("closed schematic proof retains its one comparison and rejects copied or changed original references", async () => {
  const owner = Object.freeze({ historicalOwnerSeam: true }), qualification = Object.freeze({ initialQualificationSeam: true });
  const args = Object.freeze({ target: { pageUuid: "d".repeat(32) } }), termination = Object.freeze({ originalExitSeam: true });
  const snapshot = Object.freeze({ sourceSha256: "a".repeat(64), inventoryLogicalSha256: "b".repeat(64) });
  const before = Object.freeze({ beforeReaderSeam: true }); const after = Object.freeze({ logicalSha256: snapshot.inventoryLogicalSha256 });
  const prepared = Object.freeze({ qualification }); const captured = Object.freeze({ inventory: after });
  let effects: object = Object.freeze({ body: { body: "original body", bodySha256: "c".repeat(64), documentUuid: args.target.pageUuid, headTicket: 5 }, history: {}, structure: { ticket: 5 } });
  let comparisons = 0; const held = Promise.withResolvers<object>();
  const url = new URL("../src/generated-schematic-relevance-display-closed-proof.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-schematic-relevance-display-write-owner.ts") { return {
      originalCurrentSchematicRelevanceDisplayWriteTarget: (actual: unknown): object => { assert.equal(actual, owner); return prepared; },
      originalCurrentSchematicRelevanceDisplayClosedEffects: (actual: unknown, operation: unknown, exit: unknown): object => { assert.equal(actual, owner); assert.equal(operation, args); assert.equal(exit, termination); return effects; },
    }; }
    if (name === "./managed-schematic-relevance-fixture-initial-sql.ts") { return { originalGeneratedSchematicRelevanceFixtureInventory: (actual: unknown): object => { assert.equal(actual, qualification); return before; } }; }
    if (name === "./generated-schematic-relevance-display-closed-snapshot.ts") { return { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot: (actual: unknown, actor: unknown): object => { assert.equal(actual, snapshot); assert.equal(actor, owner); return captured; } }; }
    if (name === "./generated-project-closed-sql-delta.ts") { return { compareGeneratedProjectClosedSqlDelta: (initial: unknown, closed: unknown, body: unknown): Promise<object> => { assert.equal(initial, before); assert.equal(closed, after); assert.equal(body, "original body"); comparisons += 1; return held.promise; } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const qualify = loaded.exports["qualifyOriginalGeneratedSchematicRelevanceDisplayClosedSql"]; const lookup = loaded.exports["requireOriginalGeneratedSchematicRelevanceDisplayClosedSql"];
  assert.ok(typeof qualify === "function" && typeof lookup === "function");
  const first: unknown = Reflect.apply(qualify, undefined, [owner, args, termination, snapshot]);
  assert.ok(first instanceof Promise); assert.equal(Reflect.apply(qualify, undefined, [owner, args, termination, snapshot]), first); assert.equal(comparisons, 1);
  held.resolve({ afterLogicalSha256: after.logicalSha256, bodySha256: "c".repeat(64), structureSha256: "e".repeat(64) });
  const proof: unknown = await first; assert.ok(proof !== null && typeof proof === "object");
  assert.equal(Reflect.get(proof, "liveContinuationAuthorized"), false); assert.equal(Reflect.get(proof, "reopenedVerified"), false);
  assert.notEqual(Reflect.apply(lookup, undefined, [proof, owner, args]), undefined);
  assert.throws(() => Reflect.apply(lookup, undefined, [structuredClone(proof), owner, args]));
  assert.throws(() => Reflect.apply(lookup, undefined, [proof, owner, { ...args }]));
  effects = Object.freeze({ ...effects }); assert.throws(() => Reflect.apply(lookup, undefined, [proof, owner, args]));
  assert.throws(() => Reflect.apply(qualify, undefined, [owner, args, termination, snapshot])); assert.equal(comparisons, 1);
});
