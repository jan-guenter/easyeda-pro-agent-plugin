/* oxlint-disable import/max-dependencies -- The public controller is composed with actual strict schemas/journals, original SQL-reader identity and real held fixed programs under an explicit synthetic native owner. */
/** Offline controller/publication regressions. The native owner and checkpoint
 * preparation seams below are synthetic; no connected qualification is claimed. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { controlDataDirectory } from "../src/artifacts.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, diagnosticLifecycleBindingSchema,
  releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS, assertFootprintHeldCacheJournalBudget, captureFootprintHeldCacheValidationRecord,
  currentFootprintHeldCacheValidationRequestSchema, queryCurrentFootprintHeldCacheValidation,
  validateCurrentFootprintHeldCacheValidationArguments } from "../src/current-footprint-held-cache-validation-schema.ts";
import { assertFootprintHeldCacheValidationChain, assertNoUnresolvedFootprintHeldCacheValidation, publishFootprintHeldCacheValidationRecord, readFootprintHeldCacheValidation,
  readFootprintHeldCacheValidations, reserveFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation-journal.ts";
import type { CurrentFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "../src/current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "../src/current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "../src/current-footprint-saved-cache-held-protocol.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE } from "../src/current-footprint-saved-cache-held-profile.ts";
import { createHeldCacheSyntheticPage } from "./helpers/current-footprint-saved-cache-held-fixture.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

const rawWindowsPath = String.raw`C:\EasyEDA\held-cache-validation.eprj2`;
const target = Object.freeze({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: "a".repeat(64) });
interface Options { readonly copiedFirst?: boolean; readonly lostRelease?: boolean; readonly pendingFirst?: boolean;
  readonly noResource?: boolean; readonly retainedAllocationFailure?: boolean; readonly noProcess?: boolean;
  readonly pendingPrepare?: boolean; readonly holdAbortDisk?: boolean }
interface Fixture {
  readonly controller: CurrentFootprintHeldCacheValidation;
  readonly operationId: string;
  readonly launch: Readonly<Record<string, unknown>>;
  readonly calls: string[];
  readonly entered: Promise<null>;
  readonly runner: CurrentFootprintSavedCacheHeldRunner;
  readonly newController: () => CurrentFootprintHeldCacheValidation;
  readonly prepareEntered: Promise<null>;
  readonly diskEntered: Promise<null>;
  readonly releasePrepare: () => void;
  readonly releaseDisk: () => void;
  readonly getterCalls: () => unknown;
}

/** Evaluate maintained source with explicit synthetic factory/checkpoint seams.
 * Real managed journals and the original full SQL reader remain in the test. */
async function fixture(options: Options = {}): Promise<Fixture> {
  const input = await savedFixture(), operationId = `footprint-held-cache-${randomBytes(8).toString("hex")}`;
  const calls: string[] = [], entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<null>(), page = createHeldCacheSyntheticPage();
  const diskEntered = Promise.withResolvers<null>(), diskGate = Promise.withResolvers<null>(), prepareEntered = Promise.withResolvers<null>(), prepareGate = Promise.withResolvers<null>();
  const branchUuid = "c".repeat(32), nativeBinding = Object.freeze({ helperInstance: "d".repeat(32), jobId: "e".repeat(32), rootPid: 1234, rootCreated: "133000000000000000" });
  const prepared = Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: Object.freeze({
    schema: "easyeda-pro-control.checkpoint.v2", source: "/synthetic-held.eprj2", sourceSha256: target.expectedSourceSha256,
    checkpoint: "/synthetic-checkpoint.eprj2", checkpointSha256: input.after.checkpointSha256 }),
  targetEvidence: Object.freeze({ ...target, branchUuid, docType: "PCB" }) });
  let allocated: object | null = null, allocationBinding: unknown, closed = false, launched = false, released = false;
  let diskHeld = false, reserved = false;
  const abortToken = Object.freeze({});
  const runner = new CurrentFootprintSavedCacheHeldRunner({ assertCurrent: (): Promise<void> => {
    assert.equal(closed, false); return Promise.resolve();
  }, request: async (command: CurrentFootprintSavedCacheHeldCommand): Promise<unknown> => {
    calls.push(command.heldCachePhase); const reply = await page.run(command);
    if (options.lostRelease === true && command.heldCachePhase === "release") { throw new Error("release acknowledgment lost"); }
    return reply;
  } }, { sessionId: "parent", uniqueContextId: "original", projectUuid: target.projectUuid, branchUuid }, ENGINE);
  const scope = createContext({ Object, Reflect, Promise, Error, AggregateError, Set, Date, types, canonicalJson, sha256Json, readerCompletion,
    currentDisposableOpenSealedTargetSchema, captureCurrentPcbStringClockReply, CurrentFootprintSavedCacheHeldRunner,
    currentFootprintHeldCacheValidationRequestSchema, acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion,
    releaseCurrentPcbDiagnosticLaunchExclusion, diagnosticLifecycleBindingSchema,
    assertFootprintHeldCacheValidationChain, assertNoUnresolvedFootprintHeldCacheValidation, publishFootprintHeldCacheValidationRecord, reserveFootprintHeldCacheValidation,
    readFootprintHeldCacheValidation: async (operation: string): ReturnType<typeof readFootprintHeldCacheValidation> => {
      if (options.holdAbortDisk === true && reserved && !diskHeld) { diskHeld = true; diskEntered.resolve(null); await diskGate.promise; }
      return readFootprintHeldCacheValidation(operation);
    },
    assertFootprintHeldCacheJournalBudget,
    captureFootprintHeldCacheValidationRecord: (record: unknown): unknown => captureFootprintHeldCacheValidationRecord(structuredClone(record)),
    assertNoUnresolvedCurrentPcbDiagnosticLaunches: (): Promise<void> => Promise.resolve(),
    prepareCurrentDisposableOpenCheckpoint: (actual: unknown): Promise<unknown> => { assert.deepEqual(actual, target); calls.push("checkpoint"); return Promise.resolve(prepared); },
    readCurrentPcbCommonOpenInventory: (actual: unknown, selected: unknown): Promise<unknown> => {
      assert.equal(actual, prepared); assert.deepEqual(selected, target); calls.push("full-sql"); return Promise.resolve(input.after);
    },
    verifyCurrentDisposableOpenCheckpoint: (actual: unknown, selected: unknown): Promise<void> => {
      assert.equal(actual, prepared); assert.deepEqual(selected, target); calls.push("verify-checkpoint"); return Promise.resolve();
    },
    loadRuntimeMachineProfile: (): Promise<unknown> => Promise.resolve({ profile: { runtime: { nodeExecutable: "/synthetic/node", nodeVersion: "24.18.0", nodeSha256: "f".repeat(64) } } }),
    assertOriginalCurrentFootprintHeldCacheValidationOwner: (owner: object): void => { assert.equal(owner, allocated); },
    currentFootprintHeldCacheValidationAllocationOutcome: (binding: unknown): unknown => {
      assert.equal(binding, allocationBinding); return allocated === null ? { status: "no-resource", owner: null } : { status: "retained", owner: allocated };
    },
  });
  class NativeOwner {
    public startFootprintHeldCacheValidationGeneration(): Promise<void> {
      assert.equal(this, allocated); calls.push("native-start"); launched = true;
      return options.noProcess === true ? Promise.reject(new Error("native launch refused without process")) : Promise.resolve();
    }
    public retainedFootprintCopyHeldSavedCache(): CurrentFootprintSavedCacheHeldRunner { assert.equal(this, allocated); return runner; }
    public requireOriginalFootprintCopyHeldSavedCache(original: CurrentFootprintSavedCacheHeldRunner): void { assert.equal(this, allocated); assert.equal(original, runner); }
    public async prepareFootprintCopyHeldSavedCache(): Promise<void> {
      assert.equal(this, allocated);
      if (options.pendingPrepare === true) { prepareEntered.resolve(null); await prepareGate.promise; }
      if (reserved) { throw new Error("original native preparation cutoff"); } await runner.prepare();
    }
    public async observeFirstFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> {
      assert.equal(this, allocated); const packet = await runner.observeFirst(); entered.resolve(null);
      if (options.pendingFirst === true) { await gate.promise; } return options.copiedFirst === true ? structuredClone(packet) : packet;
    }
    public observeFreshFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> { assert.equal(this, allocated); return runner.observeFresh(); }
    public releaseFootprintCopyHeldSavedCache(): Promise<void> { assert.equal(this, allocated); return runner.release(); }
    public observeApplicationWindow(): Promise<string> { assert.equal(this, allocated); calls.push("window"); return Promise.resolve("1"); }
    public async requestNormalClose(hwnd: string): Promise<void> {
      assert.equal(this, allocated); assert.equal(hwnd, "1"); calls.push("close");
      const state = runner.retained(); if (state["normalRequests"] !== 0 && state["releaseAttempted"] === false) { await runner.release(); } closed = true;
    }
    public observeTermination(): Promise<boolean> { assert.equal(this, allocated); calls.push("termination"); return Promise.resolve(closed); }
    public releaseClosed(): Promise<void> { assert.equal(this, allocated); assert.equal(closed, true); calls.push("release-helper"); released = true; return Promise.resolve(); }
    public releaseUnlaunched(): Promise<void> { assert.equal(this, allocated); assert.equal(launched, false); calls.push("release-unlaunched"); released = true; return Promise.resolve(); }
    public releaseNoProcess(): Promise<void> { assert.equal(this, allocated); assert.equal(options.noProcess, true); calls.push("release-no-process"); released = true; return Promise.resolve(); }
    public reserveFootprintHeldCacheValidationAbort(): object {
      assert.equal(this, allocated); assert.equal(reserved, false); reserved = true; calls.push("reserve-abort");
      if (options.noProcess === true) { throw new Error("HELD_CACHE_ABORT_ORIGINAL_BINDING_REQUIRED"); } return abortToken;
    }
    public dispatchFootprintHeldCacheValidationAbort(token: object, confirm: true): Promise<void> {
      assert.equal(this, allocated); assert.equal(token, abortToken); assert.equal(confirm, true); calls.push("abort-original-job"); closed = true; gate.resolve(null); return Promise.resolve();
    }
    public status(): unknown { assert.equal(this, allocated); return { binding: launched && options.noProcess !== true ? nativeBinding : null,
      launchConsumed: launched, noProcessCleanupAvailable: options.noProcess === true && !released, released, helperClosed: released }; }
  }
  scope["CurrentFootprintHeldCacheValidationOwner"] = NativeOwner;
  scope["startCurrentFootprintHeldCacheValidationOwner"] = (actualOptions: unknown, binding: unknown): Promise<NativeOwner> => {
    assert.ok(actualOptions !== null); assert.ok(binding !== null && typeof binding === "object");
    assert.equal(Object.isFrozen(binding), true); assert.equal(Reflect.get(binding, "prepared"), prepared); assert.equal(Reflect.get(binding, "inventory"), input.after);
    const selected: unknown = Reflect.get(binding, "target"); assert.ok(selected !== null && typeof selected === "object");
    assert.equal(Reflect.get(selected, "branchUuid"), branchUuid); calls.push("allocate-helper"); allocationBinding = binding;
    if (options.noResource === true) { return Promise.reject(new Error("factory refused before allocation")); }
    const owner = new NativeOwner(); allocated = owner;
    return options.retainedAllocationFailure === true ? Promise.reject(new Error("factory refused after retained allocation")) : Promise.resolve(owner);
  };
  scope["options"] = { pluginRoot: "/synthetic/plugin", assetsRoot: "/synthetic/assets", powershellExecutable: "/synthetic/powershell",
    powershellBytes: 1, powershellSha256: "a".repeat(64), assertAllowed: (): Promise<void> => Promise.resolve(),
    assertLocalAllowed: (): void => {
      // Native admission is explicitly synthetic in this isolated controller test.
    },
    assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-held-cache-validation.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "");
  runInContext(program, scope);
  const construct = (): CurrentFootprintHeldCacheValidation => {
    const instance: unknown = runInContext("new CurrentFootprintHeldCacheValidation(options)", scope);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This explicitly synthetic private realm evaluates the maintained controller class without production native issuance.
    return instance as CurrentFootprintHeldCacheValidation;
  };
  return { controller: construct(), operationId, calls, entered: entered.promise, runner, newController: construct,
    prepareEntered: prepareEntered.promise, diskEntered: diskEntered.promise, releasePrepare: (): void => { prepareGate.resolve(null); },
    releaseDisk: (): void => { diskGate.resolve(null); }, getterCalls: (): unknown => page.evaluate("getterCalls"),
    launch: { action: "launch", operationId, target, confirmValidationOnly: true, confirmDiagnosticLaunch: true,
      confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptCacheReadEffects: true } };
}

/** Finish actual controller sequencing against the synthetic original owner. */
async function finish(f: Fixture): Promise<void> {
  await f.controller.run({ action: "normal-close", operationId: f.operationId });
  await f.controller.run({ action: "observe-termination", operationId: f.operationId });
  await f.controller.run({ action: "release-closed", operationId: f.operationId });
  assert.equal(f.controller.hasActiveReservation(), false); assert.equal(f.controller.hasOwnedAllocation(), false);
}

void test("public cache grammar refuses branch/runtime/code/qualification overrides and capture rejects active data", () => {
  const operationId = "footprint-held-cache-schema-test";
  const launch = { action: "launch", operationId, target, confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptCacheReadEffects: true };
  assert.equal(validateCurrentFootprintHeldCacheValidationArguments(launch)["valid"], true);
  for (const patch of [{ branchUuid: "c".repeat(32) }, { code: "arbitrary" }, { nativeQualified: true }, { runtime: {} }]) {
    assert.equal(validateCurrentFootprintHeldCacheValidationArguments({ ...launch, ...patch })["valid"], false);
  }
  assert.equal(validateCurrentFootprintHeldCacheValidationArguments({ ...launch, target: { ...target, branchUuid: "c".repeat(32) } })["valid"], false);
  assert.equal(queryCurrentFootprintHeldCacheValidation(true)["wrapperAction"], "footprint-held-cache");
  let getter = 0;
  assert.throws(() => captureFootprintHeldCacheValidationRecord({ get schema(): string { getter += 1; return "forged"; } })); assert.equal(getter, 0);
  assert.throws(() => captureFootprintHeldCacheValidationRecord(new Proxy({}, {})));
  const complete = captureFootprintHeldCacheValidationRecord({ schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1", operationId,
    sequence: 0, createdAt: new Date().toISOString(), previousSha256: null, kind: "failure",
    evidence: { replies: Array.from({ length: 12 }, () => "a".repeat(32_768)) } });
  assert.equal(Array.isArray(complete.evidence["replies"]), true);
});

void test("public qualification checkpoints before allocation and separately samples the real held runner with durable cleanup", async () => {
  const f = await fixture(); await f.controller.run(f.launch); assert.equal(f.controller.hasActiveReservation(), true);
  assert.ok(f.calls.indexOf("checkpoint") < f.calls.indexOf("allocate-helper")); assert.ok(f.calls.indexOf("full-sql") < f.calls.indexOf("native-start"));
  const first = await f.controller.run({ action: "observe-first", operationId: f.operationId }); assert.equal(first["firstObserved"], true);
  assert.equal(f.calls.includes("queue-fresh"), false); await f.controller.run({ action: "observe-fresh", operationId: f.operationId });
  await f.controller.run({ action: "release-cache", operationId: f.operationId }); await finish(f);
  const historical = f.newController(), status = await historical.run({ action: "inspect", operationId: f.operationId });
  assert.equal(status["originalOwnerRetained"], false); assert.equal(status["replayTokenIssued"], false);
  await assert.rejects(historical.run({ action: "observe-first", operationId: f.operationId }), /ORIGINAL_OPERATION_REQUIRED/u);
  await assertNoUnresolvedFootprintHeldCacheValidation();
  const journal = await readFootprintHeldCacheValidation(f.operationId); assert.ok(journal !== null); assert.equal(journal.records.at(-1)?.kind, "release-closed-result");
  assert.equal(f.calls.filter(call => call === "release").length, 1); assert.equal(f.runner.retained()["nativeQualificationIssued"], false);
});

void test("copied observation and lost release acknowledgment consume stages while original close remains available", async () => {
  for (const options of [{ copiedFirst: true }, { lostRelease: true }]) {
    const f = await fixture(options); await f.controller.run(f.launch);
    if (options.copiedFirst === true) { await assert.rejects(f.controller.run({ action: "observe-first", operationId: f.operationId }), /ORIGINAL_PACKET/u); }
    else {
      await f.controller.run({ action: "observe-first", operationId: f.operationId });
      await assert.rejects(f.controller.run({ action: "release-cache", operationId: f.operationId }), /acknowledgment lost/u);
    }
    const failed = await readFootprintHeldCacheValidation(f.operationId); assert.ok(failed !== null);
    assert.notEqual(failed.records.at(-1)?.evidence["held"], undefined);
    await assert.rejects(f.controller.run({ action: "observe-first", operationId: f.operationId }), /NORMAL_ENDED/u); await finish(f);
    assert.equal(f.calls.filter(call => call === "queue-first").length, 1); assert.equal(f.calls.filter(call => call === "release").length, 1);
  }
});

void test("confirmed original abort consumes an in-flight observation and its late result cannot restore normal work", async () => {
  const f = await fixture({ pendingFirst: true }); await f.controller.run(f.launch);
  const first = f.controller.run({ action: "observe-first", operationId: f.operationId }); await f.entered;
  const aborted = f.controller.run({ action: "abort", operationId: f.operationId, confirmOriginalJob: true });
  const outcome = await Promise.allSettled([first, aborted]); assert.equal(outcome[0]?.status, "rejected"); assert.equal(outcome[1]?.status, "fulfilled");
  await assert.rejects(f.controller.run({ action: "observe-fresh", operationId: f.operationId }), /NORMAL_ENDED/u);
  await f.controller.run({ action: "observe-termination", operationId: f.operationId }); await f.controller.run({ action: "release-closed", operationId: f.operationId });
  assert.equal(f.calls.filter(call => call === "abort-original-job").length, 1); assert.equal(f.calls.includes("queue-fresh"), false);
});

void test("accepted abort cuts off pending preparation before its first disk await or native getter", async () => {
  const f = await fixture({ pendingPrepare: true, holdAbortDisk: true }); await f.controller.run(f.launch);
  const first = f.controller.run({ action: "observe-first", operationId: f.operationId });
  const firstOutcome = Promise.allSettled([first]); await f.prepareEntered;
  const abort = f.controller.run({ action: "abort", operationId: f.operationId, confirmOriginalJob: true });
  assert.equal(f.calls.includes("reserve-abort"), true); await f.diskEntered;
  f.releasePrepare(); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.getterCalls(), 0); assert.equal(f.calls.includes("capture"), false); assert.equal(f.calls.includes("queue-first"), false);
  assert.equal(f.calls.includes("abort-original-job"), false); f.releaseDisk(); await abort;
  const outcome = await firstOutcome; assert.equal(outcome[0]?.status, "rejected");
  await f.controller.run({ action: "observe-termination", operationId: f.operationId });
  await f.controller.run({ action: "release-closed", operationId: f.operationId });
});

void test("original factory outcomes choose explicit no-resource, unlaunched and no-process cleanup without invented exit evidence", async () => {
  for (const options of [{ noResource: true }, { retainedAllocationFailure: true }, { noProcess: true }]) {
    const f = await fixture(options); await assert.rejects(f.controller.run(f.launch), /factory refused|native launch refused/u);
    let action = "cleanup-no-process";
    if (options.noResource === true) { action = "cleanup-no-resource"; }
    else if (options.retainedAllocationFailure === true) { action = "cleanup-unlaunched"; }
    const result = await f.controller.run({ action, operationId: f.operationId }); assert.equal(result["originalTerminationObserved"], false);
    assert.equal(f.controller.hasActiveReservation(), false); assert.equal(f.controller.hasOwnedAllocation(), false);
    await assert.rejects(f.newController().run({ action, operationId: f.operationId }), /ORIGINAL_OPERATION_REQUIRED/u);
    await assertNoUnresolvedFootprintHeldCacheValidation();
  }
});

void test("missing-root abort cannot create a termination intent or poison original no-process cleanup", async () => {
  const f = await fixture({ noProcess: true }); await assert.rejects(f.controller.run(f.launch), /native launch refused without process/u);
  await assert.rejects(f.controller.run({ action: "abort", operationId: f.operationId, confirmOriginalJob: true }), /HELD_CACHE_ABORT_ORIGINAL_BINDING_REQUIRED/u);
  const before = await readFootprintHeldCacheValidation(f.operationId); assert.ok(before !== null);
  assert.equal(before.records.some(record => record.kind === "abort-intent" || record.kind === "normal-close-intent"), false);
  await assert.rejects(f.controller.run({ action: "observe-termination", operationId: f.operationId }), /TERMINATION_CONSUMED/u);
  const after = await readFootprintHeldCacheValidation(f.operationId); assert.ok(after !== null);
  assert.equal(canonicalJson(after.records), canonicalJson(before.records)); assert.equal(f.calls.includes("termination"), false);
  const settled = await f.controller.run({ action: "settle-records", operationId: f.operationId });
  assert.equal(settled["retainedUnpublishedRecords"], 0); assert.equal(settled["abortAttemptConsumed"], true);
  await assert.rejects(f.controller.run({ action: "abort", operationId: f.operationId, confirmOriginalJob: true }), /ABORT_CONSUMED/u);
  await assert.rejects(f.controller.run({ action: "observe-first", operationId: f.operationId }), /NORMAL_ENDED/u);
  const result = await f.controller.run({ action: "cleanup-no-process", operationId: f.operationId });
  assert.equal(result["originalTerminationObserved"], false); assert.equal(f.controller.hasActiveReservation(), false);
  assert.equal(f.calls.filter(call => call === "release-no-process").length, 1); assert.equal(f.calls.includes("abort-original-job"), false);
  await assertNoUnresolvedFootprintHeldCacheValidation();
});

void test("durable chain corruption and foreign operation IDs refuse before any new native phase", async () => {
  const f = await fixture(); await f.controller.run(f.launch);
  const before = await readFootprintHeldCacheValidation(f.operationId); assert.ok(before !== null);
  await assert.rejects(f.controller.run({ action: "observe-first", operationId: "footprint-held-cache-foreign" }), /ORIGINAL_OPERATION_REQUIRED/u);
  const after = await readFootprintHeldCacheValidation(f.operationId); assert.equal(after?.records.length, before.records.length);
  await finish(f);
  const complete = await readFootprintHeldCacheValidation(f.operationId); assert.ok(complete !== null);
  const summaries = await readFootprintHeldCacheValidations(); assert.ok(summaries.every(operation => typeof operation.records === "number"));
  const fork = async (terminal: boolean): Promise<string> => {
    const operationId = `footprint-held-cache-${randomBytes(8).toString("hex")}`; await reserveFootprintHeldCacheValidation(operationId);
    const selected = terminal ? complete.records : complete.records.slice(0, complete.records.findIndex(record => record.kind === "launch-result") + 1);
    let previousSha256: string | null = null;
    for (const record of selected) {
      const evidence = record.kind === "launch-intent" ? { request: { ...f.launch, operationId } } : record.evidence;
      const remapped = { ...record, operationId, previousSha256, evidence }; await publishFootprintHeldCacheValidationRecord(remapped); previousSha256 = sha256Json(remapped);
    }
    return operationId;
  };
  const active = await fork(false), activeJournal = await readFootprintHeldCacheValidation(active); assert.ok(activeJournal !== null);
  const activePrevious = sha256Json(activeJournal.records.at(-1));
  for (const kind of ["cleanup-unlaunched-intent", "cleanup-no-process-intent"] as const) {
    await assert.rejects(publishFootprintHeldCacheValidationRecord({ schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1",
      operationId: active, sequence: activeJournal.records.length, createdAt: new Date().toISOString(), previousSha256: activePrevious,
      kind, evidence: { applicationTerminationObserved: false } }), /ROOT_LAUNCH_CONTRADICTS_HELPER_ONLY_CLEANUP/u);
  }
  const terminal = await fork(true), terminalJournal = await readFootprintHeldCacheValidation(terminal); assert.ok(terminalJournal !== null);
  const terminalPrevious = sha256Json(terminalJournal.records.at(-1));
  await assert.rejects(publishFootprintHeldCacheValidationRecord({ schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1",
    operationId: terminal, sequence: terminalJournal.records.length, createdAt: new Date().toISOString(), previousSha256: terminalPrevious,
    kind: "abort-intent", evidence: { confirmOriginalJob: true } }), /AFTER_TERMINAL_OR_CLEANUP_BRANCH/u);
  const records = [...activeJournal.records];
  let refused = false;
  for (let index = 0; index < 20 && !refused; index += 1) {
    const record = { schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1" as const, operationId: active,
      sequence: records.length, createdAt: new Date().toISOString(), previousSha256: sha256Json(records.at(-1)), kind: "failure" as const,
      evidence: { padding: Array.from({ length: 7 }, () => "x".repeat(65_536)), nativeAllocationNeverAttempted: false } };
    try { assertFootprintHeldCacheJournalBudget([...records, record]); records.push(record); }
    catch { refused = true; }
  }
  assert.equal(refused, true); assert.ok(records.length < 25);
  const cleanup = [...activeJournal.records];
  const append = (kind: "normal-close-intent" | "normal-close-result" | "abort-intent" | "abort-result" | "termination-intent" | "termination-result" | "release-closed-intent" | "release-closed-result" | "failure"): void => {
    cleanup.push({ schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1", operationId: active, sequence: cleanup.length,
      createdAt: new Date().toISOString(), previousSha256: sha256Json(cleanup.at(-1)), kind, evidence: {} });
  };
  append("normal-close-intent"); append("normal-close-result"); append("abort-intent"); append("abort-result"); append("failure");
  for (let poll = 0; poll < 240; poll += 1) { append("termination-intent"); append("termination-result"); }
  append("release-closed-intent"); append("release-closed-result"); assertFootprintHeldCacheJournalBudget(cleanup);
  assert.equal(CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS.cleanupRecords, 487);
  append("failure"); assert.throws(() => { assertFootprintHeldCacheJournalBudget(cleanup); }, /AGGREGATE/u);
  const forgedOperation = `footprint-held-cache-${randomBytes(8).toString("hex")}`;
  await reserveFootprintHeldCacheValidation(forgedOperation);
  await assert.rejects(publishFootprintHeldCacheValidationRecord({ schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1",
    operationId: forgedOperation, sequence: 0, createdAt: new Date().toISOString(), previousSha256: null, kind: "release-closed-result", evidence: { released: true } }), /LAUNCH_INTENT_REQUIRED/u);
  const path = `${controlDataDirectory()}/footprint-held-cache-validation-v1/${f.operationId}/999-unknown.json`;
  await writeFile(path, "{}\n", { mode: 0o600, flag: "wx" });
  await assert.rejects(readFootprintHeldCacheValidations()); await assert.rejects(assertNoUnresolvedFootprintHeldCacheValidation());
  assert.equal(f.calls.includes("queue-first"), false);
});
