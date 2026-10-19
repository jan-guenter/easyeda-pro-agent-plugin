/** Source-bound snapshot contract tests. Storage and original baseline issuance
 * are private VM seams; no real CAD, native helper or production token is used.
 */
/* oxlint-disable import/max-dependencies -- Exercise the actual snapshot source with original synthetic closure authority and explicitly isolated storage boundaries. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import type { CurrentSchematicRenameBaseline } from "../src/current-schematic-rename-owner-baseline.ts";
import type { CurrentSchematicRenameSnapshot, CurrentSchematicRenameSnapshotEvidence, CurrentSchematicRenameSnapshotInput,
  assertOriginalCurrentSchematicRenameSnapshot, captureCurrentSchematicRenameFinishSnapshot, captureCurrentSchematicRenameVerificationSnapshot,
  revalidateCurrentSchematicRenameSnapshot } from "../src/current-schematic-rename-snapshot.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "../src/engine.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import { isNativeDocumentDeleted } from "../src/native-history.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

interface Api {
  finish: typeof captureCurrentSchematicRenameFinishSnapshot;
  verify: typeof captureCurrentSchematicRenameVerificationSnapshot;
  original: typeof assertOriginalCurrentSchematicRenameSnapshot;
  revalidate: typeof revalidateCurrentSchematicRenameSnapshot;
}
function observeOnly(event: CurrentSchematicRenameSnapshotEvidence): void { assert.ok(Object.isFrozen(event)); }
async function fixture(): Promise<{
  api: Api; engine: EasyedaControlEngine; baseline: CurrentSchematicRenameBaseline; input: CurrentSchematicRenameSnapshotInput;
  events: CurrentSchematicRenameSnapshotEvidence[];
  state: { scoped: boolean; released: boolean; storageCalls: number; cloneReader: boolean; receiptDrift: boolean; historyPatch: Record<string, unknown> };
  next: () => Promise<CurrentSchematicRenameSnapshotInput>;
  run: (hook?: (event: CurrentSchematicRenameSnapshotEvidence) => void) => Promise<CurrentSchematicRenameSnapshot>;
}> {
  const historyPatch: Record<string, unknown> = {};
  const state = { scoped: false, released: false, storageCalls: 0, cloneReader: false, receiptDrift: false, historyPatch };
  const operationId = "synthetic-schematic-snapshot", target = { projectUuid: "project", branchUuid: "branch", ownerUuid: "owner", schematicUuid: "schematic" };
  const identity = { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" };
  const baselineData = { owner: { operationId }, intent: { target }, checkpoint: { source: "/synthetic/source.eprj2", sourceIdentity: identity },
    copy: { source: "/synthetic/source.eprj2", closureProofSha256: "old-proof", receiptSha256: "old-copy" } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This baseline is admitted only by the private VM seam, never by the production issuer.
  const baseline = baselineData as unknown as CurrentSchematicRenameBaseline;
  const native = closedSessionFixture(), runtime = await syntheticSqlRuntime();
  const clocks = new WeakMap<object, object>(), issuedClocks = new WeakSet<object>();
  const engineValue = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): unknown => state.scoped ? { unexpected: "scope" } : undefined },
    assertRecoveryOperationIsolated: (value: unknown): Promise<void> => { assert.equal(value, operationId); return Promise.resolve(); },
    clockObservationForClosedCapture: (value: object): Promise<object> => {
      assert.equal(state.released, false, "Synthetic capture released"); const clock = clocks.get(value);
      assert.ok(clock, "Synthetic original capture required"); return Promise.resolve(clock);
    } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real engine owner cannot be replaced by this source-realm test double.
  const engine = engineValue as unknown as EasyedaControlEngine;
  async function makeInput(phase: "closed-edit" | "closed-verification", sequence: number): Promise<CurrentSchematicRenameSnapshotInput> {
    const binding = await native.capture({ ...INPUT, operationId, orphanPhase: phase, bindingSha256: sha256Json({ phase, sequence }),
      bridgeSession: { ...INPUT.bridgeSession, sessionId: `synthetic-session-${sequence}`, sequence } });
    const capture: ClosedSessionAuthorityCapture = { operationId, phase, challengeAttempt: 1,
      bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
    const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
    const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
    const proof = await native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    const clock = Object.freeze({ phase, sequence }); clocks.set(capture, clock); issuedClocks.add(clock);
    return { baseline, capture, intent, closeReceipt, proof, launch: binding.launch, runtime };
  }
  const input = await makeInput("closed-edit", 2);
  const origin = { launch: { ...input.launch, jobId: "0".repeat(32) },
    capture: { ...input.capture, bridgeSession: { ...INPUT.bridgeSession } } };
  const checkpoint = { source: baseline.checkpoint.source, sourceIdentity: identity, checkpointIdentity: identity,
    sourceStatAfter: { size: "100", mtimeNs: "5", ctimeNs: "4" }, sourceSha256: "raw-hash", checkpointSha256: "raw-hash",
    receiptPath: "/synthetic/checkpoint.json", checkpoint: "/synthetic/checkpoint.eprj2", sourceDumpSha256: "dump", checkpointDumpSha256: "dump" };
  const completions = new WeakMap<object, object>(), copies = new WeakSet<object>();
  const assertBaseline = (value: unknown, candidate: unknown): CurrentSchematicRenameBaseline => {
    assert.equal(value, baseline, "Synthetic original baseline required"); assert.equal(candidate, engine); return baseline;
  };
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-snapshot.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?function)/gu, "");
  const context = createContext({ Object, String, Number, Buffer, structuredClone, join, canonicalJson, isRecord, sha256Json, freezeDeep, isNativeDocumentDeleted,
    assertOriginalCurrentSchematicRenameBaseline: assertBaseline,
    currentSchematicRenameBaselineOrigin: (value: unknown, candidate: unknown): typeof origin => { assertBaseline(value, candidate); return origin; },
    assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority,
    assertIssuedWindowsClockObservation: (value: object): Promise<object> => { assert.ok(issuedClocks.has(value)); return Promise.resolve(value); },
    controlRootCapability: (): Promise<object> => Promise.resolve({ synthetic: true }), controlDataDirectory: (): string => "/synthetic",
    operationPath: (): string => "/synthetic/operation.json",
    createCheckpoint: (): Promise<typeof checkpoint> => { state.storageCalls += 1; return Promise.resolve(checkpoint); },
    copyClosedProjectBytes: (value: { closureProof: { proofSha256: string } }): Promise<object> => {
      state.storageCalls += 1;
      const copy = { source: checkpoint.source, sha256: checkpoint.sourceSha256, bytes: 100, artifact: "/synthetic/raw-copy.eprj2",
        sourceIdentity: { device: "1", inode: "2", birthtimeNs: "3", ctimeNs: "4", mtimeNs: "5", size: "100" },
        receiptSha256: `copy-${state.storageCalls}`, closureProofSha256: value.closureProof.proofSha256 };
      copies.add(copy); return Promise.resolve(copy);
    },
    assertIssuedClosedFileCopy: (value: object): void => { assert.ok(copies.has(value)); },
    readClosedCopySqlInventory: (): Promise<object> => {
      state.storageCalls += 1; const inventory = { checkpointSha256: checkpoint.sourceSha256, schemaSha256: "schema", logicalSha256: "logical" };
      completions.set(inventory, { observedChildClose: true, exitCode: 0, exitSignal: null });
      return Promise.resolve(state.cloneReader ? structuredClone(inventory) : inventory);
    },
    readerCompletion: (value: object): object => { const result = completions.get(value); assert.ok(result, "Synthetic original SQL reader required"); return result; },
    decodeCurrentSymbolPreEditHistory: (): Promise<object> => Promise.resolve({ history: { ...target, projectOwnerUuid: target.ownerUuid,
      headHistoryUuid: "head", historyRowCount: 2, chunkCount: 3, documents: [{ uuid: "schematic", docType: "SCH", metadata: {}, records: [] }],
      semanticSha256: "history", ...state.historyPatch } }),
    readArtifact: (): Promise<object> => Promise.resolve({ eof: true, text: canonicalJson(state.receiptDrift ? {} : checkpoint) }),
    verifyCheckpoint: (): Promise<object> => Promise.resolve({ ...checkpoint, ok: true, sourceChanged: false,
      sourceMatchesReceipt: true, checkpointMatchesReceipt: true, sourceEqualsCheckpoint: true }),
    lstat: (): Promise<object> => Promise.resolve({ isFile: (): boolean => true, isSymbolicLink: (): boolean => false,
      nlink: 1n, dev: 1n, ino: 2n, birthtimeNs: 3n, ctimeNs: 4n }),
    verifyExactManagedArtifact: (): Promise<void> => Promise.resolve(),
  });
  const exported: unknown = runInContext(`${source}\n({finish:captureCurrentSchematicRenameFinishSnapshot,verify:captureCurrentSchematicRenameVerificationSnapshot,original:assertOriginalCurrentSchematicRenameSnapshot,revalidate:revalidateCurrentSchematicRenameSnapshot});`, context);
  assert.ok(isRecord(exported) && ["finish", "verify", "original", "revalidate"].every(key => typeof exported[key] === "function"));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- These checked functions execute the actual snapshot body in this private source realm.
  const api = exported as unknown as Api;
  const events: CurrentSchematicRenameSnapshotEvidence[] = [];
  return { api, engine, baseline, input, events, state, next: (): Promise<CurrentSchematicRenameSnapshotInput> => makeInput("closed-verification", 3),
    run: (hook): Promise<CurrentSchematicRenameSnapshot> => api.finish(engine, input, event => { events.push(event); hook?.(event); }) };
}

void test("SCH snapshot retains original inputs and stays historical after release without reviving authority", async () => {
  const value = await fixture(); const snapshot = await value.run();
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
  const original = value.api.original(snapshot, value.engine);
  assert.equal(original.baseline, value.baseline); assert.equal(original.capture, value.input.capture); assert.equal(original.proof, value.input.proof);
  assert.equal(original.launch, value.input.launch); assert.equal(snapshot.phase, "closed-edit");
  assert.equal(snapshot.native.schematicUuid, value.baseline.intent.target.schematicUuid);
  for (const key of ["requestedEffectVerified", "persistenceVerified", "writerReady", "executionAuthorized"] as const) { assert.equal(snapshot[key], false); }
  await value.api.revalidate(value.engine, snapshot);
  assert.throws(() => value.api.original(structuredClone(snapshot), value.engine), /original snapshot/u);
  await assert.rejects(value.run(), /attempt consumed/u);
  value.state.released = true; assert.equal(value.api.original(snapshot, value.engine), original);
  await assert.rejects(value.api.revalidate(value.engine, snapshot), /capture released/u);
});

void test("SCH snapshot consumes rejected original closure attempts before storage, never adopts copied identities", async () => {
  for (const key of ["capture", "proof"] as const) {
    const value = await fixture();
    await assert.rejects(value.api.finish(value.engine, { ...value.input, [key]: structuredClone(value.input[key]) }, observeOnly),
      /original capture|retained authority/u);
    assert.equal(value.state.storageCalls, 0); await assert.rejects(value.run(), /attempt consumed/u);
  }
  const value = await fixture();
  await assert.rejects(value.api.finish(value.engine, { ...value.input, launch: { ...value.input.launch, jobId: "wrong" } }, observeOnly), /close evidence differs/u);
  assert.equal(value.state.storageCalls, 0); await assert.rejects(value.run(), /attempt consumed/u);
});

void test("SCH snapshot retains evidence before callback refusal, rejects input substitution and incomplete readers", async () => {
  const failed = await fixture();
  await assert.rejects(failed.run(() => { throw new Error("Synthetic publication refused"); }), /publication refused/u);
  assert.equal(failed.events.length, 1); assert.equal(failed.state.storageCalls, 1); await assert.rejects(failed.run(), /attempt consumed/u);
  const drift = await fixture();
  await assert.rejects(drift.run(() => { Object.assign(drift.input, { proof: structuredClone(drift.input.proof) }); }), /input, evidence/u);
  assert.equal(drift.events.length, 1); assert.equal(drift.state.storageCalls, 1);
  const reader = await fixture(); reader.state.cloneReader = true;
  await assert.rejects(reader.run(), /original SQL reader/u); assert.equal(reader.events.length, 3);
  const receipt = await fixture(); receipt.state.receiptDrift = true;
  await assert.rejects(receipt.run(), /checkpoint receipt changed/u); assert.equal(receipt.events.length, 3);
  const scope = await fixture();
  await assert.rejects(scope.run(() => { scope.state.scoped = true; }), /closed scope changed/u);
  assert.equal(scope.events.length, 1); assert.equal(scope.state.storageCalls, 1);
});

void test("SCH saved snapshot requires the original predecessor and a fresh Job/session exactly once", async () => {
  const value = await fixture(); const finish = await value.run();
  assert.throws(() => value.api.verify(value.engine, { ...value.input, finishSnapshot: structuredClone(finish) }, observeOnly), /original snapshot/u);
  const next = await value.next();
  const verified = await value.api.verify(value.engine, { ...next, finishSnapshot: finish }, observeOnly);
  assert.equal(verified.phase, "closed-verification"); assert.equal(verified.predecessorCopyReceiptSha256, finish.copy.receiptSha256);
  assert.equal(value.api.original(verified, value.engine).proof, next.proof);
  await value.api.revalidate(value.engine, verified);
  await assert.rejects(value.api.verify(value.engine, { ...next, finishSnapshot: finish }, observeOnly), /attempt consumed/u);
  assert.throws(() => value.api.verify(value.engine, { ...next, finishSnapshot: verified }, observeOnly), /post-write snapshot/u);
});

void test("SCH snapshot rejects wrong project branch owner and missing duplicate deleted or non SCH targets", async () => {
  const schematic = { uuid: "schematic", docType: "SCH", metadata: {}, records: [] };
  for (const historyPatch of [
    { projectUuid: "other-project" }, { branchUuid: "other-branch" }, { projectOwnerUuid: "other-owner" },
    { documents: [] }, { documents: [schematic, schematic] },
    { documents: [{ ...schematic, docType: "PCB" }] },
    { documents: [{ ...schematic, records: [{ id: "DELETE_DOC", type: "DELETE_DOC", body: { isDelete: true } }] }] },
  ]) {
    const value = await fixture(); Object.assign(value.state.historyPatch, historyPatch);
    await assert.rejects(value.run(), /complete history differs/u);
    assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
    await assert.rejects(value.run(), /attempt consumed/u);
  }
});
