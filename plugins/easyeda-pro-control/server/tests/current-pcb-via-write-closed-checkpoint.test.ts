/* oxlint-disable import/max-dependencies -- Explicit historical issuer seams are joined to real managed artifacts, complete SQL and checkpoint creation/verification. */
/** No native owner, Save, worker or browser cache is exercised. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "../src/artifacts.ts";
import { sha256Text } from "../src/core.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

async function fixture(): Promise<Readonly<{ prepare: () => Promise<unknown>; copyPlanRefused: () => void; lookup: (value: object) => unknown; verify: (value: object) => Promise<unknown>; changeSource: () => Promise<void> }>> {
  const input = await managedFixtureInitialSqlFixture(); const bytes = await readFile(input.syntheticDatabasePath);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "pcb-via-closed-checkpoint-fixture"));
  const sourceSnapshot = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.eprj2`), "Synthetic original closed data", bytes, "pcb-via-closed-checkpoint-fixture", (): Promise<void> => Promise.resolve());
  const owner = Object.freeze({ explicitHistoricalOwnerSeam: true }), plan = Object.freeze({ operationId: "pcb209-via-write-checkpoint-fixture", target: { rawWindowsPath: input.rawWindowsPath, projectUuid: sha256Text(input.rawWindowsPath), branchUuid: "3".repeat(32), documentUuid: "d".repeat(32) } });
  const captured = Object.freeze({ inventory: input.inventory, sourceSnapshot }), snapshot = Object.freeze({ sourceSha256: sourceSnapshot.sha256 }), sql = Object.freeze({ sourceSha256: sourceSnapshot.sha256 });
  const url = new URL("../src/current-pcb-via-write-closed-checkpoint.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name); assert.ok(actual !== null && typeof actual === "object");
    if (name === "./core.ts") { return { ...actual, normalizeEasyedaProjectPath: (raw: string): string => { assert.equal(raw, input.rawWindowsPath); return input.syntheticDatabasePath; } }; }
    if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (value: unknown): object => { assert.equal(value, plan); return {}; } }; }
    if (name === "./current-pcb-via-write-closed-snapshot.ts") { return { requireOriginalCurrentPcbViaWriteClosedSnapshot: (value: unknown, actor: unknown, operation: unknown): object => { assert.equal(value, snapshot); assert.equal(actor, owner); assert.equal(operation, plan); return captured; } }; }
    if (name === "./current-pcb-via-write-closed-proof.ts") { return { requireOriginalCurrentPcbViaWriteClosedSql: (value: unknown, actor: unknown, operation: unknown): object => { assert.equal(value, sql); assert.equal(actor, owner); assert.equal(operation, plan); return { afterLogicalSha256: input.inventory.logicalSha256 }; } }; }
    return actual;
  }, loaded, loaded.exports]);
  const lookup = loaded.exports["requireOriginalCurrentPcbViaWriteClosedCheckpoint"], prepare = loaded.exports["prepareCurrentPcbViaWriteClosedCheckpoint"], verify = loaded.exports["verifyCurrentPcbViaWriteClosedCheckpoint"];
  assert.ok(typeof prepare === "function" && typeof lookup === "function" && typeof verify === "function");
  return Object.freeze({ prepare: (): Promise<unknown> => { const result: unknown = Reflect.apply(prepare, undefined, [owner, plan, snapshot, sql]); assert.ok(result instanceof Promise); return result; },
    copyPlanRefused: (): void => { assert.throws(() => Reflect.apply(prepare, undefined, [owner, { ...plan }, snapshot, sql])); },
    lookup: (value: object): unknown => Reflect.apply(lookup, undefined, [value]), verify: (value: object): Promise<unknown> => { const result: unknown = Reflect.apply(verify, undefined, [value]); assert.ok(result instanceof Promise); return result; },
    changeSource: async (): Promise<void> => { const changed = Buffer.from(bytes); changed[100] = changed[100] === 0 ? 1 : 0; await writeFile(input.syntheticDatabasePath, changed); } });
}
void test("distinct closed checkpoint retains original Promise and complete SQL projection without issuing cache/open authority", async () => {
  const f = await fixture(); f.copyPlanRefused(); const first = f.prepare(), second = f.prepare(); assert.equal(first, second);
  const prepared = await first; assert.ok(prepared !== null && typeof prepared === "object"); assert.equal(await second, prepared);
  assert.equal(Reflect.get(prepared, "cacheMutationAuthorized"), false); assert.equal(Reflect.get(prepared, "freshOpeningAuthorized"), false);
  assert.notEqual(f.lookup(prepared), undefined); await f.verify(prepared); assert.throws(() => { f.lookup(structuredClone(prepared)); }, /CLOSED_CHECKPOINT_ORIGINAL/u);
  await f.changeSource(); await assert.rejects(f.verify(prepared)); assert.equal(f.prepare(), first);
});
void test("source changed before the retained checkpoint cannot issue or retry a new closed checkpoint", async () => {
  const f = await fixture(); await f.changeSource(); const first = f.prepare(); await assert.rejects(first); assert.equal(f.prepare(), first);
});
