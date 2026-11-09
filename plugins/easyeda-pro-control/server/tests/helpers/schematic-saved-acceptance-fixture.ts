/** Synthetic issuers only. The unchanged production acceptance join performs
 * no native requests; this fixture supplies no genuine saved-load evidence. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { acceptOriginalCurrentSchematicRelevanceSavedReadback as Accept,
  requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance as Require } from "../../src/current-schematic-relevance-saved-readback-acceptance.ts";

export async function acceptanceFixture(): Promise<Readonly<{
  accept: typeof Accept; require: typeof Require; inputs: Parameters<typeof Accept>;
  state: { released: boolean; normalClose: boolean; sceneTextId: string };
  earlier: Readonly<{ persistenceVerified: false; reopenedVerified: false }>;
}>> {
  const url = new URL("../../src/current-schematic-relevance-saved-readback-acceptance.ts", import.meta.url);
  const actualRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  const state = { released: true, normalClose: true, sceneTextId: "text" };
  const binding = Object.freeze({ original: true });
  const owner = Object.freeze({ status: () => ({ released: state.released, helperClosed: state.released, closeConsumed: true, busy: false, binding }) });
  const cold = Object.freeze({ syntheticCold: true }), origin = Object.freeze({ syntheticOrigin: true }), scene = Object.freeze({ syntheticScene: true });
  const earlier = Object.freeze({ persistenceVerified: false as const, reopenedVerified: false as const });
  const closed = Object.freeze({ ...earlier, sourceSha256: "a".repeat(64), inventoryLogicalSha256: "b".repeat(64) });
  const prepared = Object.freeze({ syntheticPrepared: true });
  const normalClose = Object.freeze({ syntheticNormalClose: true });
  const termination = Object.freeze({ syntheticTermination: true });
  const target = Object.freeze({ projectUuid: "project", branchUuid: "branch", pageUuid: "page", schematicUuid: "schematic", sourceSha256: closed.sourceSha256 });
  const loading = Object.freeze({ headHistoryUuid: "head", sourceSha256: "c".repeat(64) });
  const savedOperation = Object.freeze({ textId: "text" });
  const savedArgs = Object.freeze({ operation: savedOperation });
  const vacuumProjection = Object.freeze({ sourceLogicalSha256: closed.inventoryLogicalSha256 });
  const checkpoint = Object.freeze({ vacuumProjection });
  const savedClosed = Object.freeze({ args: savedArgs, checkpoint });
  const savedData = Object.freeze({ target, loading, operationId: "operation" });
  const plan = Object.freeze({ data: savedData, closed: savedClosed });
  const native = { assertOriginalCurrentSchematicRelevanceSavedReadbackOwner: (actual: unknown): void => { assert.equal(actual, owner); },
    originalCurrentSchematicRelevanceSavedReadbackTarget: (actual: unknown): unknown => { assert.equal(actual, owner); return prepared; },
    originalCurrentSchematicRelevanceSavedReadbackNormalClose: (actual: unknown): unknown => { assert.equal(actual, owner); assert.equal(state.normalClose, true); return normalClose; },
    originalCurrentSchematicRelevanceSavedReadbackTermination: (actual: unknown): unknown => { assert.equal(actual, owner); return termination; } };
  const modules: Record<string, unknown> = {
    "./current-schematic-relevance-saved-readback-owner.ts": native,
    "./generated-schematic-relevance-saved-readback-plan.ts": { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan: (actual: unknown): unknown => { assert.equal(actual, prepared); return plan; } },
    "./current-schematic-relevance-saved-cold-origin.ts": { requireOriginalCurrentSchematicRelevanceSavedColdObservation: (actual: unknown, actualOwner: unknown, actualPrepared: unknown): unknown => {
      assert.equal(actual, cold); assert.equal(actualOwner, owner); assert.equal(actualPrepared, prepared);
      return { prepared, originalNativeCompletionAcknowledged: true, selectedSqlStayedReadonly: true, data: { ...target, ...loading, exactCipherAndPlaintextChunks: 2, emptyLocalIndexObserved: true, originalReadyAndResumeObserved: true } };
    } },
    "./current-schematic-relevance-saved-scene-controller.ts": { requireOriginalCurrentSchematicRelevanceSavedSceneObservation: (actual: unknown, actualOwner: unknown, actualOrigin: unknown): unknown => {
      assert.equal(actual, scene); assert.equal(actualOwner, owner); assert.equal(actualOrigin, origin);
      return { projection: { ...target, operationId: "operation", textId: state.sceneTextId, sourceSha256: "d".repeat(64), exactProjectedTextBodyVerified: true, completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true } };
    } },
    "./current-schematic-relevance-saved-readback-closed-proof.ts": { requireOriginalCurrentSchematicRelevanceSavedReadbackClosedData: (actual: unknown, actualOwner: unknown): unknown => {
      assert.equal(actual, closed); assert.equal(actualOwner, owner); return { sourceSnapshot: { sha256: closed.sourceSha256 }, rawHistory: {}, inventory: { logicalSha256: closed.inventoryLogicalSha256 } };
    } },
  };
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(modules, name) ? modules[name] : actualRequire(name) as unknown, loaded, loaded.exports]);
  assert.equal(typeof loaded.exports["acceptOriginalCurrentSchematicRelevanceSavedReadback"], "function");
  assert.equal(typeof loaded.exports["requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance"], "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit synthetic issuer seams above retain the actual production join; no value reaches a native owner or genuine registry.
  return { accept: loaded.exports["acceptOriginalCurrentSchematicRelevanceSavedReadback"], require: loaded.exports["requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance"], inputs: [owner, cold, origin, scene, closed], state, earlier } as unknown as Awaited<ReturnType<typeof acceptanceFixture>>;
}
