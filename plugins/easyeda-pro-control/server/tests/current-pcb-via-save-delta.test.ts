/** Source-derived delta and real private-issuer state with explicit original
 * owner/clock/body seams. No original native generation or SQL is created. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { compareCurrentPcbViaSaveDelta } from "../src/current-pcb-via-save-delta.ts";
import type { CurrentPcbViaSaveProjection } from "../src/current-pcb-via-save-projection.ts";

type CurrentPcbViaWritePlan = Parameters<typeof compareCurrentPcbViaSaveDelta>[0];
type NativeHistorySnapshot = Parameters<typeof compareCurrentPcbViaSaveDelta>[1];
type CurrentPcbViaProjectedEffect = Parameters<typeof compareCurrentPcbViaSaveDelta>[2];
type CurrentPcbViaSaveBodyValue = Parameters<typeof compareCurrentPcbViaSaveDelta>[3];
function invoke(fn: unknown, args: readonly unknown[]): Promise<unknown> { assert.ok(typeof fn === "function"); const result: unknown = Reflect.apply(fn, undefined, args); assert.ok(result instanceof Promise); return result; }
function fixture(): Readonly<{ plan: CurrentPcbViaWritePlan; history: NativeHistorySnapshot; effect: CurrentPcbViaProjectedEffect; value: CurrentPcbViaSaveBodyValue }> {
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), rawWindowsPath: "C:\\Synthetic\\Fixture.eprj2", expectedSourceSha256: "d".repeat(64) };
  const via = { netName: "" as const, xMil: 123.456789, yMil: -0.00000003, holeDiameterMil: 13.123456, diameterMil: 29.8754321,
    viaType: 0 as const, designRuleBlindViaName: "" as const, solderMaskExpansion: { topSolderMask: 0 as const, bottomSolderMask: 0 as const }, primitiveLock: false as const };
  const plan: CurrentPcbViaWritePlan = { schema: "private.current-pcb-via-write-plan.v1", operationId: "pcb209-via-write-synthetic-delta", target, initialLogicalSha256: "e".repeat(64), via,
    expectedNative: { family: "Via", net: "", x: via.xMil / 10, y: via.yMil / 10, radius: via.diameterMil / 10 / 2, holeRadius: via.holeDiameterMil / 10 / 2,
      type: 0, startLayer: 1, endLayer: 2, expansionType: 2, topExpansion: 0, bottomExpansion: 0, locked: false }, inverseAvailable: false, footprintDocumentAllocationRequired: false, footprintStructureWriterRequired: false };
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: target.projectUuid, branchUuid: target.branchUuid, headHistoryUuid: "f".repeat(32),
    checkpointSha256: target.expectedSourceSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1000, semanticSha256: "1".repeat(64), documents: [{ uuid: target.documentUuid, docType: "PCB",
      metadata: { editVersion: "3.2.209" }, semanticSha256: "2".repeat(64), records: [{ id: "META", type: "META", ticket: 1, client: "source", body: {} }, { id: "1111111111111111", type: "VIA", ticket: 2, client: "source", body: {} }] }] };
  const effect: CurrentPcbViaProjectedEffect = { schema: "easyeda-pro-control.pcb209-via-projected-effect.v1", operationId: plan.operationId, documentUuid: target.documentUuid, primitiveId: "3333333333333333",
    beforeProjectionSha256: "3".repeat(64), afterProjectionSha256: "4".repeat(64), baselineSourceRosterVerified: true, completeLoadedSceneRosterVerified: true, peerProjectionPreserved: true,
    actualSerializedSourceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false };
  const body = `{"type":"DOCHEAD","ticket":4}||{"docType":"PCB","client":"actual-client","uuid":"${target.documentUuid}","updateTime":1700000000123,"version":"1700000000123","editVersion":"3.2.209"}|\n` +
    '{"type":"VIA","ticket":3,"id":"3333333333333333"}||{"partitionId":"","groupId":0,"netName":"","ruleName":"","centerX":123.4568,"centerY":0,"holeDiameter":13.1235,"viaDiameter":29.8754,"viaType":"NORMAL","topSolderExpansion":0,"bottomSolderExpansion":0,"locked":false,"unusedInnerLayers":[]}';
  const value: CurrentPcbViaSaveBodyValue = { projectUuid: target.projectUuid, documentUuid: target.documentUuid, uniqueId: "actual-compiler", client: "actual-client", clock: 1_700_000_000_123,
    headTicket: 4, body, userUndefined: true, userJson: null }; return { plan, history, effect, value };
}
void test("the actual uniqueId delta has one new Via, source rounding and omitted zIndex without peer or SQL authority", () => {
  const f = fixture(); const delta = compareCurrentPcbViaSaveDelta(f.plan, f.history, f.effect, f.value);
  assert.equal(delta.sourceBody.centerX, 123.4568); assert.equal(JSON.stringify(delta.sourceBody.centerY), "0"); assert.equal(Object.hasOwn(delta.sourceBody, "zIndex"), false);
  assert.equal(delta.sourceBody.holeDiameter, 13.1235); assert.equal(delta.sourceBody.viaDiameter, 29.8754); assert.equal(delta.sourcePeerProjectionVerified, false); assert.equal(delta.selectedSqlAuthorized, false);
  for (const body of [`${f.value.body  }|\n`, f.value.body.replace('"unusedInnerLayers":[]', '"unusedInnerLayers":[],"zIndex":null'),
    f.value.body.replace('"ticket":3', '"ticket":2'), `${f.value.body  }|\n{"type":"META","ticket":3,"id":"META"}||{}`]) {
    assert.throws(() => compareCurrentPcbViaSaveDelta(f.plan, f.history, f.effect, { ...f.value, body }), /EXACT_BODY/u);
  }
  assert.throws(() => compareCurrentPcbViaSaveDelta(f.plan, f.history, f.effect, { ...f.value, headTicket: 5 }), /SOLE_CREATE_TICKET/u);
  assert.throws(() => compareCurrentPcbViaSaveDelta(f.plan, f.history, { ...f.effect, primitiveId: "1111111111111111" }, f.value), /BASELINE/u);
});
void test("the real late issuer keeps original clock/body/owner references and permits one issuance", async () => {
  const f = fixture(); const owner = Object.freeze({ explicitOriginalOwnerSeam: true }); const effect = Object.freeze({ proof: f.effect }); const clock = Object.freeze({ explicitOriginalClockSeam: true });
  const body = Object.freeze({ value: f.value, bodySha256: sha256Text(f.value.body) }); let current = true;
  const url = new URL("../src/current-pcb-via-save-projection.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { assertOriginalCurrentPcbViaWriteOwner: (o: unknown): void => { assert.equal(o, owner); assert.equal(current, true); },
      requireOriginalCurrentPcbViaWriteEffect: (e: unknown, o: unknown, p: unknown): CurrentPcbViaProjectedEffect => { assert.equal(e, effect); assert.equal(o, owner); assert.equal(p, f.plan); return f.effect; } }; }
    if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (p: unknown): unknown => { assert.equal(p, f.plan); return { history: f.history }; } }; }
    if (name === "./current-pcb-via-save-observer.ts") { return { requireOriginalCurrentPcbViaSaveBody: (b: unknown, o: unknown, p: unknown): void => { assert.equal(b, body); assert.equal(o, owner); assert.equal(p, f.plan); assert.equal(current, true); } }; }
    if (name === "./current-pcb-via-clock-observer.ts") { return { requireOriginalCurrentPcbViaClockBodyJoin: (c: unknown, b: unknown, o: unknown, p: unknown): void => { assert.equal(c, clock); assert.equal(b, body); assert.equal(o, owner); assert.equal(p, f.plan); assert.equal(current, true); } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const qualify = loaded.exports["qualifyOriginalCurrentPcbViaSaveProjection"], requireProjection = loaded.exports["requireOriginalCurrentPcbViaSaveProjection"]; assert.ok(typeof qualify === "function" && typeof requireProjection === "function");
  const token = await invoke(qualify, [owner, f.plan, effect, body, clock]); assert.ok(typeof token === "object" && token !== null);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The VM executes the real issuer with only the explicit original-reference seams above.
  const projection = token as CurrentPcbViaSaveProjection;
  assert.equal(projection.exactOriginalUniqueIdDeltaVerified, true); assert.equal(projection.selectedSqlAuthorized, false);
  const delta = await invoke(requireProjection, [projection, owner, f.plan]); assert.deepEqual(delta, compareCurrentPcbViaSaveDelta(f.plan, f.history, f.effect, f.value));
  await assert.rejects(invoke(requireProjection, [{ ...projection }, owner, f.plan]), /ORIGINAL_PROJECTION/u); await assert.rejects(invoke(qualify, [owner, f.plan, effect, body, clock]), /ORIGINAL_PROJECTION/u);
  current = false; await assert.rejects(invoke(requireProjection, [projection, owner, f.plan])); current = true;
});
