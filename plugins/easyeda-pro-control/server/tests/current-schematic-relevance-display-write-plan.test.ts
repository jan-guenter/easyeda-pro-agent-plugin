/** Explicit closed-data assertion seam. No native factory, source file import,
 * app, writer or completion token is supplied by this fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { currentSchematicRelevanceDisplayWriteActionSchema, currentSchematicRelevanceDisplayWriteRequestSchema, currentSchematicRelevanceDisplayWriteResultSchema } from "../src/current-schematic-relevance-display-write-contract.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

const request = Object.freeze({ schema: "easyeda-pro-control.schematic209-relevance-display-write-request.v1", operationId: "sch209-relevance-display-vm-test", patch: Object.freeze({ x: 25, bold: true }) });
async function fixture(block?: Promise<unknown>): Promise<Readonly<{ prepare: (...args: unknown[]) => unknown; lookup: (...args: unknown[]) => unknown; prepared: object; argumentsValue: object; invalidate: () => void }>> {
  const argumentsValue = data().args, prepared = Object.freeze({ explicitSyntheticClosedCheckpoint: true }); let current = true;
  const url = new URL("../src/current-schematic-relevance-display-write-plan.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  const checkpoint = (value: unknown): void => { assert.equal(value, prepared); if (!current) { throw new Error("SYNTHETIC_CLOSED_CHECKPOINT_CHANGED"); } };
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./managed-schematic-relevance-fixture-open-checkpoint.ts") { return { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint: checkpoint,
      verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint: async (value: unknown): Promise<void> => { checkpoint(value); await block; } }; }
    if (name === "./generated-schematic-relevance-display-source.ts") { return {
      buildGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, operationId: unknown, patch: unknown): object => { checkpoint(value); assert.equal(operationId, request.operationId); assert.deepEqual(patch, request.patch); return argumentsValue; },
      requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, source: unknown): void => { checkpoint(source); assert.equal(value, argumentsValue); },
    }; }
    return sourceRequire(name);
  }, loaded, loaded.exports]);
  const lookup = loaded.exports["requireOriginalCurrentSchematicRelevanceDisplayWritePlan"], prepare = loaded.exports["prepareCurrentSchematicRelevanceDisplayWritePlan"]; assert.ok(typeof lookup === "function" && typeof prepare === "function");
  return Object.freeze({ prepare: (...args: unknown[]): unknown => Reflect.apply(prepare, undefined, args), lookup: (...args: unknown[]): unknown => Reflect.apply(lookup, undefined, args), prepared, argumentsValue, invalidate: (): void => { current = false; } });
}
void test("strict seven-record writer grammar admits only bounded display data and its own confirmation family", () => {
  const prepare = { action: "prepare", fixtureOperationId: "synthetic-relevance-fixture", operationId: request.operationId, patch: request.patch };
  assert.doesNotThrow(() => currentSchematicRelevanceDisplayWriteActionSchema.parse(prepare));
  for (const extra of [{ target: {} }, { owner: {} }, { source: {} }, { rawWindowsPath: "C:\\unselected.eprj2" }]) { assert.throws(() => currentSchematicRelevanceDisplayWriteActionSchema.parse({ ...prepare, ...extra })); }
  for (const operationId of ["sch209-display-old-six-record-test", `${request.operationId}\n`]) { assert.throws(() => currentSchematicRelevanceDisplayWriteActionSchema.parse({ ...prepare, operationId })); }
  assert.throws(() => currentSchematicRelevanceDisplayWriteRequestSchema.parse({ ...request, patch: { ...request.patch, placement: {} } }));
  const execute = { action: "execute", operationId: request.operationId, confirmDisposableDisplayTransaction: true, confirmOneSave: true, confirmForwardOnly: true, acceptNormalOpenEffects: true };
  assert.doesNotThrow(() => currentSchematicRelevanceDisplayWriteActionSchema.parse(execute));
  assert.throws(() => currentSchematicRelevanceDisplayWriteActionSchema.parse({ ...execute, confirmOneSave: false }));
});
void test("original data plan retains the exact checkpoint and arguments; copied or Proxy tokens cannot enter its registry", async () => {
  const f = await fixture(); const token: unknown = await Reflect.apply(f.prepare, undefined, [f.prepared, request]); assert.ok(token !== null && typeof token === "object");
  const original: unknown = Reflect.apply(f.lookup, undefined, [token]); assert.ok(original !== null && typeof original === "object" && "prepared" in original && "argumentsValue" in original);
  assert.equal(original.prepared, f.prepared); assert.equal(original.argumentsValue, f.argumentsValue); assert.ok(Object.isFrozen(token)); assert.ok("executionAuthorized" in token && token.executionAuthorized === false);
  assert.throws(() => Reflect.apply(f.lookup, undefined, [structuredClone(token)]), /ORIGINAL_PLAN/u);
  let traps = 0; const proxy = new Proxy({}, { get: (): never => { traps += 1; throw new Error("UNEXPECTED_GET"); }, getOwnPropertyDescriptor: (): never => { traps += 1; throw new Error("UNEXPECTED_DESCRIPTOR"); } });
  assert.throws(() => Reflect.apply(f.lookup, undefined, [proxy]), /ORIGINAL_PLAN/u); assert.equal(traps, 0);
});
void test("checkpoint drift across original verification rejects preparation before issuing a plan", async () => {
  const barrier = Promise.withResolvers<true>(), f = await fixture(barrier.promise);
  const pending: unknown = Reflect.apply(f.prepare, undefined, [f.prepared, request]); assert.ok(pending instanceof Promise);
  f.invalidate(); barrier.resolve(true); await assert.rejects(pending, /CLOSED_CHECKPOINT_CHANGED/u);
});
void test("public result grammar rejects Save or completion claims without its preceding facts", () => {
  const value = { schema: "easyeda-pro-control.schematic209-relevance-display-write-operation.v1", action: "inspect", operationId: request.operationId, state: "prepared",
    effects: { modifyAttempted: false, modifyAcknowledged: false, saveAttempted: false, saveOutcome: "not-attempted" },
    verification: { saved: false, reopened: false, completeSqlVerified: false, peerRosterPreserved: false },
    cleanup: { generation: "none", allocation: "not-entered", nativeResourcesRetained: false, abortAttempted: false, originalTerminationVerified: false, helperReleaseVerified: false, publicationPending: false }, forwardOnly: true, inverseAvailable: false };
  assert.doesNotThrow(() => currentSchematicRelevanceDisplayWriteResultSchema.parse(value));
  assert.throws(() => currentSchematicRelevanceDisplayWriteResultSchema.parse({ ...value, effects: { ...value.effects, saveAttempted: true, saveOutcome: "acknowledged" } }));
  assert.throws(() => currentSchematicRelevanceDisplayWriteResultSchema.parse({ ...value, state: "completed" }));
  assert.throws(() => currentSchematicRelevanceDisplayWriteResultSchema.parse({ ...value, verification: { ...value.verification, reopened: true } }));
});
