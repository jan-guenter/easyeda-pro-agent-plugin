/** Real managed publication over inert completed ledger data. The substituted
 * original-lookup seam issues no genuine owner, checkpoint or native grant. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { z } from "zod";
import { canonicalJson } from "../src/core.ts";
import { completeSyntheticSavedCacheFixture } from "./helpers/current-pcb-via-saved-cache-fixture.ts";

function verified(value: unknown): Promise<unknown> { assert.ok(value instanceof Promise); return value; }
async function fixture(): Promise<Readonly<{ call: (name: string, args: readonly unknown[]) => unknown; build: () => unknown; drift: () => void }>> {
  const f = completeSyntheticSavedCacheFixture(true, `C:\\Synthetic\\Codex_schematic_relevance_${"2".repeat(16)}.eprj2`); const cdp = f.ledger.snapshot(), metadata = f.metadata.snapshot();
  const target = z.object({ rawWindowsPath: z.string(), projectUuid: z.string(), branchUuid: z.string(), sourceSha256: z.string() }).parse(f.prepared["target"]);
  const origin = Object.freeze({ inertSchematicCacheOrigin: true }), owner = Object.freeze({ inertSchematicCacheOwner: true }), prepared = Object.freeze({ inertSchematicReadbackPlan: true });
  const data = Object.freeze({ operationId: "sch209-relevance-display-inert-backup", target: Object.freeze({ ...target, pageUuid: "c".repeat(32), schematicUuid: "d".repeat(32) }), loading: Object.freeze({ sourceSha256: target.sourceSha256, logicalSha256: "7".repeat(64) }) });
  const preparationCheckpoint = Object.freeze({ sha256: "6".repeat(64) }); const checkpoint = Object.freeze({ target, preparationCheckpoint });
  const closed = Object.freeze({ checkpoint }); const source = Object.freeze({ data, closed });
  let changed = false;
  const bindings = Object.freeze({ prepared, projectUuid: target.projectUuid,
    requireSnapshot: f.ledger.requireOriginalSnapshot.bind(f.ledger), requireMetadataSnapshot: f.metadata.requireOriginalSnapshot.bind(f.metadata),
    requirePacket: f.ledger.requireOriginalPacket.bind(f.ledger), requireMetadataPacket: f.metadata.requireOriginalPacket.bind(f.metadata) });
  const url = new URL("../src/current-schematic-relevance-saved-cache-backup.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`), loaded: { exports: Record<string, unknown> } = { exports: {} }; assert.ok(typeof evaluate === "function");
  const require = (name: string): unknown => { if (name === "./current-schematic-relevance-saved-readback-owner.ts") { return {
    originalCurrentSchematicRelevanceSavedReadbackTarget: (actual: unknown): object => { assert.equal(actual, owner); assert.equal(changed, false); return prepared; },
    requireOriginalCurrentSchematicRelevanceSavedCacheOrigin: (actual: unknown, actor: unknown, token: unknown): object => { assert.equal(actual, origin); assert.equal(actor, owner); assert.equal(token, prepared); return bindings; },
  }; } if (name === "./generated-schematic-relevance-saved-readback-plan.ts") { return { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan: (actual: unknown): object => { assert.equal(actual, prepared); assert.equal(changed, false); return source; } }; } return sourceRequire(name) as unknown; };
  Reflect.apply(evaluate, undefined, [require, loaded, loaded.exports]);
  const call = (name: string, args: readonly unknown[]): unknown => { const fn = loaded.exports[name]; assert.ok(typeof fn === "function"); return Reflect.apply(fn, undefined, args); };
  return { call, build: (): unknown => call("buildCurrentSchematicRelevanceSavedCacheBackupData", [owner, prepared, origin, cdp, metadata]), drift: (): void => { changed = true; } };
}
void test("schematic complete cache data publishes its own exact artifact once and admits no copied receipt", async () => {
  const f = await fixture(); const data = f.build();
  const parsed = z.object({ schema: z.literal("private.current-schematic-relevance-saved-cache-backup-data.v1"), scope: z.object({ pageUuid: z.string().length(32), schematicUuid: z.string().length(32) }), nativeProvenanceVerified: z.literal(false), cacheDeletionAuthorized: z.literal(false) }).parse(data);
  assert.equal(parsed.scope.pageUuid.length, 32);
  const first = f.call("publishCurrentSchematicRelevanceSavedCacheBackupData", [data]); assert.ok(first instanceof Promise); assert.equal(f.call("publishCurrentSchematicRelevanceSavedCacheBackupData", [data]), first);
  const published: unknown = await first; const receipt = z.object({ artifact: z.object({ path: z.string() }), cacheDeletionAuthorized: z.literal(false) }).parse(published);
  assert.equal(await readFile(receipt.artifact.path, "utf8"), `${canonicalJson(data)}\n`); await verified(f.call("verifyCurrentSchematicRelevanceSavedCachePublishedData", [published, data]));
  assert.throws(() => f.call("publishCurrentSchematicRelevanceSavedCacheBackupData", [structuredClone(data)]));
  const copied = structuredClone(published); await assert.rejects(verified(f.call("verifyCurrentSchematicRelevanceSavedCachePublishedData", [copied, data])));
  await writeFile(receipt.artifact.path, "changed inert backup"); await assert.rejects(verified(f.call("verifyCurrentSchematicRelevanceSavedCachePublishedData", [published, data])));
});
void test("schematic original source drift refuses publication before it can issue a receipt", async () => {
  const f = await fixture(); const data = f.build(); f.drift(); assert.throws(() => f.call("publishCurrentSchematicRelevanceSavedCacheBackupData", [data]));
});
