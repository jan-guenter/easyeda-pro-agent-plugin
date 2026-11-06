/** Synthetic data-leaf and explicit original-lookup-seam regressions. These
 * tests issue no native owner, SDK call, Save or connected evidence. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { compareCurrentPcbViaProjectedEffect, compareCurrentPcbViaReopenedModel } from "../src/current-pcb-via-write-effect-data.ts";
import type { CurrentPcb209SpatialTrackResult } from "../src/current-pcb-209-spatial-track-read.ts";
import type { CurrentPcbViaWritePlan } from "../src/current-pcb-via-write-plan.ts";
import { MANAGED_FIXTURE_LINE_BODY, MANAGED_FIXTURE_VIA_BODY } from "../src/managed-fixture-generator.ts";

type NativeHistorySnapshot = Parameters<typeof compareCurrentPcbViaProjectedEffect>[1];
function fixture(): Readonly<{ plan: CurrentPcbViaWritePlan; history: NativeHistorySnapshot; before: Record<string, unknown>; after: Record<string, unknown>;
  beforeScene: CurrentPcb209SpatialTrackResult; afterScene: CurrentPcb209SpatialTrackResult; ack: Readonly<Record<string, unknown>> }> {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), rawWindowsPath: "C:\\Synthetic\\Fixture.eprj2", expectedSourceSha256: "d".repeat(64) };
  const via = { netName: "" as const, xMil: 123.45, yMil: -345.67, holeDiameterMil: 13.123, diameterMil: 29.875, viaType: 0 as const,
    designRuleBlindViaName: "" as const, solderMaskExpansion: { topSolderMask: 0 as const, bottomSolderMask: 0 as const }, primitiveLock: false as const };
  const plan: CurrentPcbViaWritePlan = { schema: "private.current-pcb-via-write-plan.v1", operationId: "pcb209-via-write-synthetic-effect", target,
    initialLogicalSha256: "e".repeat(64), via, expectedNative: { family: "Via", net: "", x: via.xMil / 10, y: via.yMil / 10,
      radius: via.diameterMil / 10 / 2, holeRadius: via.holeDiameterMil / 10 / 2, type: 0, startLayer: 1, endLayer: 2, expansionType: 2, topExpansion: 0, bottomExpansion: 0, locked: false },
    inverseAvailable: false, footprintDocumentAllocationRequired: false, footprintStructureWriterRequired: false };
  const row = { primitiveId: "1111111111111111", primitiveType: "Via", primitiveLock: false, net: "", x: 0, y: 0, holeDiameter: 100, diameter: 200,
    viaType: 0, designRuleBlindViaName: "", startLayer: 1, endLayer: 2, maskExpansionMode: 2, topMaskExpansion: 0, bottomMaskExpansion: 0 };
  const line = { primitiveId: "2222222222222222", primitiveType: "Line", primitiveLock: false, net: "", layer: 1, startX: 500, startY: 0, endX: 1500, endY: 0, lineWidth: 100 };
  const added = { ...row, primitiveId: "3333333333333333", x: plan.expectedNative.x * 10, y: plan.expectedNative.y * 10,
    holeDiameter: plan.expectedNative.holeRadius * 10 * 2, diameter: plan.expectedNative.radius * 10 * 2 };
  const packet = (vias: readonly unknown[]): Record<string, unknown> => ({ schema: "easyeda-pro-control.pcb209-primitives-observation.v1",
    target: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, tabId: `${target.documentUuid}@${target.projectUuid}` },
    families: [["Line", [line]], ["Arc", []], ["Via", vias], ["String", []]].map(([family, entries]) => {
      assert.ok(typeof family === "string" && Array.isArray(entries));
      return { family, method: `eda.pcb_Primitive${family}.getAll`, primitiveIds: entries.map((entry: unknown) => {
        assert.ok(typeof entry === "object" && entry !== null && "primitiveId" in entry); return entry.primitiveId;
      }), rows: entries, observedRowCount: entries.length };
    }), samples: 2, matchingSamples: true });
  const scene = (count: 1 | 2): CurrentPcb209SpatialTrackResult => ({ schema: "easyeda-pro-control.pcb209-spatial-line-via-read.v1", documentUuid: target.documentUuid,
    query: { kind: "region", mode: "inside", leftMil: -10_000_000, rightMil: 10_000_000, bottomMil: -10_000_000, topMil: 10_000_000 },
    identities: [{ primitiveId: row.primitiveId, family: "Via" }, { primitiveId: line.primitiveId, family: "Line" }, ...(count === 2 ? [{ primitiveId: added.primitiveId, family: "Via" as const }] : [])],
    sceneViaCount: count, sceneLineCount: 1, selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true,
    retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true, allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ",
    scope: "standalone-line-via-ready-bbox-scene-no-region-border-crossings", nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false,
    sourceMembershipVerified: false, persistenceVerified: false });
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: target.projectUuid, branchUuid: target.branchUuid,
    headHistoryUuid: "f".repeat(32), checkpointSha256: target.expectedSourceSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1000,
    semanticSha256: "1".repeat(64), documents: [{ uuid: target.documentUuid, docType: "PCB", metadata: {}, semanticSha256: "2".repeat(64), records: [
      { id: "META", type: "META", ticket: 1, client: "a", body: {} }, { id: row.primitiveId, type: "VIA", ticket: 2, client: "a", body: MANAGED_FIXTURE_VIA_BODY },
      { id: line.primitiveId, type: "LINE", ticket: 3, client: "a", body: MANAGED_FIXTURE_LINE_BODY }] }] };
  return { plan, history, before: packet([row]), after: packet([row, added]), beforeScene: scene(1), afterScene: scene(2),
    ack: { schema: "easyeda-pro-control.pcb209-via-write-stage.v1", stage: "create", ok: true, dispatchAttempted: true, originalPromiseAcknowledged: true,
      primitiveId: added.primitiveId, createAttempted: true, createAcknowledged: true, saveAttempted: false, saveAcknowledged: false, inverseAvailable: false, persistenceVerified: false } };
}
function compare(f: ReturnType<typeof fixture>): ReturnType<typeof compareCurrentPcbViaProjectedEffect> {
  return compareCurrentPcbViaProjectedEffect(f.plan, f.history, f.before, f.after, f.beforeScene, f.afterScene, f.ack);
}
void test("one original-create-shaped Via preserves the complete generated loaded roster without claiming SQL authority", () => {
  const f = fixture(); const proof = compare(f); assert.equal(proof.completeLoadedSceneRosterVerified, true); assert.equal(proof.baselineSourceRosterVerified, true);
  assert.equal(proof.actualSerializedSourceVerified, false); assert.equal(proof.selectedSqlAuthorized, false); assert.equal(proof.persistenceVerified, false);
  assert.equal(proof.inverseAvailable, false); assert.equal(proof.primitiveId, f.ack["primitiveId"]);
});
void test("scene omissions, foreign ACKs and native peer drift refuse the effect", () => {
  const original = fixture();
  assert.throws(() => compare({ ...original, afterScene: { ...original.afterScene, sceneViaCount: 3 } }));
  assert.throws(() => compare({ ...original, ack: { ...original.ack, primitiveId: "foreign" } }));
  const changed = structuredClone(original.after); assert.ok(Array.isArray(changed["families"]));
  const line: unknown = changed["families"][0]; assert.ok(typeof line === "object" && line !== null && "rows" in line && Array.isArray(line.rows));
  const first: unknown = line.rows[0]; assert.ok(typeof first === "object" && first !== null && "lineWidth" in first); first.lineWidth = 101;
  assert.throws(() => compare({ ...original, after: changed }));
  assert.throws(() => compare({ ...original, afterScene: { ...original.afterScene, selectedPrimitiveIds: ["1111111111111111"] } }));
  assert.throws(() => compare({ ...original, beforeScene: { ...original.beforeScene, query: { kind: "point", xMil: 0, yMil: 0 } } }));
});
void test("the binding rejects copied effects and foreign original references at its explicit native-lookup seam", async () => {
  const f = fixture(), owner = Object.freeze({ explicitSyntheticOwnerSeam: true });
  const observations = { before: { value: f.before }, after: { value: f.after }, beforeScene: { value: f.beforeScene }, afterScene: { value: f.afterScene }, createAcknowledgement: f.ack };
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  // Evaluate the actual central custody region with only the explicit original
  // Native lookup/plan seams below; no native factory or helper is allocated.
  const central = await readFile(url, "utf8");
  const begin = "// BEGIN original Via projected-effect custody.", end = "// END original Via projected-effect custody.";
  assert.equal(central.split(begin).length, 2); assert.equal(central.split(end).length, 2);
  const source = `import {canonicalJson} from "./core.ts";import {freezeDeep} from "./sqlite-inventory-core.ts";
import {compareCurrentPcbViaProjectedEffect} from "./current-pcb-via-write-effect-data.ts";
import {requireOriginalCurrentPcbViaWritePlan} from "./current-pcb-via-write-plan.ts";
import {requireOriginalCurrentPcbViaNativeObservation,requireOriginalCurrentPcbViaSceneObservation,requireOriginalCurrentPcbViaWriteStage} from "./current-pcb-via-write-owner.ts";
${central.slice(central.indexOf(begin) + begin.length, central.indexOf(end))}`;
  const output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  const original = (actualOwner: unknown, plan: unknown, packet: unknown, phase: "before" | "after", kind: "native" | "scene"): unknown => {
    assert.equal(actualOwner, owner); assert.equal(plan, f.plan);
    const expected = kind === "native" ? observations[phase] : observations[phase === "before" ? "beforeScene" : "afterScene"];
    assert.equal(packet, expected); return expected.value;
  };
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (plan: unknown): unknown => { assert.equal(plan, f.plan); return { history: f.history }; } }; }
    if (name === "./current-pcb-via-write-owner.ts") { return {
      requireOriginalCurrentPcbViaNativeObservation: (o: unknown, p: unknown, packet: unknown, phase: "before" | "after"): unknown => original(o, p, packet, phase, "native"),
      requireOriginalCurrentPcbViaSceneObservation: (o: unknown, p: unknown, packet: unknown, phase: "before" | "after"): unknown => original(o, p, packet, phase, "scene"),
      requireOriginalCurrentPcbViaWriteStage: (o: unknown, p: unknown, packet: unknown, phase: unknown): unknown => {
        assert.equal(o, owner); assert.equal(p, f.plan); assert.equal(packet, f.ack); assert.equal(phase, "create"); return f.ack;
      } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const qualify = loaded.exports["qualifyOriginalCurrentPcbViaWriteEffect"], requireEffect = loaded.exports["requireOriginalCurrentPcbViaWriteEffect"];
  assert.ok(typeof qualify === "function" && typeof requireEffect === "function");
  assert.throws(() => Reflect.apply(qualify, undefined, [owner, f.plan, { ...observations, after: { ...observations.after } }]));
  const effect: unknown = Reflect.apply(qualify, undefined, [owner, f.plan, observations]); assert.ok(typeof effect === "object" && effect !== null);
  assert.notEqual(Reflect.apply(requireEffect, undefined, [effect, owner, f.plan]), undefined);
  assert.throws(() => Reflect.apply(requireEffect, undefined, [{ ...effect }, owner, f.plan]));
  assert.throws(() => Reflect.apply(requireEffect, undefined, [effect, {}, f.plan]));
  assert.throws(() => Reflect.apply(qualify, undefined, [owner, f.plan, observations]));
});

void test("fresh reopened data matches the historical effect and complete scene without inheriting runtime selection", () => {
  const f = fixture(); const actual = structuredClone(f.after), fresh = { ...structuredClone(f.afterScene), selectedPrimitiveIds: [f.afterScene.identities[0]?.primitiveId ?? "missing"] };
  const result = compareCurrentPcbViaReopenedModel(f.plan, f.after, actual, f.afterScene, fresh);
  assert.equal(result.exactFourFamilyModelMatched, true); assert.equal(result.completeLineViaSceneMatched, true);
  assert.equal(result.freshSelectionCompared, false); assert.equal(result.persistenceVerified, false); assert.equal(result.executionAuthorized, false);
});
void test("reopened geometry changes, omitted members and foreign complete-scene identities refuse", () => {
  const f = fixture(); assert.throws(() => compareCurrentPcbViaReopenedModel(f.plan, f.after, f.before, f.afterScene, f.beforeScene));
  assert.throws(() => compareCurrentPcbViaReopenedModel(f.plan, f.after, f.after, f.afterScene, { ...f.afterScene, identities: f.afterScene.identities.slice(1) }));
  const changed = structuredClone(f.after); assert.ok(Array.isArray(changed["families"]));
  const family: unknown = changed["families"][2]; assert.ok(family !== null && typeof family === "object" && "rows" in family && Array.isArray(family.rows));
  const row: unknown = family.rows[1]; assert.ok(row !== null && typeof row === "object"); Reflect.set(row, "x", 999);
  assert.throws(() => compareCurrentPcbViaReopenedModel(f.plan, f.after, changed, f.afterScene, f.afterScene));
});
