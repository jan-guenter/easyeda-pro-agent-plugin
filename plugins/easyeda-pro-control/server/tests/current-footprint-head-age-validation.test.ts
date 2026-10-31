/* oxlint-disable import/max-dependencies -- Compose the maintained controller with strict real journals and original SQL-reader identity; only native/checkpoint seams are synthetic. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, diagnosticLifecycleBindingSchema,
  releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_JOURNAL_LIMITS, assertFootprintHeadAgeJournalBudget, captureFootprintHeadAgeValidationRecord,
  currentFootprintHeadAgeSummarySchema, currentFootprintHeadAgeValidationRequestSchema, validateCurrentFootprintHeadAgeValidationArguments } from "../src/current-footprint-head-age-validation-schema.ts";
import { assertFootprintHeadAgeValidationChain, assertNoUnresolvedFootprintHeadAgeValidation, publishFootprintHeadAgeValidationRecord,
  readFootprintHeadAgeValidation, reserveFootprintHeadAgeValidation } from "../src/current-footprint-head-age-validation-journal.ts";
import type { CurrentFootprintHeadAgeValidation } from "../src/current-footprint-head-age-validation.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

const rawWindowsPath = String.raw`C:\EasyEDA\head-age-validation.eprj2`;
const target = Object.freeze({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: "a".repeat(64) });
interface FixtureOptions { readonly copiedObservation?: boolean; readonly pendingObservation?: boolean; readonly noResource?: boolean; readonly retainedFailure?: boolean }
interface Fixture {
  readonly controller: CurrentFootprintHeadAgeValidation; readonly operationId: string; readonly launch: Readonly<Record<string, unknown>>;
  readonly calls: string[]; readonly entered: Promise<null>; readonly newController: () => CurrentFootprintHeadAgeValidation;
}

/** Evaluate the maintained controller with a synthetic original native class.
 * Complete SQL readers and private append-only journals remain real. */
async function fixture(options: FixtureOptions = {}): Promise<Fixture> {
  const input = await savedFixture(), operationId = `footprint-head-age-${randomBytes(8).toString("hex")}`;
  const calls: string[] = [], entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<null>();
  const branchUuid = "c".repeat(32), nativeBinding = Object.freeze({ helperInstance: "d".repeat(32), jobId: "e".repeat(32), rootPid: 1234, rootCreated: "133000000000000000" });
  const prepared = Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: Object.freeze({
    schema: "easyeda-pro-control.checkpoint.v2", source: "/synthetic-age.eprj2", sourceSha256: target.expectedSourceSha256,
    checkpoint: "/synthetic-checkpoint.eprj2", checkpointSha256: input.after.checkpointSha256 }), targetEvidence: Object.freeze({ ...target, branchUuid, docType: "PCB" }) });
  const packet = Object.freeze({ synthetic: true, nativeDateProvenanceVerified: true, appClockDirectlyObserved: true,
    minimumObservedAgeMs: 61_000, observedWindow: Object.freeze({ notBeforeMs: 1_720_000_000_000, notAfterMs: 1_720_000_000_100 }), executionAuthorized: false });
  let allocated: object | null = null, allocationBinding: unknown, closed = false, cutoff = false, launched = false, released = false;
  const abortToken = Object.freeze({});
  const scope = createContext({ Object, Reflect, Promise, Error, AggregateError, Set, Date, types, canonicalJson, sha256Json, readerCompletion,
    currentDisposableOpenSealedTargetSchema, captureCurrentPcbStringClockReply, currentFootprintHeadAgeValidationRequestSchema, currentFootprintHeadAgeSummarySchema,
    acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion, diagnosticLifecycleBindingSchema,
    assertFootprintHeadAgeValidationChain, assertNoUnresolvedFootprintHeadAgeValidation, publishFootprintHeadAgeValidationRecord,
    reserveFootprintHeadAgeValidation, readFootprintHeadAgeValidation, assertFootprintHeadAgeJournalBudget,
    captureFootprintHeadAgeValidationRecord: (record: unknown): unknown => captureFootprintHeadAgeValidationRecord(structuredClone(record)),
    assertNoUnresolvedCurrentPcbDiagnosticLaunches: (): Promise<void> => Promise.resolve(),
    prepareCurrentDisposableOpenCheckpoint: (actual: unknown): Promise<unknown> => { assert.deepEqual(actual, target); calls.push("checkpoint"); return Promise.resolve(prepared); },
    readCurrentPcbCommonOpenInventory: (actual: unknown, selected: unknown): Promise<unknown> => {
      assert.equal(actual, prepared); assert.deepEqual(selected, target); calls.push("full-sql"); return Promise.resolve(input.after);
    },
    verifyCurrentDisposableOpenCheckpoint: (actual: unknown, selected: unknown): Promise<void> => {
      assert.equal(actual, prepared); assert.deepEqual(selected, target); calls.push("verify-checkpoint"); return Promise.resolve();
    },
    loadRuntimeMachineProfile: (): Promise<unknown> => Promise.resolve({ profile: { runtime: { nodeExecutable: "/synthetic/node", nodeVersion: "24.18.0", nodeSha256: "f".repeat(64) } } }),
    assertOriginalCurrentFootprintHeadAgeValidationOwner: (owner: object): void => { assert.equal(owner, allocated); },
    currentFootprintHeadAgeValidationAllocationOutcome: (binding: unknown): unknown => {
      assert.equal(binding, allocationBinding); return allocated === null ? { status: "no-resource", owner: null } : { status: "retained", owner: allocated };
    },
  });
  class NativeOwner {
    public startFootprintHeadAgeValidationGeneration(): Promise<void> { assert.equal(this, allocated); calls.push("native-start"); launched = true; return Promise.resolve(); }
    public async observeFootprintHeadAgeValidation(): Promise<unknown> {
      assert.equal(this, allocated); calls.push("observe-native-date"); entered.resolve(null);
      if (options.pendingObservation === true) { await gate.promise; }
      return options.copiedObservation === true ? structuredClone(packet) : packet;
    }
    public requireOriginalFootprintHeadAgeValidationObservation(actual: unknown): void { assert.equal(this, allocated); assert.equal(actual, packet); }
    public observeApplicationWindow(): Promise<string> { assert.equal(this, allocated); calls.push("window"); return Promise.resolve("1"); }
    public requestNormalClose(hwnd: string): Promise<void> { assert.equal(this, allocated); assert.equal(hwnd, "1"); calls.push("close"); closed = true; return Promise.resolve(); }
    public observeTermination(): Promise<boolean> { assert.equal(this, allocated); calls.push("termination"); return Promise.resolve(closed); }
    public releaseClosed(): Promise<void> { assert.equal(this, allocated); assert.equal(closed, true); calls.push("release-helper"); released = true; return Promise.resolve(); }
    public releaseUnlaunched(): Promise<void> { assert.equal(this, allocated); assert.equal(launched, false); calls.push("release-unlaunched"); released = true; return Promise.resolve(); }
    public releaseNoProcess(): Promise<void> { assert.equal(this, allocated); throw new Error("no no-process fixture"); }
    public reserveFootprintHeadAgeValidationAbort(): object { assert.equal(this, allocated); assert.equal(cutoff, false); cutoff = true; calls.push("reserve-abort"); return abortToken; }
    public dispatchFootprintHeadAgeValidationAbort(token: object, confirm: true): Promise<void> {
      assert.equal(this, allocated); assert.equal(token, abortToken); assert.equal(confirm, true); calls.push("abort-original-job"); closed = true; gate.resolve(null); return Promise.resolve();
    }
    public status(): unknown { assert.equal(this, allocated); return { binding: launched ? nativeBinding : null, launchConsumed: launched,
      noProcessCleanupAvailable: false, released, helperClosed: released }; }
  }
  scope["CurrentFootprintHeadAgeValidationOwner"] = NativeOwner;
  scope["startCurrentFootprintHeadAgeValidationOwner"] = (actualOptions: unknown, binding: unknown): Promise<NativeOwner> => {
    assert.ok(actualOptions !== null && binding !== null && typeof binding === "object");
    assert.equal(Object.isFrozen(binding), true); assert.equal(Reflect.get(binding, "prepared"), prepared); assert.equal(Reflect.get(binding, "inventory"), input.after);
    const selected: unknown = Reflect.get(binding, "target"); assert.ok(selected !== null && typeof selected === "object");
    assert.equal(Reflect.get(selected, "branchUuid"), branchUuid); calls.push("allocate-helper"); allocationBinding = binding;
    if (options.noResource === true) { return Promise.reject(new Error("factory refused before allocation")); }
    const owner = new NativeOwner(); allocated = owner;
    return options.retainedFailure === true ? Promise.reject(new Error("factory refused after retained allocation")) : Promise.resolve(owner);
  };
  scope["options"] = { pluginRoot: "/synthetic/plugin", assetsRoot: "/synthetic/assets", powershellBytes: 1, powershellSha256: "a".repeat(64),
    assertAllowed: (): Promise<void> => Promise.resolve(), assertLocalAllowed: (): void => {
      // Native admission is synthetic.
    },
    assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-head-age-validation.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "");
  runInContext(program, scope);
  const construct = (): CurrentFootprintHeadAgeValidation => {
    const instance: unknown = runInContext("new CurrentFootprintHeadAgeValidation(options)", scope);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This isolated realm evaluates maintained source with explicitly synthetic native issuance.
    return instance as CurrentFootprintHeadAgeValidation;
  };
  return { controller: construct(), operationId, calls, entered: entered.promise, newController: construct,
    launch: { action: "launch", operationId, target, confirmValidationOnly: true, confirmDiagnosticLaunch: true,
      confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNativeClockObservation: true } };
}

/** Close the original synthetic generation through independently observed exit. */
async function finish(f: Fixture): Promise<void> {
  await f.controller.run({ action: "normal-close", operationId: f.operationId });
  await f.controller.run({ action: "observe-termination", operationId: f.operationId });
  await f.controller.run({ action: "release-closed", operationId: f.operationId });
  assert.equal(f.controller.hasActiveReservation(), false); assert.equal(f.controller.hasOwnedAllocation(), false);
}

void test("head-age grammar permits no native authority, branch, replay or writer overrides", () => {
  const launch = { action: "launch", operationId: "footprint-head-age-schema-case", target, confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNativeClockObservation: true };
  assert.equal(validateCurrentFootprintHeadAgeValidationArguments(launch)["valid"], true);
  for (const patch of [{ branchUuid: "a".repeat(32) }, { code: "x" }, { ageVerified: true }, { runtime: {} }, { confirmWrite: true }]) {
    assert.equal(validateCurrentFootprintHeadAgeValidationArguments({ ...launch, ...patch })["valid"], false);
  }
  assert.equal(validateCurrentFootprintHeadAgeValidationArguments({ action: "observe-head-age", operationId: `${launch.operationId}\n` })["valid"], false);
  for (const action of ["open-project", "copy", "delete", "save", "observe-first"]) {
    assert.equal(validateCurrentFootprintHeadAgeValidationArguments({ action, operationId: launch.operationId })["valid"], false);
  }
});

void test("one original Date observation follows full SQL preparation and complete cleanup without replay", async () => {
  const f = await fixture(); await f.controller.run(f.launch);
  const result = await f.controller.run({ action: "observe-head-age", operationId: f.operationId });
  assert.equal(result["headAgeObserved"], true); assert.equal(result["writerAuthority"], false); assert.equal(result["executionAuthorized"], false);
  const summary = currentFootprintHeadAgeSummarySchema.parse(result["headAge"]);
  assert.equal(summary.minimumObservedAgeMs, 61_000); assert.equal(summary.timestampInterpretation, "original-rl-with-current-offset");
  assert.equal(summary.nativeDateProvenanceVerified, true); assert.equal(summary.preselectedWriterIntervalProven, false);
  assert.deepEqual(f.calls.slice(0, 4), ["checkpoint", "full-sql", "verify-checkpoint", "allocate-helper"]);
  await assert.rejects(f.controller.run({ action: "observe-head-age", operationId: f.operationId }), /OBSERVATION_CONSUMED/u);
  assert.equal(f.calls.filter(call => call === "observe-native-date").length, 1);
  const other = f.newController();
  const historical = await other.run({ action: "inspect", operationId: f.operationId });
  assert.equal(historical["headAge"], null); assert.equal(historical["originalOwnerRetained"], false);
  await assert.rejects(other.run({ action: "normal-close", operationId: f.operationId }), /ORIGINAL_OPERATION_REQUIRED/u);
  await finish(f);
  const journal = await readFootprintHeadAgeValidation(f.operationId); assert.ok(journal);
  assert.equal(journal.records.filter(record => Object.hasOwn(record.evidence, "headAgeObservation")).length, 1);
  assertFootprintHeadAgeValidationChain(journal.records);
});

void test("copied Date packets refuse and preserve original owner cleanup", async () => {
  const f = await fixture({ copiedObservation: true }); await f.controller.run(f.launch);
  await assert.rejects(f.controller.run({ action: "observe-head-age", operationId: f.operationId }));
  // The failed packet has not acquired genuine issuance. Inspection/cleanup
  // Must remain possible even though the original observer rejected it.
  assert.equal(f.controller.hasOwnedAllocation(), true); await finish(f);
});

void test("abort cuts off a pending observation before publication and preserves one actual termination lane", async () => {
  const f = await fixture({ pendingObservation: true }); await f.controller.run(f.launch);
  const pending = f.controller.run({ action: "observe-head-age", operationId: f.operationId });
  const refused = assert.rejects(pending, /NORMAL_ENDED/u); await f.entered;
  await f.controller.run({ action: "abort", operationId: f.operationId, confirmOriginalJob: true }); await refused;
  assert.ok(f.calls.indexOf("reserve-abort") < f.calls.indexOf("abort-original-job"));
  await f.controller.run({ action: "observe-termination", operationId: f.operationId });
  await f.controller.run({ action: "release-closed", operationId: f.operationId });
  assert.equal(f.controller.hasActiveReservation(), false);
});

void test("allocation failures retain exact no-resource or unlaunched cleanup instead of adopting JSON", async () => {
  for (const retainedFailure of [false, true]) {
    const f = await fixture({ noResource: !retainedFailure, retainedFailure });
    await assert.rejects(f.controller.run(f.launch), /factory refused/u);
    await f.controller.run({ action: retainedFailure ? "cleanup-unlaunched" : "cleanup-no-resource", operationId: f.operationId });
    assert.equal(f.controller.hasActiveReservation(), false); assert.equal(f.controller.hasOwnedAllocation(), false);
  }
});

void test("one late native observation retains its two 1681-offset lists inside protected cleanup space", () => {
  const base = { schema: "easyeda-pro-control.footprint-head-age-validation-record.v1", operationId: "footprint-head-age-large-packet",
    createdAt: "2000-01-01T00:00:00.000Z", previousSha256: null };
  const abort = captureFootprintHeadAgeValidationRecord({ ...base, sequence: 0, kind: "abort-intent", evidence: { confirmOriginalJob: true } });
  const packet = { first: Array.from({ length: 1681 }, (_, i) => i), second: Array.from({ length: 1681 }, (_, i) => i) };
  const failed = captureFootprintHeadAgeValidationRecord({ ...base, sequence: 1, kind: "failure", evidence: { action: "observe-head-age", headAgeObservation: packet } });
  assert.ok(Buffer.byteLength(JSON.stringify(failed)) > CURRENT_FOOTPRINT_HEAD_AGE_JOURNAL_LIMITS.cleanupScalarRecordBytes);
  assert.doesNotThrow(() => { assertFootprintHeadAgeJournalBudget([abort, failed]); });
  assert.throws(() => { assertFootprintHeadAgeJournalBudget([abort, failed, { ...failed, sequence: 2 }]); }, /RAW_PACKET/u);
  assert.throws(() => { captureFootprintHeadAgeValidationRecord({ ...failed, evidence: { other: packet.first } }); }, /RECORD_ARRAY/u);
  const accessor = Object.defineProperty({}, "first", { enumerable: true, get: (): never => { throw new Error("MUST_NOT_RUN"); } });
  assert.throws(() => { captureFootprintHeadAgeValidationRecord({ ...failed, evidence: { headAgeObservation: accessor } }); });
});
