/** Public phase composition with actual schemas and source, synthetic original
 * lifecycle boundaries only. No native ownership, CAD or filesystem mutation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { CURRENT_PCB_RENAME_OPERATION_PURPOSE, currentPcbRenameOperationRequestSchema, queryCurrentPcbRenameOperation,
  validateCurrentPcbRenameOperationArguments } from "../src/current-pcb-rename-operation.ts";

type Value = Record<string, unknown>;
const ID = "synthetic-pcb-rename", OPENING = "synthetic-pcb-opening";
const TARGET = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), pcbUuid: "d".repeat(16) };
const BEGIN = { action: "baseline-begin", operationId: ID, openingOperationId: OPENING, target: TARGET,
  desiredTitle: "Renamed PCB", confirmDisposableProject: true, acceptPcbRename: true };
function object(value: unknown): Value { assert.ok(isRecord(value)); return value; }
async function fixture(): Promise<{
  calls: string[]; run: (request: unknown) => Promise<Value>; inspect: () => Value;
  state: { failure: string | undefined; returnedFailure: boolean; pendingAuthentication: boolean; pendingTermination: boolean;
    invariant: boolean; metadata: boolean; cleanupGate: Promise<unknown> | undefined;
    scratchGate: Promise<unknown> | undefined; scratchStarted: (() => void) | undefined };
}> {
  const calls: string[] = [], state = { failure: undefined as string | undefined, returnedFailure: false,
    pendingAuthentication: false, pendingTermination: false, invariant: true, metadata: true, cleanupGate: undefined as Promise<unknown> | undefined,
    scratchGate: undefined as Promise<unknown> | undefined, scratchStarted: undefined as (() => void) | undefined };
  const clock = Object.freeze({ original: "clock" }), continuation = Object.freeze({ operationId: ID, original: "continuation" });
  const generation = Object.freeze({ operationId: ID }), owner = Object.freeze({ operationId: ID }), reference = Object.freeze({ original: "reference" });
  const baselineValue = Object.freeze({ original: "baseline" }), proof = Object.freeze({ original: "proof" }), startup = Object.freeze({ original: "startup" });
  let scoped = false;
  class Controller {
    public readonly kind: string;
    public owned = false;
    public status: Value = { state: "ready", failed: false, retired: false, closeAttempted: false, finishObservationAvailable: false };
    public constructor(kind: string) { this.kind = kind; }
    private summary(): Value {
      const available = this.owned && this.status["ownerRetained"] !== false && this.status["retired"] !== true && this.status["releaseAttempted"] !== true;
      const cleanup = available && (this.kind !== "baseline" || this.status["cleanupOnly"] === true);
      return { ...this.status, cleanupCloseAvailable: cleanup && this.status["closeAttempted"] !== true &&
        (this.kind !== "baseline" || this.status["captureRetained"] === true),
      finishObservationAvailable: cleanup && this.status["closeAcknowledged"] === true,
      closedBaselineRetirementAvailable: cleanup && this.kind === "baseline" && this.status["terminationProved"] === true };
    }
    private step(name: string): Value {
      const event = `${this.kind}.${name}`; calls.push(event);
      if (state.failure === event) { this.status["failed"] = true; throw new Error(`Synthetic failure: ${event}`); }
      return this.summary();
    }
    public inspect(): Value { assert.ok(this.owned); return this.summary(); }
    public capture(value: unknown): Value {
      assert.equal(value, owner); this.owned = true; this.status["captureRetained"] = true; return this.step("capture");
    }
    public captureForCleanup(value: unknown): Value {
      assert.equal(value, owner); this.owned = true; this.status["captureRetained"] = true; this.status["cleanupOnly"] = true; return this.step("cleanup-capture");
    }
    public close(): Value { return this.finishNormalClose(); }
    public cleanupClose(): Value { return this.finishNormalClose(); }
    public async requestCleanup(): Promise<Value> { await state.cleanupGate; this.status["cleanupOnly"] = true; return this.step("request-cleanup"); }
    public closedBaseline(): unknown { assert.equal(this.kind, "baseline"); return baselineValue; }
    public closedContinuation(): unknown { assert.equal(this.kind, "baseline"); return continuation; }
    public relaunch(value: unknown): Value {
      assert.equal(value, continuation); this.owned = true; this.status["launchRetained"] = true; this.status["launchAttempted"] = true; return this.step("relaunch");
    }
    public generation(): unknown { assert.equal(this.kind, "generation"); return generation; }
    public execute(selected: unknown, observed: unknown, age: unknown): Value {
      assert.equal(selected, generation); assert.equal(observed, startup); assert.equal(age, clock); assert.equal(scoped, false);
      this.owned = true;
      if (state.failure === "writer.transfer-before") {
        this.status["ownerRetained"] = false; calls.push("writer.execute"); throw new Error("Synthetic writer transfer never committed");
      }
      if (state.returnedFailure) { this.status["failed"] = true; }
      return this.step("execute");
    }
    public getVerificationContinuation(): unknown { assert.equal(this.status["retired"], true); return continuation; }
    public start(selected: unknown): Value { assert.equal(selected, continuation); this.owned = true; this.status["launchAcknowledged"] = true; return this.step("start"); }
    public admit(): Value {
      const result = this.step("admit");
      if (state.pendingAuthentication) { state.pendingAuthentication = false; return { ...result, authentication: "pending", admissionAttempted: false }; }
      return { ...result, admitted: true };
    }
    public observeCaches(): Value { return this.step("caches"); }
    public openProject(): Value { return this.step("open"); }
    public collectSavedContent(): Value { return this.step("read"); }
    public finishNormalClose(): Value {
      this.status["closeAttempted"] = true; this.status["closeAcknowledged"] = true; this.status["finishObservationAvailable"] = true;
      return this.step("close");
    }
    public observeTermination(): Value {
      const result = this.step("termination");
      if (state.pendingTermination) { state.pendingTermination = false; return { ...result, termination: "pending" }; }
      this.status["terminationProved"] = true; this.status["baselineCaptured"] = true; return this.summary();
    }
    public cleanupObserveTermination(): Value { return this.observeFinish(); }
    public retireClosedBaseline(): Value { this.status["retired"] = true; return this.step("retire-closed"); }
    public observeFinish(): Value {
      const result = this.step("finish");
      if (state.pendingTermination) { state.pendingTermination = false; return { ...result, termination: "pending" }; }
      this.status["releaseAttempted"] = true;
      if (state.failure === `${this.kind}.release`) { this.status["failed"] = true; throw new Error("Synthetic consumed release refused"); }
      this.status["retired"] = true; this.status["finishObservationAvailable"] = false;
      return { ...this.summary(), termination: "terminated", verificationContinuationRetained: this.status["failed"] !== true,
        fullReopenReadbackInvariant: this.status["failed"] !== true && state.invariant, reopenedPcbMetadataVerified: state.metadata };
    }
  }
  const engine = { assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(), upstream: {
    withAuthenticatedBridgeDispatchScope: async (task: () => Promise<void>): Promise<void> => {
      assert.equal(scoped, false); scoped = true; try { await task(); } finally { scoped = false; }
    } } };
  const opener = { preparePcbRenameOpeningOwner: (opening: unknown, request: Value): Promise<object> => {
    assert.equal(opening, OPENING); assert.equal(request["operationId"], ID); calls.push("opening.transfer");
    return state.failure === "opening.transfer" ? Promise.reject(new Error("Synthetic committed opening transfer refused")) : Promise.resolve(owner);
  }, getPcbRenameOpeningOwner: (): object => owner };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-rename-operation-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets" } }, structuredClone, isRecord,
    CURRENT_PCB_RENAME_OPERATION_PURPOSE, currentPcbRenameOperationRequestSchema, controlDataDirectory: (): string => "/synthetic/control",
    loadRuntimeMachineProfile: (): Promise<Value> => Promise.resolve({ profile: { controlDirectory: "/synthetic/control", easyeda: { assetsRoot: "/synthetic/assets" }, runtime: {} } }),
    loadOperation: (): Promise<Value> => Promise.resolve({ operationId: ID, plan: { profile: "easyeda-pro-control.current-pcb-rename-writer.v1" }, artifacts: [] }),
    assertCurrentPcbRenameOpeningOwner: (value: unknown, selected: unknown): Value => { assert.equal(value, owner); assert.equal(selected, engine); return { source: { runtime: {} } }; },
    CurrentPcbRenameBaselineCoordinator: function CurrentPcbRenameBaselineCoordinator(): Controller { return new Controller("baseline"); },
    CurrentPcbRenameGenerationCoordinator: function CurrentPcbRenameGenerationCoordinator(): Controller { return new Controller("generation"); },
    CurrentPcbRenameWriterCoordinator: function CurrentPcbRenameWriterCoordinator(): Controller { return new Controller("writer"); },
    CurrentPcbRenameVerificationCoordinator: function CurrentPcbRenameVerificationCoordinator(): Controller { return new Controller("verification"); },
    CurrentPcbAgedSqlReferenceStage: function CurrentPcbAgedSqlReferenceStage(): object { return { runOnce: async (input: Value): Promise<object> => {
      assert.equal(input["baseline"], baselineValue); assert.equal(input["proof"], proof); calls.push("scratch.once");
      state.scratchStarted?.(); await state.scratchGate; return reference;
    } }; },
    currentPcbRenameBaselineClockBinding: (value: unknown): object => { assert.equal(value, baselineValue); return { proof }; },
    collectCurrentPcbRenameStartupObservation: (selected: unknown, value: unknown): Promise<object> => {
      assert.equal(selected, engine); assert.equal(value, generation); assert.equal(scoped, true); calls.push("startup.once"); return Promise.resolve(startup);
    },
    collectCurrentPcbAgedSqlClock: (selected: unknown, value: unknown, observedReference: unknown, observedStartup: unknown): Promise<object> => {
      assert.equal(selected, engine); assert.equal(value, generation); assert.equal(observedReference, reference); assert.equal(observedStartup, startup);
      assert.equal(scoped, true); calls.push("clock.once"); return Promise.resolve(clock);
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentPcbRenameOperationCoordinator;`, context); assert.equal(typeof constructor, "function");
  assert.ok(typeof constructor === "function"); const instance = object(Reflect.construct(constructor, [engine, opener]));
  const invoke = (name: string, argument: unknown): unknown => { const method = instance[name]; assert.equal(typeof method, "function");
    assert.ok(typeof method === "function"); return Reflect.apply(method, instance, [argument]) as unknown; };
  return { calls, state, run: async request => object(await invoke("run", request)), inspect: (): Value => object(invoke("inspect", ID)) };
}
type Harness = Awaited<ReturnType<typeof fixture>>;
function step(phase: unknown): Value {
  assert.equal(typeof phase, "string");
  if (phase === "rename-write") { return { expectedPhase: phase, confirmWrite: true, acceptPcbRename: true, confirmDisposableProject: true }; }
  if (String(phase).endsWith("-close")) { return { expectedPhase: phase, confirmNormalClose: true, acceptUnknownFileEffects: true }; }
  if (["baseline-relaunch", "baseline-open-project", "verification-start", "verification-open"].includes(String(phase))) {
    return { expectedPhase: phase, acceptNormalOpenEffects: true };
  }
  if (phase === "baseline-prepare-clock") { return { expectedPhase: phase, acceptScratchProcessEffects: true }; }
  return { expectedPhase: phase };
}
function advance(value: Harness): Promise<Value> { return value.run({ action: "advance", operationId: ID, step: step(value.inspect()["nextPhase"]) }); }
async function reach(value: Harness, phase: string): Promise<void> {
  for (let index = 0; index < 30 && value.inspect()["nextPhase"] !== phase; index += 1) { await advance(value); }
  assert.equal(value.inspect()["nextPhase"], phase);
}

void test("PCB public schema requires exact phase acknowledgments and excludes alternate source or writer inputs", () => {
  assert.equal(validateCurrentPcbRenameOperationArguments(BEGIN)["valid"], true);
  for (const value of [{ ...BEGIN, code: "arbitrary" }, { ...BEGIN, path: "/another/project.eprj2" }, { ...BEGIN, openingOperationId: ID },
    { ...BEGIN, target: { ...TARGET, symbolUuid: "e".repeat(16) } }, { ...BEGIN, desiredTitle: "INPUT" },
    { action: "advance", operationId: ID, step: { expectedPhase: "rename-write", confirmWrite: true } },
    { action: "advance", operationId: ID, step: { ...step("baseline-prepare-clock"), proof: {} } }]) {
    assert.equal(validateCurrentPcbRenameOperationArguments(value)["valid"], false);
  }
  const discovery = queryCurrentPcbRenameOperation({ includeSchemas: true });
  assert.equal(discovery["executionAuthorized"], false); assert.equal(discovery["connectedValidation"], false);
  assert.equal(discovery["historicalConnectedValidation"], "installed195000-disposable-pcb-title-only-lifecycle");
  assert.ok(isRecord(discovery["inputSchema"]));
});

void test("PCB public phases complete only the original forward lifecycle and actual saved metadata result", async () => {
  const value = await fixture(); await value.run(BEGIN);
  await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
  await reach(value, "completed"); assert.equal(value.inspect()["renameVerified"], true);
  assert.deepEqual(value.calls, ["opening.transfer", "baseline.capture", "baseline.close", "baseline.termination", "scratch.once", "generation.relaunch",
    "generation.admit", "generation.caches", "generation.open", "startup.once", "clock.once", "writer.execute", "writer.close", "writer.finish",
    "verification.start", "verification.admit", "verification.caches", "verification.open", "verification.read", "verification.close", "verification.finish"]);
  await assert.rejects(value.run(BEGIN)); await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }));
});

void test("PCB public phases repeat only pending observations and never complete missing saved proof", async () => {
  const value = await fixture(); await value.run(BEGIN); await reach(value, "baseline-observe-termination");
  value.state.pendingTermination = true; await advance(value); assert.equal(value.inspect()["nextPhase"], "baseline-observe-termination");
  await advance(value); await reach(value, "baseline-admit"); value.state.pendingAuthentication = true;
  await advance(value); assert.equal(value.inspect()["nextPhase"], "baseline-admit"); await advance(value);
  await reach(value, "verification-finish"); value.state.metadata = false;
  await assert.rejects(advance(value)); assert.equal(value.inspect()["renameVerified"], false); assert.equal(value.inspect()["nextPhase"], "stopped");
  const incomplete = await fixture(); await incomplete.run(BEGIN); await reach(incomplete, "verification-finish"); incomplete.state.invariant = false;
  await assert.rejects(advance(incomplete)); assert.equal(incomplete.inspect()["renameVerified"], false);
});

void test("PCB public stopped or thrown write stage keeps the writer close owner and forbids replay", async () => {
  for (const returned of [false, true]) {
    const value = await fixture(); await value.run(BEGIN); await reach(value, "rename-write");
    if (returned) { value.state.returnedFailure = true; } else { value.state.failure = "writer.execute"; }
    await assert.rejects(advance(value)); assert.equal(value.inspect()["cleanupOwner"], "writer"); assert.equal(value.inspect()["nextPhase"], "cleanup-close");
    await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
    value.state.failure = undefined; await advance(value); await advance(value);
    assert.equal(value.inspect()["nextPhase"], "stopped"); assert.equal(value.inspect()["renameVerified"], false);
    assert.equal(value.calls.filter(call => call === "writer.execute").length, 1);
  }
  const historical = await fixture(); const result = await historical.run({ action: "inspect", operationId: ID });
  assert.equal(result["historicalOnly"], true); assert.equal(result["originalOwnerRetained"], false); assert.equal(result["renameVerified"], false);
});

void test("PCB cleanup is serialized, irreversible and selects only original capture or closed retirement", async () => {
  const value = await fixture(); await value.run(BEGIN);
  const gate = Promise.withResolvers<boolean>(); value.state.cleanupGate = gate.promise;
  const pending = value.run({ action: "cleanup", operationId: ID, confirmAbort: true });
  const inspection = await value.run({ action: "inspect", operationId: ID });
  assert.equal(inspection["busy"], true); assert.equal(inspection["cleanupRequested"], true);
  assert.equal(inspection["nextPhase"], "stopped"); assert.equal(inspection["executionAuthorized"], false);
  assert.equal(value.calls.includes("baseline.request-cleanup"), false);
  await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("baseline-close") }), /already running/u);
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }), /already running/u);
  await assert.rejects(value.run(BEGIN), /already running/u); gate.resolve(true); await pending;
  assert.equal(value.inspect()["nextPhase"], "cleanup-close");
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }));
  await advance(value); await advance(value); assert.equal(value.inspect()["nextPhase"], "stopped"); assert.equal(value.inspect()["renameVerified"], false);
  assert.equal(value.calls.includes("writer.execute"), false);

  const closed = await fixture(); await closed.run(BEGIN); await reach(closed, "baseline-prepare-clock");
  await closed.run({ action: "cleanup", operationId: ID, confirmAbort: true });
  assert.equal(closed.inspect()["nextPhase"], "cleanup-retire-closed"); await advance(closed);
  assert.equal(closed.calls.filter(call => call === "baseline.close").length, 1); assert.equal(closed.calls.includes("scratch.once"), false);

  const opening = await fixture(); opening.state.failure = "opening.transfer"; await assert.rejects(opening.run(BEGIN), /opening transfer refused/u);
  assert.equal(opening.inspect()["nextPhase"], "cleanup-capture"); opening.state.failure = undefined;
  await advance(opening); assert.equal(opening.inspect()["nextPhase"], "cleanup-close"); await advance(opening); await advance(opening);
  assert.equal(opening.inspect()["renameVerified"], false); assert.equal(opening.calls.filter(call => call === "opening.transfer").length, 1);
  assert.equal(opening.calls.includes("baseline.capture"), false); assert.equal(opening.calls.includes("baseline.cleanup-capture"), true);
});

void test("PCB inspect returns a detached busy snapshot while the original scratch phase remains pending", async () => {
  const value = await fixture(); await value.run(BEGIN); await reach(value, "baseline-prepare-clock");
  const gate = Promise.withResolvers<boolean>(), started = Promise.withResolvers<boolean>();
  value.state.scratchGate = gate.promise; value.state.scratchStarted = (): void => { started.resolve(true); };
  const pending = advance(value); await started.promise;
  try {
    const calls = [...value.calls], inspection = await value.run({ action: "inspect", operationId: ID });
    assert.equal(inspection["busy"], true); assert.equal(inspection["nextPhase"], "stopped");
    assert.equal(inspection["originalOwnerRetained"], true); assert.equal(inspection["renameVerified"], false);
    assert.equal(inspection["executionAuthorized"], false); assert.equal(inspection["replayAllowed"], false);
    assert.deepEqual(structuredClone(inspection["attemptedPhases"]), ["baseline-begin", "baseline-close", "baseline-observe-termination", "baseline-prepare-clock"]);
    assert.ok(Array.isArray(inspection["attemptedPhases"])); inspection["attemptedPhases"].push("forged");
    assert.notDeepEqual(value.inspect()["attemptedPhases"], inspection["attemptedPhases"]);
    for (const request of [BEGIN, { action: "advance", operationId: ID, step: step("baseline-prepare-clock") },
      { action: "cleanup", operationId: ID, confirmAbort: true }]) { await assert.rejects(value.run(request), /already running/u); }
    await assert.rejects(value.run({ action: "inspect", operationId: ID, confirmWrite: true }));
    assert.deepEqual(value.calls, calls);
  } finally { gate.resolve(true); await pending; }
  const completed = await value.run({ action: "inspect", operationId: ID });
  assert.equal(completed["busy"], false); assert.equal(completed["nextPhase"], "baseline-relaunch");
  assert.equal(value.calls.filter(call => call === "scratch.once").length, 1);
});

void test("PCB cleanup skips an uncommitted writer reservation and never offers a consumed release again", async () => {
  const uncommitted = await fixture(); await uncommitted.run(BEGIN); await reach(uncommitted, "rename-write");
  uncommitted.state.failure = "writer.transfer-before"; await assert.rejects(advance(uncommitted), /never committed/u);
  assert.equal(uncommitted.inspect()["cleanupOwner"], "generation"); assert.equal(uncommitted.inspect()["nextPhase"], "cleanup-close");
  uncommitted.state.failure = undefined; await advance(uncommitted); await advance(uncommitted);
  assert.deepEqual(uncommitted.calls.slice(-2), ["generation.close", "generation.finish"]);
  assert.equal(uncommitted.calls.includes("writer.close"), false); assert.equal(uncommitted.inspect()["renameVerified"], false);

  for (const [phase, owner] of [["rename-observe-termination", "writer"], ["verification-finish", "verification"]] as const) {
    const consumed = await fixture(); await consumed.run(BEGIN); await reach(consumed, phase);
    consumed.state.failure = `${owner}.release`; await assert.rejects(advance(consumed), /consumed release/u);
    assert.equal(consumed.inspect()["cleanupOwner"], owner); assert.equal(consumed.inspect()["nextPhase"], "stopped");
    await consumed.run({ action: "cleanup", operationId: ID, confirmAbort: true }); assert.equal(consumed.inspect()["nextPhase"], "stopped");
    await assert.rejects(consumed.run({ action: "advance", operationId: ID, step: step("cleanup-observe-termination") }));
    assert.equal(consumed.calls.filter(call => call === `${owner}.finish`).length, 1); assert.equal(consumed.inspect()["renameVerified"], false);
  }
});
