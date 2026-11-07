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
  const f = completeSyntheticSavedCacheFixture(true); const cdp = f.ledger.snapshot(), metadata = f.metadata.snapshot();
  const target = z.object({ rawWindowsPath: z.string(), projectUuid: z.string(), branchUuid: z.string(), sourceSha256: z.string() }).parse(f.prepared["target"]);
  const origin = Object.freeze({ inertInverseOrigin: true }), owner = Object.freeze({ inertInverseOwner: true }), prepared = Object.freeze({ inertForwardSavedData: true });
  const source = Object.freeze({ operationId: "footprint-forward-inert-backup", target: Object.freeze({ ...target, documentUuid: "c".repeat(16), expectedSourceSha256: target.sourceSha256 }),
    checkpoint: Object.freeze({ checkpointSha256: "6".repeat(64), sourceSha256: target.sourceSha256 }), before: Object.freeze({ checkpointSha256: "6".repeat(64), logicalSha256: "7".repeat(64) }) });
  let changed = false;
  const bindings = Object.freeze({ prepared, projectUuid: target.projectUuid,
    requireSnapshot: f.ledger.requireOriginalSnapshot.bind(f.ledger), requireMetadataSnapshot: f.metadata.requireOriginalSnapshot.bind(f.metadata),
    requirePacket: f.ledger.requireOriginalPacket.bind(f.ledger), requireMetadataPacket: f.metadata.requireOriginalPacket.bind(f.metadata) });
  const url = new URL("../src/current-footprint-inverse-cache-backup.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`), loaded: { exports: Record<string, unknown> } = { exports: {} }; assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-footprint-inverse-native-owner.ts" ? {
    originalCurrentFootprintInverseNativeSource: (actual: unknown): object => { assert.equal(actual, owner); assert.equal(changed, false); return source; },
    requireOriginalCurrentFootprintInverseCacheOrigin: (actual: unknown, actor: unknown, token: unknown): object => { assert.equal(actual, origin); assert.equal(actor, owner); assert.equal(token, prepared); return bindings; },
  } : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const call = (name: string, args: readonly unknown[]): unknown => { const fn = loaded.exports[name]; assert.ok(typeof fn === "function"); return Reflect.apply(fn, undefined, args); };
  return { call, build: (): unknown => call("buildCurrentFootprintInverseCacheBackupData", [owner, prepared, origin, cdp, metadata]), drift: (): void => { changed = true; } };
}
void test("inverse complete cache data publishes its own exact artifact once and admits no copied receipt", async () => {
  const f = await fixture(); const data = f.build();
  const parsed = z.object({ schema: z.literal("private.current-footprint-inverse-cache-backup-data.v1"), scope: z.object({ documentUuid: z.string().length(16) }), nativeProvenanceVerified: z.literal(false), cacheDeletionAuthorized: z.literal(false) }).parse(data);
  assert.equal(parsed.scope.documentUuid.length, 16);
  const first = f.call("publishCurrentFootprintInverseCacheBackupData", [data]); assert.ok(first instanceof Promise); assert.equal(f.call("publishCurrentFootprintInverseCacheBackupData", [data]), first);
  const published: unknown = await first; const receipt = z.object({ artifact: z.object({ path: z.string() }), cacheDeletionAuthorized: z.literal(false) }).parse(published);
  assert.equal(await readFile(receipt.artifact.path, "utf8"), `${canonicalJson(data)}\n`); await verified(f.call("verifyCurrentFootprintInverseCachePublishedData", [published, data]));
  assert.throws(() => f.call("publishCurrentFootprintInverseCacheBackupData", [structuredClone(data)]));
  const copied = structuredClone(published); await assert.rejects(verified(f.call("verifyCurrentFootprintInverseCachePublishedData", [copied, data])));
  await writeFile(receipt.artifact.path, "changed inert backup"); await assert.rejects(verified(f.call("verifyCurrentFootprintInverseCachePublishedData", [published, data])));
});
void test("inverse original source drift refuses publication before it can issue a receipt", async () => {
  const f = await fixture(); const data = f.build(); f.drift(); assert.throws(() => f.call("publishCurrentFootprintInverseCacheBackupData", [data]));
});
